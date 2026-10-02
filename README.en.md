# Bitbucket PR Description

**A Chrome extension that keeps a Bitbucket pull request description beside the code diff.**

Click **Description** next to **Approve** to open a resizable panel on the right. Read the purpose of a change, review notes, and validation steps while reviewing the code.

[한국어 문서](README.md) · [Privacy policy](PRIVACY.md) · MIT License

![Local preview using a fictional pull request](docs/preview.png)

This preview contains invented repository and PR data. It does not contain real user or company information.

## Features

- A Description button immediately before Approve or Unapprove, with a floating fallback when the action area cannot be located.
- Rendered descriptions with headings, lists, code blocks, tables, and read-only task lists.
- **Preview / Markdown** views, a refresh action, and an **Open Overview** link.
- A resizable right panel that reduces the page width on wide screens. Below 1100px it overlays the page.
- Keyboard resizing with **Left / Right** when the resize separator is focused. Close with **Escape** or **×**.
- Light/dark colors based on Bitbucket's `data-color-mode` attribute, falling back to the system preference.
- Support for client-side PR navigation and toolbar replacement.

The extension only reads descriptions. It does not approve, merge, edit, or post anything.

## Compatibility and status

Supports **Bitbucket Cloud at `https://bitbucket.org`**, targeting Chrome 109+. Bitbucket Server, Data Center, and custom domains are outside the current scope. You must be signed in and have permission to view the PR.

Descriptions are requested through Bitbucket's same-origin web-session route, `/!api/2.0/...`. This is not the documented external REST API contract and may change. Bitbucket UI changes or organization policies can also affect integration.

Automated tests and a browser check using a fictional PR have been completed. **Live authenticated public/private PR fetching and placement in the current Bitbucket UI have not yet been verified.**

## Quick install: release ZIP

Download **`bitbucket-pr-description-0.1.0.zip`** from the **Assets** section of the [v0.1.0 preview release](https://github.com/wondonghwi/bitbucket-pr-description/releases/tag/v0.1.0). No Node.js or terminal command is required.

1. Extract the downloaded ZIP.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the extracted folder containing **`manifest.json`**.
5. Reload an open Bitbucket PR page.
6. Click **Description** beside **Approve**.

This extension is not currently listed in the Chrome Web Store. Extract the ZIP first; do not drag it into Chrome. The automatically generated **Source code (zip)** download is not the installation package.

This is a preview version. Live authenticated PR fetching needs to be checked in your installed environment. If fetching fails, use the error shown in the panel to report the problem.

## Install from source and iterate

Use Node.js 24.15+ to build, or at least 22.22.2 on the Node.js 22 line. Node.js is not required while using the installed extension.

1. Clone the repository:

   ```bash
   git clone https://github.com/wondonghwi/bitbucket-pr-description.git
   cd bitbucket-pr-description
   ```

2. Install dependencies and build:

   ```bash
   npm ci
   npm run build
   ```

3. Open `chrome://extensions` and enable **Developer mode**.
4. Click **Load unpacked** and select **`dist`**, not the repository root.
5. Reload your open Bitbucket tabs.

### Apply a code change

1. Edit files in `src`, such as `src/content.js` or `src/panel.css`. Do not edit the generated `dist` files.
2. Run `npm run build` in the project directory.
3. Reload the **Bitbucket PR Description** extension card in `chrome://extensions`.
4. Reload your Bitbucket PR page.
5. Open Description and check the updated behavior.

Run `npm run check` before sharing changes.

## Use

1. Sign in to Bitbucket and open a PR's **Files changed** tab.
2. Click **Description** beside **Approve**.
3. Read the description while reviewing the code.
4. Drag the panel's left edge to resize it on a wide screen, or focus the edge and use **Left / Right**.
5. Use **↻** to fetch a changed description. Closing and reopening reuses the current tab's in-memory result.
6. Close with **Escape** or **×**.

**Open Overview** opens the current PR's Overview in a new tab. Use it to view images or Bitbucket-specific formatting.

## Privacy and permissions

No API token, email, username, or extension account is required. PR URLs, titles, and descriptions are handled only in the current tab's memory. The extension does not use storage, analytics, advertising, an external backend, or remote code.

The browser uses your existing Bitbucket session for same-origin GET requests. The extension does not read cookie values or extract credentials. It requests data only when you first open the panel, refresh it, or move to another PR while the panel is open.

Content scripts run only on `https://bitbucket.org/*`. No `cookies`, `tabs`, `storage`, or `<all_urls>` permission is requested. DOMPurify is bundled locally and strips executable content, styles, frames, SVG, and images. Images are hidden to prevent automatic third-party requests. Links only open when clicked, using `noopener noreferrer`.

A PR description may itself contain personal data entered by its author; this extension displays that content and does not anonymize it. See [PRIVACY.md](PRIVACY.md) for details. Do not publish real PR responses, credentials, or private screenshots in this repository.

## Troubleshooting

| Problem                        | Action                                                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| No button                      | Confirm you are on a PR detail page. Reload the extension and the Bitbucket tab. Check for the floating button at the top right. |
| Authentication or access error | Confirm that Overview opens using the same account. Sign in again if necessary.                                                  |
| Loading fails                  | Check your connection and session, then refresh. Use Overview if the web-session route has changed.                              |
| Stale description              | Click the panel's refresh action.                                                                                                |
| Missing images                 | Expected: automatic image requests are disabled. View images in Overview.                                                        |
| Panel overlaps the code        | Below 1100px, the panel overlays the page. Close it to return to the code.                                                       |
| Changes do not appear          | Rebuild, reload the extension in `chrome://extensions`, then reload Bitbucket.                                                   |

Remove tokens, emails, private repository URLs, and confidential PR content before sharing an issue.

## Development

```bash
npm ci
npm test          # node:test + jsdom behavior and security checks
npm run build    # produce dist/
npm run check    # formatting, tests, build
npm run package  # check, then produce release/bitbucket-pr-description-0.1.0.zip
npm run demo     # fictional preview at http://127.0.0.1:4173
```

The demo uses a separate mock adapter, makes no Bitbucket requests, and is excluded from the production bundle. Tests do not require a real account. ZIP packaging requires the system `zip` command.

`extension/` contains the manifest and icons; `src/` contains the UI, fetch logic, and HTML sanitizer; `scripts/` contains build/package/demo tools; `tests/` contains automated checks; `docs/` contains the fictional preview. Generated `dist/` and `release/` are Git-ignored.

DOMPurify's license is included in `dist/THIRD_PARTY_NOTICES.txt`. This project is MIT-licensed and is not an official Atlassian or Bitbucket product.

## Releases

Source repository: [wondonghwi/bitbucket-pr-description](https://github.com/wondonghwi/bitbucket-pr-description).

Pushing a `v*` tag matching the manifest version runs GitHub Actions checks and publishes the installation ZIP as a preview release. Generated dependencies, build output, local settings, and real PR responses are excluded from Git. Use the fictional preview for public screenshots. See [validation notes](docs/VALIDATION.md) for completed and outstanding checks.

References: [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts), [Bitbucket PR response structure](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-pullrequests/#api-repositories-workspace-repo-slug-pullrequests-pull-request-id-get), [Atlassian's web-session route example](https://support.atlassian.com/bitbucket-cloud/kb/error-viewing-files-in-web-browser/).
