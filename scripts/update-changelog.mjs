import { writeFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const feedUrl = "https://github.blog/changelog/feed/";
const outputPath = resolve("data/changelog.json");
const maxItems = 6;
const allowedTypes = new Set(["Improvement", "Release"]);

function decode(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&(?:amp|quot|lt|gt);/g, (entity) => ({ "&amp;": "&", "&quot;": "\"", "&lt;": "<", "&gt;": ">" })[entity])
    .replace(/\s+/g, " ")
    .trim();
}

function tag(item, name) {
  const match = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? decode(match[1]) : "";
}

function changelogType(item) {
  const match = item.match(/<category\s+domain=["']changelog-type["'][^>]*>([\s\S]*?)<\/category>/i);
  return match ? decode(match[1]) : "";
}

function formatDate(raw) {
  const date = new Date(raw);
  if (Number.isNaN(date.valueOf())) throw new Error(`Invalid changelog date: ${raw}`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(date)
    .toUpperCase();
}

const response = await fetch(feedUrl, { headers: { "user-agent": "stacked-pr-launch-changelog-bot" } });
if (!response.ok) throw new Error(`GitHub Changelog feed request failed: ${response.status}`);
const feed = await response.text();
const items = [...feed.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
  .map((match) => {
    const item = match[1];
    const title = tag(item, "title");
    const url = tag(item, "link");
    const summary = tag(item, "description").replace(/The post .*? appeared first on .*?\.$/i, "").trim();
    const date = formatDate(tag(item, "pubDate"));
    const type = changelogType(item);
    if (!title || !url || !summary || !type) throw new Error("A changelog item was missing required content");
    return { title, url, date, type, summary };
  })
  .filter(({ type }) => allowedTypes.has(type))
  .slice(0, maxItems);

if (!items.length) throw new Error("GitHub Changelog feed did not contain any release or improvement items");

const payload = {
  updatedAt: formatDate(new Date().toUTCString()),
  items
};

const serialized = `${JSON.stringify(payload, null, 2)}\n`;
let previous = "";
try {
  previous = await readFile(outputPath, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

if (previous !== serialized) {
  await writeFile(outputPath, serialized);
  console.log(`Updated ${outputPath} with ${items.length} changelog items.`);
} else {
  console.log("Changelog data is already current.");
}
