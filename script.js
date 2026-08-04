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

const state = {
  current: "data",
  ready: new Set(),
  merged: new Set(),
  created: new Set(),
  building: false,
  merging: false
};
const $ = (selector) => document.querySelector(selector);
const motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const layerOrder = ["data", "api", "ui"];
const wait = (duration) => new Promise((resolve) => setTimeout(resolve, motionReduced.matches ? 0 : duration));

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
    $("#news-meta").textContent = `GITHUB CHANGELOG · ${item.type.toUpperCase()} · ${item.date}`;
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
    const isCreated = state.created.has(item.dataset.pr);
    item.classList.toggle("active", active);
    item.classList.toggle("created", isCreated);
    item.classList.toggle("ready", state.ready.has(item.dataset.pr));
    item.classList.toggle("merged", state.merged.has(item.dataset.pr));
    item.disabled = !isCreated || state.building || state.merging;
    item.setAttribute("aria-selected", active);
    item.querySelector("em").textContent = state.merged.has(item.dataset.pr) ? "✓" : state.ready.has(item.dataset.pr) ? "●" : isCreated ? "+" : "·";
  });
  $("#stack-list").classList.toggle("is-unbuilt", state.created.size === 0);
  $("#stack-list").classList.toggle("is-building", state.building);
  $("#stack-list").classList.toggle("is-merging", state.merging);
  $("#ready-count").textContent = `${state.ready.size} / 3 READY`;
  $("#ready-button").disabled = !state.created.has(key) || state.building || state.merging || state.merged.has(key);
  $("#merge-button").disabled = state.ready.size === 0 || state.building || state.merging;
}

function updateProcess(step, copy) {
  $("#process-step").textContent = step;
  $("#process-copy").textContent = copy;
}

async function buildStack() {
  if (state.building || state.merging) return;
  state.building = true;
  state.ready.clear();
  state.merged.clear();
  state.created.clear();
  $("#merge-message").textContent = "";
  $("#build-button").disabled = true;
  $("#build-button").classList.add("is-running");
  renderLayer("data");
  updateProcess("CREATING FOUNDATION", "Branch data-model from main. The first pull request targets main.");
  await wait(320);

  for (const [index, key] of layerOrder.entries()) {
    state.created.add(key);
    renderLayer(key);
    const item = document.querySelector(`[data-pr="${key}"]`);
    item.classList.add("just-created");
    await wait(650);
    item.classList.remove("just-created");
    if (index < layerOrder.length - 1) {
      const next = layerOrder[index + 1];
      updateProcess(`LAYER ${index + 2} OF 3`, `Branch ${next === "api" ? "api-endpoint" : "preference-ui"} from ${key === "data" ? "data-model" : "api-endpoint"}. Its pull request targets the layer below.`);
    }
  }

  state.building = false;
  $("#build-button").disabled = false;
  $("#build-button").classList.remove("is-running");
  $("#build-button").innerHTML = "Replay stack build <span aria-hidden=\"true\">↻</span>";
  updateProcess("STACK CREATED", "Three focused pull requests now form one ordered change. Review any layer independently.");
  renderLayer("ui");
}

document.querySelectorAll(".stack-item").forEach((button) => button.addEventListener("click", () => {
  if (!button.disabled) renderLayer(button.dataset.pr);
}));

$("#build-button")?.addEventListener("click", buildStack);

$("#ready-button")?.addEventListener("click", () => {
  state.ready.add(state.current);
  updateProcess("REVIEW RECORDED", `${layers[state.current].title} is ready. Select another layer or merge through this point.`);
  renderLayer(state.current);
});

$("#merge-button")?.addEventListener("click", async () => {
  if (state.merging) return;
  const target = layerOrder.indexOf(state.current);
  const mergeable = layerOrder.slice(0, target + 1).filter((key) => state.ready.has(key));
  if (!mergeable.length) return;
  state.merging = true;
  renderLayer(state.current);
  updateProcess("MERGE IN MOTION", `Landing ${mergeable.length} ready ${mergeable.length === 1 ? "layer" : "layers"} from the foundation upward.`);

  for (const key of mergeable) {
    const item = document.querySelector(`[data-pr="${key}"]`);
    const mainNode = $(".main-line span");
    const distance = mainNode.getBoundingClientRect().top - item.getBoundingClientRect().top;
    item.style.setProperty("--merge-distance", `${distance}px`);
    item.classList.add("merging");
    await wait(520);
    state.merged.add(key);
    state.ready.delete(key);
    item.classList.remove("merging");
    item.style.removeProperty("--merge-distance");
    item.classList.add("merge-landed");
    await wait(260);
    item.classList.remove("merge-landed");
  }

  state.merging = false;
  $("#merge-message").textContent = `Merged ${mergeable.length} ready ${mergeable.length === 1 ? "layer" : "layers"} through ${layers[state.current].title}. Layers above remain open and retarget automatically.`;
  updateProcess("MERGE COMPLETE", "The selected layers landed on main. Any unmerged layers above stay open and retarget automatically.");
  renderLayer(state.current);
});

document.querySelectorAll(".terminal-code code[data-language]").forEach((code) => {
  const source = code.innerText;
  code.textContent = source;
  code.classList.add(`language-${code.dataset.language}`);
  window.Prism?.highlightElement(code);
});

document.querySelectorAll(".copy-button").forEach((button) => button.addEventListener("click", async () => {
  const originalLabel = button.textContent;
  const target = button.dataset.target ? document.querySelector(`#${button.dataset.target} code`) : null;
  const copyText = button.dataset.copy || target?.innerText
    .split("\n")
    .map((line) => line.replace(/^\$\s?/, ""))
    .join("\n");
  if (!copyText) return;
  try {
    await navigator.clipboard.writeText(copyText.replace(/&#10;/g, "\n"));
    button.textContent = "Copied";
    setTimeout(() => { button.textContent = originalLabel; }, 1500);
  } catch {
    button.textContent = "Copy manually";
  }
}));

const workshopSteps = ["prepare", "model", "api", "ui", "submit", "review"];
const completedWorkshopSteps = new Set(JSON.parse(localStorage.getItem("stacked-workshop-progress") || "[]"));

function renderWorkshopProgress() {
  const progressBar = $("#workshop-progress-bar");
  if (!progressBar) return;
  const completed = workshopSteps.filter((step) => completedWorkshopSteps.has(step)).length;
  $("#workshop-progress-label").textContent = `${completed} of ${workshopSteps.length} complete`;
  progressBar.style.transform = `scaleX(${completed / workshopSteps.length})`;
  document.querySelectorAll(".checkpoint-button").forEach((button) => {
    const isComplete = completedWorkshopSteps.has(button.dataset.checkpoint);
    button.classList.toggle("complete", isComplete);
    button.textContent = isComplete ? "Checkpoint complete" : button.dataset.originalLabel;
  });
  document.querySelectorAll(".lesson-link[data-step]").forEach((link) => {
    link.classList.toggle("complete", completedWorkshopSteps.has(link.dataset.step));
  });
}

document.querySelectorAll(".checkpoint-button").forEach((button) => {
  button.dataset.originalLabel = button.textContent;
  button.addEventListener("click", () => {
    const step = button.dataset.checkpoint;
    if (completedWorkshopSteps.has(step)) completedWorkshopSteps.delete(step);
    else completedWorkshopSteps.add(step);
    localStorage.setItem("stacked-workshop-progress", JSON.stringify([...completedWorkshopSteps]));
    renderWorkshopProgress();
  });
});

const workshopLessons = document.querySelectorAll(".lesson[id]");
if (workshopLessons.length) {
  const lessonObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    document.querySelectorAll(".lesson-link").forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  }, { rootMargin: "-15% 0px -65%", threshold: [0, .25, .5] });
  workshopLessons.forEach((lesson) => lessonObserver.observe(lesson));
}

renderWorkshopProgress();

if ($("#diff")) {
  renderLayer("data");
  const simulator = $("#simulator");
  if (motionReduced.matches) {
    buildStack();
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        buildStack();
      }
    }, { threshold: .32 });
    observer.observe(simulator);
  }
}

loadLatestChangelog();
