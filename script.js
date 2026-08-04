const layers = {
  ui: {
    number: "Pull request #418",
    title: "Add notification preference controls",
    description: "A small UI layer that lets people choose how they hear from your product.",
    diff: ["<span class=\"ctx\">  export function NotificationPreferences() {</span>", "<span class=\"add\">+   return &lt;Toggle label=\"Product updates\" /&gt;</span>", "<span class=\"add\">+ }</span>"]
  },
  api: {
    number: "Pull request #417",
    title: "Create notification preferences endpoint",
    description: "A narrow API change that saves the preference selected by the interface above it.",
    diff: ["<span class=\"add\">+ router.patch(\"/preferences/notifications\", updatePreferences)</span>", "<span class=\"ctx\">  router.get(\"/preferences\", getPreferences)</span>"]
  },
  data: {
    number: "Pull request #416",
    title: "Add notification preference fields",
    description: "A focused data-model change: the one foundation every later layer can safely depend on.",
    diff: ["<span class=\"add\">+ notificationProductUpdates: boolean</span>", "<span class=\"add\">+ notificationSecurityAlerts: boolean</span>", "<span class=\"ctx\">  createdAt: Date</span>"]
  }
};

const state = { current: "ui", ready: new Set(), merged: new Set() };
const $ = (selector) => document.querySelector(selector);

async function loadLatestChangelog() {
  const card = $("#news-card");
  if (!card) return;

  try {
    const response = await fetch("data/changelog.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Changelog data unavailable");
    const data = await response.json();
    const item = data.items?.[0];
    if (!item) throw new Error("No changelog items found");

    card.href = item.url;
    $("#news-meta").textContent = `GITHUB CHANGELOG · ${item.date}`;
    $("#news-title").textContent = item.title;
    $("#news-summary").textContent = item.summary;
    $("#news-updated").textContent = `Refreshed ${data.updatedAt} from the official GitHub Changelog feed.`;
  } catch {
    $("#news-updated").textContent = "Showing the launch announcement from the GitHub Changelog.";
  }
}

function renderLayer(key) {
  state.current = key;
  const layer = layers[key];
  $("#pr-number").textContent = layer.number;
  $("#pr-title").textContent = layer.title;
  $("#pr-description").textContent = layer.description;
  $("#diff").innerHTML = layer.diff.map((line) => `<code>${line}</code>`).join("");
  const isReady = state.ready.has(key);
  $("#ready-button").textContent = isReady ? "Ready for review" : "Mark ready for review";
  $("#ready-button").classList.toggle("is-ready", isReady);
  $("#layer-status").textContent = state.merged.has(key) ? "Merged" : isReady ? "Ready to merge" : "Awaiting review";
  document.querySelectorAll(".stack-item").forEach((item) => {
    const active = item.dataset.pr === key;
    item.classList.toggle("active", active);
    item.classList.toggle("ready", state.ready.has(item.dataset.pr));
    item.setAttribute("aria-selected", active);
    item.querySelector("em").textContent = state.merged.has(item.dataset.pr) ? "✓" : state.ready.has(item.dataset.pr) ? "●" : "+";
  });
  $("#ready-count").textContent = `${state.ready.size} / 3 READY`;
  $("#merge-button").disabled = state.ready.size === 0;
}

document.querySelectorAll(".stack-item").forEach((button) => button.addEventListener("click", () => renderLayer(button.dataset.pr)));

$("#ready-button")?.addEventListener("click", () => {
  state.ready.add(state.current);
  renderLayer(state.current);
});

$("#merge-button")?.addEventListener("click", () => {
  const order = ["data", "api", "ui"];
  const target = order.indexOf(state.current);
  const mergeable = order.slice(0, target + 1).filter((key) => state.ready.has(key));
  if (!mergeable.length) return;
  mergeable.forEach((key) => state.merged.add(key));
  $("#merge-message").textContent = `Merged ${mergeable.length} ready ${mergeable.length === 1 ? "layer" : "layers"} through ${layers[state.current].title}. Layers above remain open and retarget automatically.`;
  renderLayer(state.current);
});

document.querySelectorAll(".copy-button").forEach((button) => button.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(button.dataset.copy.replace(/&#10;/g, "\n"));
    button.textContent = "Copied";
    setTimeout(() => { button.textContent = "Copy"; }, 1500);
  } catch {
    button.textContent = "Copy manually";
  }
}));

if ($("#diff")) {
  renderLayer("ui");
}

loadLatestChangelog();
