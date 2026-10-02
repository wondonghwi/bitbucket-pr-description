Chrome 확장프로그램의 첫 시험용 버전입니다.

1. 아래 Assets에서 **`bitbucket-pr-description-0.1.0.zip`**을 다운로드하고 압축을 풉니다.
2. Chrome의 `chrome://extensions`에서 **개발자 모드**를 켭니다.
3. **압축해제된 확장 프로그램을 로드합니다**로 `manifest.json`이 들어 있는 폴더를 선택합니다.
4. Bitbucket PR 페이지를 새로고침하고 Approve 옆의 **Description** 버튼을 누릅니다.

코드와 설명을 함께 표시하는 오른쪽 패널, 너비 조절, Preview/Markdown 전환과 새로고침을 제공합니다. 별도 토큰 입력이 필요 없고, PR 내용을 외부 서비스로 보내거나 저장하지 않습니다.

자동 테스트, 빌드와 가상 PR 브라우저 동작을 검증했습니다. **실제 로그인된 Bitbucket PR의 조회와 현재 Bitbucket 화면에서의 배치는 아직 확인하지 않았습니다.** Bitbucket Cloud의 웹 세션용 읽기 경로를 사용하므로 사이트 변경이나 조직 정책에 따라 조회가 실패할 수 있습니다.

설치용 ZIP을 받으면 Node.js가 필요하지 않습니다. **Source code (zip)**은 개발용 소스이며 설치용 ZIP과 다릅니다.

---

First preview release of the Chrome extension. Download **`bitbucket-pr-description-0.1.0.zip`** below, extract it, enable Developer mode at `chrome://extensions`, and load the folder containing `manifest.json`. Reload Bitbucket and click Description beside Approve.

Includes a resizable description panel, Preview/Markdown views, and refresh. No separate token input, analytics, or persistent PR storage. Automated checks and fictional browser fixtures passed; live authenticated Bitbucket integration has not yet been verified. The same-origin web-session route may change or be restricted by organization policies.
