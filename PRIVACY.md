# Privacy / 개인정보 처리 안내

This document describes the behavior of Bitbucket PR Description version 0.1.0.

## English

- **Purpose:** Display the current Bitbucket Cloud PR description next to the code diff.
- **Data processed:** The current PR URL, PR number, repository identifier, title, and description. Description content may include personal information written by its author.
- **Storage:** Data remains in the current tab's JavaScript memory. No persistent extension storage, localStorage, database, or file is used. Closing the tab or reloading the page discards that memory. A refreshed or changed PR replaces the previous description.
- **Requests:** Read-only GET requests go to the current PR's same-origin `https://bitbucket.org/!api/2.0/...` route, requesting description-related fields. The browser supplies the existing Bitbucket session. This extension does not read cookies, collect tokens, or send data to an extension-operated server.
- **When requests happen:** On first opening the panel, explicit refresh, or navigation to another PR while the panel is open. Closed panels do not prefetch PR descriptions.
- **Third parties:** No analytics, advertising, external fonts, CDN, or remote executable code is included. Description images are removed to prevent automatic external image requests. Links open only after a user clicks them; the destination's policies then apply.
- **Access:** Content scripts are limited to `https://bitbucket.org/*` to support navigation from other Bitbucket pages into a PR. The extension does not request cookie, tab-list, storage, or access-to-all-sites permissions.
- **User control:** Close the panel to stop an in-flight request. Disable or remove the extension through `chrome://extensions`.
- **Development preview:** The optional local demo uses invented data and does not request Bitbucket data. Generated preview images contain no real PR data.

This policy covers the extension's own behavior. Bitbucket and sites opened through links have their own privacy policies. The extension does not redact or anonymize the descriptions it displays.

## 한국어

- **목적:** 현재 Bitbucket Cloud PR의 설명을 코드 옆에 표시합니다.
- **처리하는 정보:** 현재 PR 주소, 번호, 저장소 식별자, 제목과 설명입니다. 설명에는 작성자가 입력한 개인정보가 포함될 수 있습니다.
- **저장:** 현재 탭의 JavaScript 메모리에서만 처리합니다. 확장프로그램 저장소, localStorage, 데이터베이스나 파일에 기록하지 않습니다. 탭을 닫거나 페이지를 새로고침하면 메모리 데이터가 사라집니다. 설명을 새로 불러오거나 PR이 바뀌면 이전 설명을 교체합니다.
- **통신:** 현재 PR의 설명 관련 필드만 같은 출처의 `https://bitbucket.org/!api/2.0/...` 경로에 GET으로 요청합니다. 로그인 세션은 브라우저가 사용하며 확장프로그램은 쿠키 값을 읽거나 토큰을 수집하지 않습니다. 자체 서버로 보내는 데이터도 없습니다.
- **조회 시점:** 패널을 처음 열 때, Refresh를 누를 때, 패널이 열린 상태에서 다른 PR로 이동할 때입니다. 닫힌 패널은 설명을 미리 조회하지 않습니다.
- **외부 서비스:** 분석 도구, 광고, 외부 폰트, CDN과 원격 실행 코드를 포함하지 않습니다. 설명 속 이미지는 자동 외부 요청을 방지하기 위해 제거합니다. 일반 링크는 사용자가 클릭할 때만 열리며 이후 방문한 사이트의 정책이 적용됩니다.
- **접근 범위:** Bitbucket 페이지에서 PR로 이동하는 경우를 처리하기 위해 콘텐츠 스크립트는 `https://bitbucket.org/*`에서 실행합니다. 쿠키, 탭 목록, 저장소와 모든 웹사이트 접근 권한을 요청하지 않습니다.
- **사용자 제어:** 패널을 닫으면 진행 중인 요청을 취소합니다. `chrome://extensions`에서 확장프로그램을 비활성화하거나 삭제할 수 있습니다.
- **개발용 미리보기:** 선택적으로 실행하는 로컬 데모는 가상의 데이터를 사용하고 Bitbucket 정보를 요청하지 않습니다. 제공된 데모 이미지에는 실제 PR 정보가 없습니다.

이 안내는 확장프로그램 자체의 동작에 대한 설명입니다. Bitbucket과 링크를 통해 방문한 사이트에는 각각의 개인정보 정책이 적용됩니다. 표시하는 PR 설명을 자동으로 익명화하거나 개인정보를 제거하는 기능은 없습니다.
