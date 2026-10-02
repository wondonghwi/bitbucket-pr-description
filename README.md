# Bitbucket PR Description

**Bitbucket에서 코드와 PR 설명을 나란히 읽는 Chrome 확장프로그램입니다.**

Approve 옆의 **Description** 버튼을 누르면 오른쪽에 설명 패널이 열립니다. 리뷰 중 Overview 탭과 Files changed 탭을 오갈 필요 없이 변경 이유와 확인 항목을 참고할 수 있습니다.

[English documentation](README.en.md) · [개인정보 처리 안내](PRIVACY.md) · MIT License

![가상의 PR로 구성한 로컬 데모](docs/preview.png)

> 위 이미지는 가상의 저장소와 PR로 만든 데모입니다. 실제 사용자나 회사의 정보가 포함되어 있지 않습니다.

## 기능

- PR 작업 버튼 영역의 Approve 앞에 Description 버튼을 추가합니다. 승인 취소 상태에서는 Unapprove 옆에 표시됩니다.
- 오른쪽 패널에서 제목, 본문, 목록, 코드 블록, 표와 체크리스트를 읽습니다.
- **Preview / Markdown**으로 렌더링된 설명과 원문을 전환합니다.
- 넓은 화면에서는 본문 너비를 줄여 코드와 설명을 함께 표시합니다. 패널의 왼쪽 경계를 드래그하면 너비를 조절할 수 있습니다.
- 좁은 화면에서는 설명 패널이 화면 위에 겹쳐 표시됩니다. 닫으면 코드를 다시 볼 수 있습니다.
- **Refresh**로 수정된 설명을 다시 불러옵니다. **Esc** 또는 닫기 버튼으로 패널을 닫습니다.
- 페이지의 `data-color-mode` 설정과 시스템 테마를 참고해 밝은/어두운 테마를 적용합니다.
- PR 간 이동, 페이지 내부 탭 이동, 작업 버튼 영역의 재생성을 처리합니다.

설명 조회 전용입니다. Approve, Merge, PR 수정 작업은 수행하지 않습니다.

## 지원 범위와 현재 상태

- **Bitbucket Cloud(`https://bitbucket.org`)의 PR 상세 페이지**를 대상으로 합니다. Bitbucket Server / Data Center와 별도 회사 도메인은 지원하지 않습니다.
- Chrome 109 이상을 대상으로 만들었으며, 최초 로딩된 Bitbucket 페이지에서 PR로 이동하는 경우도 처리합니다.
- 로그인한 계정이 해당 PR을 볼 수 있어야 합니다. 공개/비공개 저장소에 같은 방식을 사용하지만 접근 권한을 추가로 부여하지 않습니다.
- Bitbucket의 웹 세션용 `https://bitbucket.org/!api/2.0/...` 읽기 경로를 사용합니다. 이 경로는 공식 외부 연동 API의 호환성 보장 대상이 아닙니다. Bitbucket 변경이나 조직 정책에 따라 조회가 실패할 수 있습니다.
- 작업 버튼을 찾지 못하면 화면 오른쪽 위에 독립적인 Description 버튼을 표시합니다. Bitbucket의 DOM 구조나 화면 레이아웃이 변경되면 배치 조정이 필요할 수 있습니다.
- 자동 테스트와 가상의 PR을 사용한 브라우저 검증을 수행했습니다. **실제 로그인된 공개/비공개 PR의 조회와 최신 Bitbucket 화면에서의 배치는 아직 확인하지 않았습니다.**

## 설치

### 빠르게 설치하기: 설치용 ZIP

처음 사용한다면 [v0.1.0 시험용 릴리스](https://github.com/wondonghwi/bitbucket-pr-description/releases/tag/v0.1.0)의 **Assets**에서 `bitbucket-pr-description-0.1.0.zip`을 받으세요. Node.js와 터미널 명령 없이 설치할 수 있습니다.

1. 받은 ZIP의 압축을 풉니다.
2. Chrome 주소창에 `chrome://extensions`를 입력합니다.
3. 오른쪽 위의 **개발자 모드**를 켭니다.
4. **압축해제된 확장 프로그램을 로드합니다**를 누르고 **`manifest.json`이 들어 있는 폴더**를 선택합니다.
5. 이미 열려 있는 Bitbucket PR 페이지를 새로고침합니다.
6. **Approve 옆의 Description** 버튼을 눌러 오른쪽에 설명이 표시되는지 확인합니다.

현재 Chrome Web Store에 등록되어 있지 않습니다. ZIP을 Chrome에 바로 끌어다 놓거나, Release의 **Source code (zip)**을 설치용 ZIP 대신 선택하면 안 됩니다. 파일 이름이 `bitbucket-pr-description-0.1.0.zip`인지 확인하세요.

시험용 버전입니다. 실제 로그인된 PR 조회는 직접 설치한 환경에서 확인해야 합니다. 조회가 실패하면 패널에 표시된 오류 문구를 기준으로 문제를 확인할 수 있습니다.

### 소스에서 설치하기: 직접 수정하면서 사용

Node.js 24.15 이상을 권장합니다. Node.js 22를 사용하는 경우 22.22.2 이상이 필요합니다. 확장프로그램을 설치한 뒤에는 Node.js를 실행할 필요가 없습니다.

1. 이 저장소를 clone합니다.

   ```bash
   git clone https://github.com/wondonghwi/bitbucket-pr-description.git
   cd bitbucket-pr-description
   ```

2. 의존성을 설치하고 빌드합니다.

   ```bash
   npm ci
   npm run build
   ```

3. Chrome의 `chrome://extensions`에서 개발자 모드를 켭니다.
4. **압축해제된 확장 프로그램을 로드합니다**를 누르고 프로젝트 안의 **`dist` 폴더**를 선택합니다. 프로젝트 루트 폴더가 아닙니다.
5. 이미 열려 있는 Bitbucket 페이지를 새로고침합니다.

### 수정한 내용을 반영하기

1. `src/content.js`, `src/panel.css` 등 `src` 안의 소스를 수정합니다. `dist`는 빌드 결과이므로 직접 수정하지 않습니다.
2. 프로젝트 폴더에서 `npm run build`를 실행합니다.
3. `chrome://extensions`에서 **Bitbucket PR Description 카드의 새로고침 버튼**을 누릅니다.
4. Bitbucket PR 페이지를 새로고침합니다.
5. Description 버튼을 눌러 수정한 동작을 확인합니다.

GitHub에 변경을 공유하기 전에는 `npm run check`로 포맷, 테스트와 빌드를 확인합니다.

## 사용법

1. Bitbucket에 로그인하고 검토할 PR의 **Files changed** 탭을 엽니다.
2. **Approve 옆의 Description** 버튼을 누릅니다.
3. 코드를 읽으면서 오른쪽 패널의 변경 목적과 검증 항목을 참고합니다.
4. 패널 너비가 부족하면 왼쪽 경계를 드래그합니다. 키보드로는 경계에 포커스를 둔 후 **← / →** 키를 누릅니다.
5. 설명이 수정되었으면 패널 상단의 **↻** 버튼을 누릅니다.
6. 원래 화면으로 돌아가려면 **Esc** 또는 **×** 버튼을 누릅니다.

패널 아래의 **Open Overview**는 현재 PR의 Overview를 새 탭에서 엽니다. Markdown 원문, 이미지와 Bitbucket 고유 렌더링을 확인할 때 사용할 수 있습니다.

## 개인정보와 권한

- API 토큰, 이메일, 사용자명, 별도 계정 등록을 요구하지 않습니다.
- 확장프로그램은 PR 주소, 제목, 설명을 현재 탭 메모리에서만 처리합니다. `chrome.storage`, localStorage, 파일이나 서버에 저장하지 않습니다.
- Bitbucket의 로그인 세션은 브라우저가 같은 출처의 GET 요청에 사용합니다. 확장프로그램이 쿠키 값을 읽거나 토큰을 추출하지 않습니다.
- 네트워크 요청은 설명 패널을 처음 열 때와 Refresh를 누를 때, 열린 패널에서 다른 PR로 이동할 때만 현재 PR의 설명 조회를 위해 발생합니다.
- 분석 도구, 광고, 자체 서버, 외부 CDN과 원격 실행 코드는 없습니다.
- 설명의 HTML은 번들에 포함된 DOMPurify로 정리합니다. 스크립트, 스타일, iframe, SVG와 자동 이미지 로딩을 제거합니다. 체크박스는 읽기 전용입니다.
- 일반 링크는 사용자가 클릭할 때만 새 탭으로 열며, `noopener noreferrer`를 적용합니다. 링크로 이동한 사이트에는 해당 사이트의 정책이 적용됩니다.
- `cookies`, `tabs`, `storage`, `<all_urls>` 권한을 요청하지 않습니다. 콘텐츠 스크립트는 Bitbucket 페이지에서만 실행합니다.

PR 설명 자체에는 작성자가 입력한 개인정보가 있을 수 있습니다. 확장프로그램은 해당 내용을 표시하며 이를 자동으로 익명화하지는 않습니다. 공개 저장소에 실제 PR 응답, 인증정보나 업무 화면을 추가하지 마세요. 자세한 내용은 [PRIVACY.md](PRIVACY.md)를 참고하세요.

## 문제 해결

| 상황                            | 확인할 내용                                                                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 버튼이 보이지 않음              | PR 상세 페이지인지 확인하고, 확장프로그램과 Bitbucket 페이지를 모두 새로고침합니다. 오른쪽 위의 대체 버튼도 확인합니다.                         |
| 로그인 또는 접근 오류           | 같은 계정으로 PR의 Overview를 열 수 있는지 확인하고 다시 로그인합니다.                                                                          |
| 설명 조회가 실패함              | 네트워크 연결과 로그인 상태를 확인하고 Refresh를 누릅니다. 계속 실패하면 Overview에서 설명을 확인합니다. 웹 세션 경로가 변경되었을 수 있습니다. |
| 설명이 이전 내용으로 보임       | 패널의 Refresh를 누릅니다. 패널을 닫았다 여는 경우에는 현재 탭의 메모리 결과를 재사용합니다.                                                    |
| 이미지가 안 보임                | 의도한 동작입니다. 자동 외부 요청을 방지하기 위해 이미지는 숨깁니다. Overview에서 확인할 수 있습니다.                                           |
| 코드 영역이 좁거나 패널이 겹침  | 패널 너비를 줄이거나 닫습니다. 1100px 미만의 화면에서는 겹쳐 표시됩니다.                                                                        |
| 업데이트한 코드가 반영되지 않음 | `npm run build` 후 `chrome://extensions`에서 확장프로그램을 새로고침하고 Bitbucket 페이지도 새로고침합니다.                                     |

문제를 공유할 때는 토큰, 이메일, 비공개 저장소 주소와 PR 내용을 제거한 재현 정보만 제공해 주세요.

## 개발과 검증

```bash
npm ci
npm test          # URL 인식, 세션 GET, 오류, HTML 정리, PR 이동과 패널 상태 검증
npm run build    # 설치 가능한 dist/ 생성
npm run check    # 포맷 확인 + 테스트 + 빌드
npm run package  # 검증 후 release/bitbucket-pr-description-0.1.0.zip 생성
npm run demo     # http://127.0.0.1:4173 에서 가상 PR 미리보기
```

데모는 별도 어댑터로 가상의 설명을 제공하며 Bitbucket에 요청하지 않습니다. 실제 확장프로그램에는 데모 코드가 포함되지 않습니다. 자동 테스트도 실제 Bitbucket 계정이나 비공개 저장소 없이 실행합니다. 설치용 ZIP 생성에는 시스템의 `zip` 명령이 필요합니다.

```text
extension/   manifest.json과 아이콘
src/         버튼·패널, PR 조회와 HTML 정리
scripts/     빌드, ZIP 생성과 로컬 데모
tests/       node:test와 jsdom 기반 자동 검증
docs/        가상 PR 데모와 공개 가능한 미리보기
dist/        빌드 결과 (Git 제외)
release/     설치용 ZIP (Git 제외)
```

DOMPurify의 라이선스는 빌드할 때 `dist/THIRD_PARTY_NOTICES.txt`에 포함합니다. 소스는 MIT License이며, Atlassian 또는 Bitbucket의 공식 제품은 아닙니다.

## 배포

소스 저장소: [wondonghwi/bitbucket-pr-description](https://github.com/wondonghwi/bitbucket-pr-description)

`node_modules`, `dist`, `release`, 테스트 출력과 `.env` 파일은 Git에서 제외됩니다. 버전과 일치하는 `v*` 태그를 push하면 GitHub Actions가 검증 후 설치용 ZIP을 시험용 Release에 첨부합니다. 빌드에는 저장소 소스만 사용하며 개인 설정이나 실제 PR 응답을 포함하지 않습니다.

문서나 문제 제보에는 실제 업무 화면 대신 제공된 가상 데모 이미지를 사용할 수 있습니다. 자세한 검증 범위와 직접 확인할 항목은 [검증 기록](docs/VALIDATION.md)에 정리되어 있습니다.

설계 참고: [Chrome 콘텐츠 스크립트](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts), [Bitbucket PR 응답 구조](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-pullrequests/#api-repositories-workspace-repo-slug-pullrequests-pull-request-id-get), [Atlassian의 웹 세션 경로 예시](https://support.atlassian.com/bitbucket-cloud/kb/error-viewing-files-in-web-browser/).
