# Validation / 검증 기록

Checked on 2026-10-02. No real Bitbucket account, private repository response, or company screenshot was used.

## Completed

- Fresh `npm ci` using the public npm registry.
- Prettier check, automated behavior/security tests, production build, and ZIP packaging.
- npm audit: zero reported vulnerabilities in the installed dependency set. This is a dependency advisory check, not a formal security audit.
- Verified all manifest-referenced files exist, all lockfile package URLs use the public npm registry, and the production bundle excludes the local demo adapter.
- Loaded the actual `dist/` extension into a separate headless Chromium profile and confirmed it is enabled in `chrome://extensions`.
- Intercepted the fictional PR page and PR response in the test browser. Confirmed content-script injection, button placement, same-origin description GET, rendered description, image removal, unsafe-link removal, and no browser console errors.
- Checked the local demo in Chrome: side-by-side layout, Markdown mode, and Escape returning the page to full width. The README screenshot comes from this fictional demo.
- Verified ZIP integrity and its contents: manifest, bundled content script, icons, MIT license, and DOMPurify license notice only.
- Published the source and fictional preview on GitHub. [Check on main](https://github.com/wondonghwi/bitbucket-pr-description/actions/runs/36954136354), [Check on v0.1.0](https://github.com/wondonghwi/bitbucket-pr-description/actions/runs/36954158877), and [Release packaging](https://github.com/wondonghwi/bitbucket-pr-description/actions/runs/36954158897) all passed. The installation ZIP is available in the [v0.1.0 preview release](https://github.com/wondonghwi/bitbucket-pr-description/releases/tag/v0.1.0).
- Downloaded the published ZIP, checked its GitHub-reported SHA-256 digest and archive integrity, and confirmed its eight files match the tested local build byte for byte.

## Not yet verified

- Live description requests using a signed-in Bitbucket session, including public and private PRs.
- Exact placement and layout on the current live Bitbucket UI.
- Organization-specific restrictions or managed-browser policies.
- Actual Chrome 109 execution; the bundle targets Chrome 109, but browser checks used the installed current Chrome/Chromium builds.

## Live acceptance check

1. Load `dist/` through `chrome://extensions` and reload a signed-in Bitbucket tab.
2. Open an accessible PR's Files changed tab and confirm Description appears beside Approve.
3. Open the panel and compare its title and description with Overview.
4. Switch Preview / Markdown, resize the panel, then close with Escape.
5. Change the PR description through Bitbucket and use the panel's Refresh action to confirm the update.
6. Move to another PR with the panel open and confirm the description changes to that PR.

Any screenshot or issue report should remove real repository identifiers, personal data, and confidential PR content.

한국어: 자동 검증, 실제 확장프로그램 로드, 가상 응답을 사용한 브라우저 동작과 ZIP 구성까지 확인했습니다. 실제 로그인된 Bitbucket PR의 조회·배치와 조직별 정책은 아직 확인하지 않았습니다. 위 순서로 설치한 환경에서 최종 동작을 확인할 수 있습니다.
