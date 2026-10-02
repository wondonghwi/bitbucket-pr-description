// Used only by the local demo server. Never bundled into the extension.
import {
  parsePullRequest as parse,
  findActionAnchor,
} from "../src/bitbucket.js";
export { findActionAnchor };

export function parsePullRequest(href) {
  const local = new URL(href);
  if (local.origin !== "http://127.0.0.1:4173") return null;
  return parse(`https://bitbucket.org${local.pathname}${local.hash}`);
}

export async function loadDescription(pr, signal) {
  await new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new Error("Aborted"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, 200);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
  return {
    title: "Keep search results in sync with the latest query",
    raw: "## Why\n\nSlower responses could replace results from a newer search.\n\n## What changed\n\n- Cancel the previous request when the query changes.\n- Ignore results from an outdated request.\n- Keep the last results visible while loading.\n\n## Review focus\n\n```js\nif (requestId !== latestRequestId) return;\n```\n\n## Validation\n\n- [x] Rapid typing keeps the latest results.\n- [x] Clearing the query resets the list.\n- [x] Network errors show a retry action.\n\n## Notes\n\nThis is fictional demo content. No repository data is used.",
    html: '<h2>Why</h2><p>Slower responses could replace results from a newer search.</p><h2>What changed</h2><ul><li>Cancel the previous request when the query changes.</li><li>Ignore results from an outdated request.</li><li>Keep the last results visible while loading.</li></ul><h2>Review focus</h2><pre><code>if (requestId !== latestRequestId) return;</code></pre><h2>Validation</h2><ul><li><input type="checkbox" checked> Rapid typing keeps the latest results.</li><li><input type="checkbox" checked> Clearing the query resets the list.</li><li><input type="checkbox" checked> Network errors show a retry action.</li></ul><h2>Notes</h2><blockquote><p>This is fictional demo content. No repository data is used.</p></blockquote>',
  };
}
