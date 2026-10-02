export function parsePullRequest(href) {
  const url = new URL(href);
  if (url.origin !== "https://bitbucket.org") return null;
  const match = url.pathname.match(
    /^\/([^/]+)\/([^/]+)\/pull-requests\/(\d+)(?:\/|$)/,
  );
  if (!match) return null;
  const [, workspace, repository, id] = match;
  return {
    key: `${workspace}/${repository}/${id}`,
    id,
    repository,
    path: `/${workspace}/${repository}/pull-requests/${id}`,
    endpoint: `/!api/2.0/repositories/${workspace}/${repository}/pullrequests/${id}?fields=id,title,description,rendered.description,summary`,
  };
}

export async function loadDescription(pr, signal, fetcher = fetch) {
  const response = await fetcher(pr.endpoint, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    redirect: "error",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) {
    const messages = {
      401: "Sign in to Bitbucket, then try again.",
      403: "Your session cannot access this pull request. Check your repository access.",
      404: "This pull request could not be found, or Bitbucket's web endpoint has changed.",
      429: "Bitbucket is limiting requests. Wait a moment before trying again.",
    };
    throw new Error(
      messages[response.status] ||
        "Bitbucket could not load the description. Try again shortly.",
    );
  }
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(
      "Bitbucket returned a sign-in page or an unexpected response. Sign in and reload this page.",
    );
  }
  const data = await response.json();
  const raw =
    data.description ?? data.rendered?.description?.raw ?? data.summary?.raw;
  if (typeof raw !== "string" || String(data.id) !== pr.id) {
    throw new Error(
      "Bitbucket returned an unexpected description format. Open the Overview tab to read it.",
    );
  }
  return {
    title:
      typeof data.title === "string" ? data.title : `Pull request #${pr.id}`,
    raw,
    html: data.rendered?.description?.html ?? data.summary?.html ?? "",
  };
}

export function findActionAnchor(doc) {
  const candidates = [...doc.querySelectorAll("button, [role='button']")];
  const visible = (node) =>
    !node.closest("[hidden], [aria-hidden='true']") &&
    node.getClientRects().length > 0;
  const matchesName = (node, pattern) =>
    [node.getAttribute("aria-label"), node.textContent].some((name) =>
      pattern.test((name || "").trim().replace(/\s+/g, " ")),
    );
  return (
    candidates.find(
      (node) =>
        visible(node) &&
        matchesName(
          node,
          /^(approve|approved|unapprove)(?: pull request)?$|^(승인|승인됨|승인 취소)$/i,
        ),
    ) ||
    candidates.find(
      (node) =>
        visible(node) && matchesName(node, /^(merge(?: pull request)?|병합)$/i),
    )
  );
}
