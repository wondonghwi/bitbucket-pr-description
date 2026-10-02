import {
  findActionAnchor,
  loadDescription,
  parsePullRequest,
} from "./bitbucket.js";
import { renderDescription } from "./render.js";
import styles from "./panel.css";
import { highlightMatches } from "./search.js";

const VERSION =
  typeof __APP_VERSION__ === "undefined" ? "dev" : __APP_VERSION__;

const HOST_ID = "bbpd-extension";
if (!document.getElementById(HOST_ID)) start();

function start() {
  const host = document.createElement("div");
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = styles;
  shadow.append(style);

  const actionHost = document.createElement("span");
  actionHost.id = "bbpd-action";
  const actionShadow = actionHost.attachShadow({ mode: "open" });
  const actionStyle = style.cloneNode(true);
  const trigger = button("Description", "toggle");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-label", "Toggle pull request description");
  actionShadow.append(actionStyle, trigger);

  const panel = document.createElement("aside");
  panel.className = "panel";
  panel.setAttribute("aria-label", "Pull request description");
  panel.hidden = true;
  const handle = document.createElement("div");
  handle.className = "resize";
  handle.tabIndex = 0;
  handle.setAttribute("role", "separator");
  handle.setAttribute("aria-orientation", "vertical");
  handle.setAttribute("aria-label", "Resize description panel");
  const header = document.createElement("header");
  const eyebrow = text("div", "REVIEW COMPANION", "eyebrow");
  const heading = text("h2", "Description");
  const close = button("×", "icon-button");
  close.setAttribute("aria-label", "Close description");
  close.title = "Close (Esc)";
  const headerText = document.createElement("div");
  headerText.append(eyebrow, heading);
  header.append(headerText, close);

  const context = document.createElement("section");
  context.className = "context";
  const meta = text("div", "", "meta");
  const title = text("h3", "");
  context.append(meta, title);
  const toolbar = document.createElement("div");
  toolbar.className = "toolbar";
  const tabs = document.createElement("div");
  tabs.className = "tabs";
  tabs.setAttribute("role", "group");
  tabs.setAttribute("aria-label", "Description format");
  const read = button("Preview", "tab");
  const raw = button("Markdown", "tab");
  const refresh = button("↻", "icon-button");
  refresh.title = "Refresh description";
  refresh.setAttribute("aria-label", "Refresh description");
  tabs.append(read, raw);
  const copy = button("Copy", "tab");
  copy.setAttribute("aria-label", "Copy Markdown");
  copy.title = "Copy Markdown";
  copy.disabled = true;
  const tools = document.createElement("div");
  tools.className = "tabs";
  tools.append(copy, refresh);
  toolbar.append(tabs, tools);
  const searchBar = document.createElement("div");
  searchBar.className = "search-bar";
  const search = document.createElement("input");
  search.type = "search";
  search.placeholder = "Find in description";
  search.maxLength = 256;
  search.setAttribute("aria-label", "Find in description");
  const count = text("span", "", "search-count");
  count.setAttribute("role", "status");
  const previous = button("↑", "icon-button");
  previous.setAttribute("aria-label", "Previous match");
  const next = button("↓", "icon-button");
  next.setAttribute("aria-label", "Next match");
  previous.disabled = next.disabled = true;
  searchBar.append(search, count, previous, next);
  const notice = text("div", "", "notice");
  notice.setAttribute("role", "status");
  notice.hidden = true;
  const status = text("div", "", "status");
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  const article = document.createElement("article");
  article.className = "description";
  const content = document.createElement("div");
  content.className = "content";
  content.tabIndex = 0;
  content.setAttribute("aria-label", "Description content");
  content.append(status, article);
  const footer = document.createElement("footer");
  const overview = document.createElement("a");
  overview.textContent = "Open Overview ↗";
  overview.target = "_blank";
  overview.rel = "noopener noreferrer";
  const release = document.createElement("a");
  release.textContent = `v${VERSION} · Download latest ↗`;
  release.href =
    "https://github.com/wondonghwi/bitbucket-pr-description/releases/latest";
  release.target = "_blank";
  release.rel = "noopener noreferrer";
  footer.append(overview, release);
  panel.append(
    handle,
    header,
    context,
    toolbar,
    searchBar,
    notice,
    content,
    footer,
  );
  shadow.append(panel);

  const layoutStyle = document.createElement("style");
  layoutStyle.id = "bbpd-layout";
  layoutStyle.textContent = `
    html[data-bbpd-docked] body {
      width: calc(100% - var(--bbpd-width)) !important;
      min-width: 0 !important;
    }
    #bbpd-extension { position: fixed !important; inset: 0 0 0 auto !important;
      width: var(--bbpd-width, 420px) !important; max-width: 100vw !important;
      z-index: 2147483646 !important; pointer-events: none !important; }
    #bbpd-action { display: inline-flex !important; vertical-align: middle !important; margin-right: 8px !important; }
    #bbpd-action[data-floating] { position: fixed !important; top: 16px !important;
      right: 20px !important; z-index: 2147483645 !important; }
    html[data-bbpd-docked] #bbpd-action[data-floating] { right: calc(var(--bbpd-width) + 20px) !important; }
    @media (max-width: 1099px) { #bbpd-action[data-floating] { top: 56px !important; } }
  `;
  document.head.append(layoutStyle);
  document.body.append(host);

  let current = null;
  let anchor = null;
  let opened = false;
  let data = null;
  let mode = "preview";
  let pending = null;
  let requestId = 0;
  let desiredWidth = 420;
  let matches = [];
  let activeMatch = -1;

  function clearSearch() {
    matches = [];
    activeMatch = -1;
    count.textContent = "";
    previous.disabled = next.disabled = true;
  }

  function updateSearch() {
    clearSearch();
    const query = search.value.trim();
    matches = highlightMatches(article, query);
    if (!query) return;
    count.textContent = matches.length ? `0 / ${matches.length}` : "No matches";
    previous.disabled = next.disabled = !matches.length;
    if (matches.length) moveMatch(1);
  }

  function moveMatch(direction) {
    if (!matches.length) return;
    matches[activeMatch]?.removeAttribute("data-active");
    activeMatch = (activeMatch + direction + matches.length) % matches.length;
    const match = matches[activeMatch];
    match.dataset.active = "";
    // Reveal matches in collapsed sections without affecting the Bitbucket page.
    for (
      let parent = match.parentElement;
      parent && parent !== article;
      parent = parent.parentElement
    )
      if (parent.tagName === "DETAILS") parent.open = true;
    match.scrollIntoView?.({ block: "nearest" });
    count.textContent = `${activeMatch + 1} / ${matches.length}`;
  }

  function setWidth(value) {
    desiredWidth = Math.max(320, Math.min(value, 700));
    applyLayout();
  }

  function applyLayout() {
    const wide = window.innerWidth >= 1100;
    const width = Math.min(
      desiredWidth,
      wide ? window.innerWidth * 0.48 : window.innerWidth,
    );
    document.documentElement.style.setProperty("--bbpd-width", `${width}px`);
    document.documentElement.toggleAttribute(
      "data-bbpd-docked",
      opened && wide,
    );
    handle.setAttribute("aria-valuemin", "320");
    handle.setAttribute(
      "aria-valuemax",
      String(Math.min(700, window.innerWidth * 0.48)),
    );
    handle.setAttribute("aria-valuenow", String(Math.round(width)));
    handle.hidden = !wide;
  }

  function setOpen(value, returnFocus = false) {
    opened = value;
    panel.hidden = !value;
    trigger.setAttribute("aria-expanded", String(value));
    applyLayout();
    if (value) {
      copy.disabled = !data?.raw.trim();
      close.focus();
      if (!data && !pending) void reload();
    } else {
      cancelRequest();
      if (returnFocus) trigger.focus();
    }
  }

  function cancelRequest() {
    requestId++;
    pending?.abort();
    pending = null;
    refresh.disabled = false;
    content.removeAttribute("aria-busy");
  }

  function showDescription() {
    read.setAttribute("aria-pressed", String(mode === "preview"));
    raw.setAttribute("aria-pressed", String(mode === "markdown"));
    copy.disabled = !data?.raw.trim();
    clearSearch();
    if (!data) return;
    article.replaceChildren();
    if (!data.raw.trim()) {
      status.textContent = "This pull request has no description yet.";
      status.hidden = false;
      return;
    }
    status.hidden = true;
    if (mode === "markdown") {
      const pre = text("pre", data.raw, "markdown");
      article.append(pre);
    } else {
      article.append(
        renderDescription(
          window,
          data.html,
          data.raw,
          `${location.origin}${current.path}`,
        ),
      );
      if (/<img\b/i.test(data.html)) {
        article.append(
          text(
            "p",
            "Images are hidden to prevent automatic external requests. View them in Overview.",
            "image-note",
          ),
        );
      }
    }
    updateSearch();
  }

  async function reload() {
    if (!current || !opened) return;
    cancelRequest();
    data = null;
    copy.disabled = true;
    notice.hidden = true;
    clearSearch();
    article.replaceChildren();
    status.hidden = false;
    status.textContent = "Loading description…";
    content.setAttribute("aria-busy", "true");
    refresh.disabled = true;
    const controller = new AbortController();
    pending = controller;
    const sequence = requestId;
    const key = current.key;
    const timeout = setTimeout(() => controller.abort("timeout"), 15000);
    try {
      const result = await loadDescription(current, controller.signal);
      if (sequence !== requestId || current?.key !== key || !opened) return;
      data = result;
      title.textContent = data.title;
      showDescription();
    } catch (error) {
      if (sequence !== requestId || current?.key !== key || !opened) return;
      status.hidden = false;
      status.textContent =
        controller.signal.reason === "timeout"
          ? "The request timed out. Refresh to try again."
          : error instanceof TypeError
            ? "Could not reach Bitbucket. Check your connection and sign-in session, then refresh."
            : error.message ||
              "Could not load this description. Open Overview or try refreshing.";
    } finally {
      clearTimeout(timeout);
      if (sequence === requestId) {
        pending = null;
        refresh.disabled = false;
        content.removeAttribute("aria-busy");
      }
    }
  }

  function reconcile() {
    const next = parsePullRequest(location.href);
    if (next?.key !== current?.key) {
      cancelRequest();
      data = null;
      copy.disabled = true;
      notice.hidden = true;
      search.value = "";
      clearSearch();
      article.replaceChildren();
      content.scrollTop = 0;
      current = next;
      if (next) {
        meta.textContent = `${next.repository} / PR #${next.id}`;
        title.textContent = `Pull request #${next.id}`;
        overview.href = `${next.path}/overview`;
        if (opened) void reload();
      } else setOpen(false);
    }
    if (!current) {
      actionHost.remove();
      return;
    }
    if (!host.isConnected) document.body.append(host);
    if (!actionHost.isConnected || !anchor?.isConnected) {
      anchor = findActionAnchor(document);
      if (anchor) {
        actionHost.removeAttribute("data-floating");
        anchor.before(actionHost);
      } else {
        actionHost.setAttribute("data-floating", "");
        if (!actionHost.isConnected) document.body.append(actionHost);
      }
    }
    const theme = document.documentElement.getAttribute("data-color-mode");
    for (const node of [host, actionHost]) {
      if (["dark", "light"].includes(theme)) node.dataset.theme = theme;
      else node.removeAttribute("data-theme");
    }
  }

  trigger.addEventListener("click", () => setOpen(!opened, opened));
  close.addEventListener("click", () => setOpen(false, true));
  refresh.addEventListener("click", () => void reload());
  search.addEventListener("input", updateSearch);
  search.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      moveMatch(event.shiftKey ? -1 : 1);
    }
  });
  previous.addEventListener("click", () => moveMatch(-1));
  next.addEventListener("click", () => moveMatch(1));
  copy.addEventListener("click", async () => {
    if (!data?.raw.trim()) return;
    const key = current.key;
    const sequence = requestId;
    copy.disabled = true;
    let message;
    try {
      await navigator.clipboard.writeText(data.raw);
      message = "Markdown copied.";
    } catch {
      message =
        "Could not copy. Select the text in Markdown view and copy it manually.";
    }
    if (current?.key !== key || sequence !== requestId || !opened) return;
    copy.disabled = !data?.raw.trim();
    notice.textContent = message;
    notice.hidden = false;
  });
  read.addEventListener("click", () => {
    mode = "preview";
    showDescription();
  });
  raw.addEventListener("click", () => {
    mode = "markdown";
    showDescription();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && opened && !event.defaultPrevented)
      setOpen(false, true);
  });
  window.addEventListener("resize", applyLayout);
  handle.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    setWidth(desiredWidth + (event.key === "ArrowLeft" ? 24 : -24));
  });
  handle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    const move = (moveEvent) => setWidth(window.innerWidth - moveEvent.clientX);
    const finish = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", finish);
      handle.removeEventListener("pointercancel", finish);
      handle.removeEventListener("lostpointercapture", finish);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", finish);
    handle.addEventListener("pointercancel", finish);
    handle.addEventListener("lostpointercapture", finish);
  });

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      reconcile();
    });
  }
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-color-mode"],
  });
  window.addEventListener("popstate", schedule);
  // pushState does not emit popstate. Read only the URL, without patching Bitbucket's JS.
  setInterval(() => {
    if (
      !document.hidden &&
      parsePullRequest(location.href)?.key !== current?.key
    )
      schedule();
  }, 1000);
  showDescription();
  applyLayout();
  reconcile();
}

function text(tag, value, className) {
  const node = document.createElement(tag);
  node.textContent = value;
  if (className) node.className = className;
  return node;
}

function button(label, className) {
  const node = text("button", label, className);
  node.type = "button";
  return node;
}
