const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "GitHub";
pptx.company = "GitHub";
pptx.subject = "Stacked, not stalled site architecture";
pptx.title = "Stacked, not stalled — Architecture";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Arial Black",
  bodyFontFace: "Aptos",
  lang: "en-US"
};
pptx.defineLayout({ name: "STACKED_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "STACKED_WIDE";

const C = { ink: "0D1D3A", deep: "071126", paper: "F5F3EE", white: "FFFDF8", acid: "D7FF34", blue: "4487FF", muted: "AAB7CE", green: "4C7900", line: "8B9AB3" };
const S = pptx.ShapeType;

function rect(slide, x, y, w, h, fill, line = fill) {
  slide.addShape(S.rect, { x, y, w, h, fill: { color: fill }, line: { color: line, transparency: line === fill ? 100 : 0 }, margin: 0 });
}

function text(slide, value, x, y, w, h, options = {}) {
  slide.addText(value, {
    x, y, w, h, margin: 0,
    fontFace: options.fontFace || "Aptos",
    fontSize: options.fontSize || 16,
    color: options.color || C.ink,
    bold: options.bold || false,
    breakLine: false,
    valign: options.valign || "mid",
    fit: "shrink",
    ...options
  });
}

function title(slide, label, heading, dark = false) {
  const foreground = dark ? C.white : C.ink;
  text(slide, label.toUpperCase(), .62, .5, 3.7, .2, { fontFace: "Courier New", fontSize: 8, color: dark ? C.acid : C.blue, bold: true, charSpacing: 1.3 });
  text(slide, heading, .62, .82, 11.7, .65, { fontFace: "Arial Black", fontSize: 30, color: foreground, bold: true, breakLine: false });
}

function footer(slide, page, dark = false) {
  text(slide, "STACKED / NOT STALLED", .62, 7.04, 3.2, .16, { fontFace: "Courier New", fontSize: 7, color: dark ? C.muted : "536078", bold: true, charSpacing: .8 });
  text(slide, String(page).padStart(2, "0"), 12.1, 7.04, .6, .16, { fontFace: "Courier New", fontSize: 7, color: dark ? C.acid : C.blue, bold: true, align: "right" });
}

function line(slide, x1, y1, x2, y2, color = C.blue, width = 1.5, dash = "solid") {
  slide.addShape(S.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color, width, dashType: dash, beginArrowType: "none", endArrowType: "triangle" } });
}

function node(slide, x, y, w, h, number, heading, copy, opts = {}) {
  rect(slide, x, y, w, h, opts.fill || C.white, opts.border || C.ink);
  rect(slide, x + .22, y + .22, .42, .42, opts.accent || C.acid);
  text(slide, number, x + .22, y + .25, .42, .18, { fontFace: "Courier New", fontSize: 8, color: C.ink, bold: true, align: "center" });
  text(slide, heading, x + .22, y + .82, w - .44, .35, { fontSize: 15, color: opts.text || C.ink, bold: true });
  text(slide, copy, x + .22, y + 1.28, w - .44, h - 1.5, { fontSize: 9.5, color: opts.copy || "536078", breakLine: false, valign: "top", fit: "shrink" });
}

// 1. Cover
{
  const slide = pptx.addSlide();
  slide.background = { color: C.deep };
  rect(slide, 0, 0, 13.333, 7.5, C.deep);
  for (let x = 7.3; x < 13.4; x += .9) line(slide, x, .55, x, 6.95, "1F3764", .5, "dash");
  for (let y = .55; y < 7; y += .9) line(slide, 7.25, y, 13.1, y, "1F3764", .5, "dash");
  text(slide, "STACKED / NOT STALLED", .72, .7, 5.2, .26, { fontFace: "Courier New", fontSize: 10, color: C.acid, bold: true, charSpacing: 1.6 });
  text(slide, "Architecture\nfor a living launch site.", .72, 1.42, 6.5, 1.85, { fontFace: "Arial Black", fontSize: 38, color: C.white, bold: true, breakLine: false, valign: "top", breakLine: true });
  text(slide, "A static GitHub Pages experience that teaches the workflow, keeps its platform story fresh, and ships through a lightweight delivery system.", .72, 3.78, 5.7, .75, { fontSize: 15, color: "D2DBE8", valign: "top" });
  text(slide, "AUGUST 2026", .72, 6.36, 2, .2, { fontFace: "Courier New", fontSize: 9, color: C.muted, bold: true, charSpacing: 1.1 });
  // Stack illustration
  const cards = [
    { y: 1.3, title: "Preference UI", id: "PR #418", fill: C.white },
    { y: 2.62, title: "API endpoint", id: "PR #417", fill: C.white },
    { y: 3.94, title: "Data model", id: "PR #416", fill: C.white }
  ];
  cards.forEach((card, index) => {
    rect(slide, 8.4, card.y, 3.35, .86, card.fill);
    text(slide, card.id, 8.63, card.y + .16, 1.1, .13, { fontFace: "Courier New", fontSize: 7, color: C.blue, bold: true });
    text(slide, card.title, 8.63, card.y + .4, 2.15, .19, { fontSize: 13, bold: true });
    if (index < 2) line(slide, 10.05, card.y + .87, 10.05, cards[index + 1].y, C.acid, 2);
  });
  text(slide, "main", 8.58, 5.34, .5, .16, { fontFace: "Courier New", fontSize: 8, color: C.acid, bold: true });
}

// 2. Visitor experience
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  title(slide, "01 / Experience architecture", "A story that becomes a workflow.");
  text(slide, "The site is intentionally static, but never passive. Each surface has one job in the visitor journey.", .62, 1.62, 7.2, .35, { fontSize: 14, color: "536078" });
  const stages = [
    ["01", "Understand", "A visual argument reframes the “giant PR” problem."],
    ["02", "Manipulate", "The simulator exposes one layer, its diff, and its merge state."],
    ["03", "Practice", "The workshop turns the concept into local terminal steps."]
  ];
  stages.forEach((stage, index) => {
    const x = .62 + index * 4.2;
    node(slide, x, 2.45, 3.5, 2.4, stage[0], stage[1], stage[2], { fill: C.white, border: C.ink });
    if (index < 2) line(slide, x + 3.5, 3.65, x + 4.06, 3.65, C.blue, 1.5);
  });
  rect(slide, .62, 5.65, 12.05, .63, C.ink);
  text(slide, "Conversion is the next useful action: “try the simulator” → “take the workshop” → official GitHub docs.", .9, 5.86, 11.5, .18, { fontSize: 11.5, color: C.white, bold: true, align: "center" });
  footer(slide, 2);
}

// 3. Front-end architecture
{
  const slide = pptx.addSlide();
  slide.background = { color: C.deep };
  title(slide, "02 / Front-end architecture", "Small files. Clear responsibilities.", true);
  const files = [
    ["index.html", "Narrative, simulator shell, latest-news region", C.acid],
    ["workshop.html", "Hands-on learning route and copyable commands", C.blue],
    ["script.js", "Simulator state + fetches static changelog data", C.white],
    ["styles.css", "Responsive visual system and accessible state styling", C.white]
  ];
  files.forEach((file, index) => {
    const x = .65 + (index % 2) * 6.15;
    const y = 1.85 + Math.floor(index / 2) * 1.75;
    rect(slide, x, y, 5.45, 1.25, "112647", "30517C");
    rect(slide, x, y, .12, 1.25, file[2]);
    text(slide, file[0], x + .42, y + .25, 1.65, .22, { fontFace: "Courier New", fontSize: 11, color: C.acid, bold: true });
    text(slide, file[1], x + .42, y + .66, 4.55, .28, { fontSize: 11, color: "D2DBE8", valign: "top" });
  });
  text(slide, "Browser-only state", .7, 5.65, 2.1, .2, { fontFace: "Courier New", fontSize: 9, color: C.acid, bold: true });
  text(slide, "The stack simulator is deliberately ephemeral: selected layer, review readiness, and merge feedback live in memory. No identity, API keys, or server state are needed.", .7, 5.98, 10.7, .4, { fontSize: 12, color: C.white, valign: "top" });
  footer(slide, 3, true);
}

// 4. Fresh content pipeline
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  title(slide, "03 / Fresh content pipeline", "The launch story stays current without a runtime backend.");
  const flow = [
    ["GitHub Changelog\nRSS feed", "github.blog/changelog/feed/", C.blue],
    ["Scheduled GitHub\nAction", "daily + manual dispatch", C.acid],
    ["Static JSON\nsnapshot", "data/changelog.json", C.white],
    ["Website\nrender", "script.js fetch + fallback", C.white],
    ["GitHub Pages", "main / root", C.ink]
  ];
  flow.forEach((step, index) => {
    const x = .65 + index * 2.53;
    const isDark = index === 4;
    rect(slide, x, 2.35, 2.05, 2.15, step[2], isDark ? C.ink : C.ink);
    text(slide, step[0], x + .18, 2.73, 1.68, .52, { fontSize: 15, color: isDark ? C.white : C.ink, bold: true, align: "center", valign: "mid" });
    text(slide, step[1], x + .17, 3.66, 1.7, .25, { fontFace: "Courier New", fontSize: 7.5, color: isDark ? C.acid : "536078", align: "center" });
    if (index < flow.length - 1) line(slide, x + 2.08, 3.43, x + 2.45, 3.43, C.blue, 1.5);
  });
  text(slide, "Failure mode is safe by design.", .65, 5.33, 3.2, .23, { fontSize: 15, bold: true });
  text(slide, "If the static data cannot load, the page retains the verified launch announcement rather than presenting an empty news surface.", .65, 5.68, 9.6, .32, { fontSize: 12, color: "536078" });
  footer(slide, 4);
}

// 5. CI/CD
{
  const slide = pptx.addSlide();
  slide.background = { color: C.deep };
  title(slide, "04 / CI/CD", "A lightweight gate and a deliberate deployment.", true);
  const lanes = [
    { y: 1.85, label: "Pull request", color: C.blue, steps: ["Checkout", "Node 22", "Syntax checks", "HTML structure", "Data shape"] },
    { y: 3.4, label: "Main branch", color: C.acid, steps: ["Push", "Validate static site", "Upload Pages artifact", "Deploy to HTTPS site"] },
    { y: 4.95, label: "Daily schedule", color: C.white, steps: ["Fetch official feed", "Write JSON", "Commit only if changed", "Pages refresh"] }
  ];
  lanes.forEach((lane) => {
    text(slide, lane.label.toUpperCase(), .68, lane.y + .35, 1.45, .18, { fontFace: "Courier New", fontSize: 8, color: lane.color, bold: true, charSpacing: .8 });
    lane.steps.forEach((step, index) => {
      const x = 2.25 + index * 2.08;
      rect(slide, x, lane.y, 1.72, .83, "112647", "30517C");
      text(slide, step, x + .12, lane.y + .22, 1.48, .28, { fontSize: 9.3, color: C.white, bold: true, align: "center", valign: "mid" });
      if (index < lane.steps.length - 1) line(slide, x + 1.75, lane.y + .415, x + 2.0, lane.y + .415, lane.color, 1.2);
    });
  });
  text(slide, "No application compilation is required; validated root assets become the Pages artifact.", .68, 6.37, 8, .22, { fontSize: 11.5, color: "D2DBE8" });
  footer(slide, 5, true);
}

// 6. Operational boundaries
{
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };
  title(slide, "05 / Operational boundaries", "The system remains intentionally boring where it matters.");
  const boundaries = [
    ["No runtime secrets", "The browser reads only committed static assets. The scheduled workflow uses GitHub’s scoped token."],
    ["No client-side scraping", "The workflow fetches the source feed once, then visitors consume a local JSON snapshot."],
    ["No silent content failure", "The UI carries a meaningful launch-news fallback if the optional JSON cannot load."],
    ["No custom deploy machinery", "GitHub Pages deploys the trusted default branch from the repository root."],
  ];
  boundaries.forEach((item, index) => {
    const x = .65 + (index % 2) * 6.1;
    const y = 2.0 + Math.floor(index / 2) * 2.02;
    rect(slide, x, y, 5.42, 1.5, C.white, C.ink);
    rect(slide, x + .22, y + .28, .3, .3, C.acid);
    text(slide, item[0], x + .72, y + .25, 4.25, .22, { fontSize: 15, bold: true });
    text(slide, item[1], x + .72, y + .69, 4.25, .46, { fontSize: 10.5, color: "536078", valign: "top" });
  });
  text(slide, "Architecture principle: static by default, automation where freshness adds genuine value.", .65, 6.28, 10.6, .3, { fontSize: 14, color: C.blue, bold: true });
  footer(slide, 6);
}

// 7. Closing
{
  const slide = pptx.addSlide();
  slide.background = { color: C.acid };
  rect(slide, 0, 0, 13.333, 7.5, C.acid);
  text(slide, "THE LAUNCH SITE IS A PRODUCT DEMONSTRATION.", .75, .75, 6.8, .22, { fontFace: "Courier New", fontSize: 10, color: C.ink, bold: true, charSpacing: 1.3 });
  text(slide, "Teach the stack.\nKeep it current.\nShip it simply.", .75, 1.53, 8.2, 2.3, { fontFace: "Arial Black", fontSize: 38, color: C.ink, bold: true, valign: "top" });
  rect(slide, .75, 5.38, 5.9, .88, C.ink);
  text(slide, "jamesmontemagno.github.io/stacked-pr-launch/", 1.0, 5.72, 5.38, .18, { fontFace: "Courier New", fontSize: 10, color: C.white, bold: true, align: "center" });
  text(slide, "Built on GitHub Pages · Content refreshed by GitHub Actions · Source: official GitHub Changelog RSS", .76, 6.66, 9.8, .18, { fontSize: 10.5, color: "315BA7", bold: true });
  footer(slide, 7);
}

pptx.writeFile({ fileName: "Stacked-PR-Launch-Architecture.pptx" });
