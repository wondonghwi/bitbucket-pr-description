# Chrome 웹스토어 배포 준비

사용자가 ZIP을 받거나 파일을 교체하지 않아도 업데이트되게 하려면, Chrome 웹스토어에 등록한 항목을 통해 설치해야 합니다. 이 저장소는 아직 웹스토어에 등록되지 않았습니다.

## 최초 등록

1. 본인 Google 계정으로 [Chrome 웹스토어 개발자 콘솔](https://chrome.google.com/webstore/devconsole)에 접속하고 개발자 등록을 완료합니다. 등록 과정에서 필요한 결제는 본인이 진행합니다.
2. [최신 GitHub Release](https://github.com/wondonghwi/bitbucket-pr-description/releases/latest)의 `bitbucket-pr-description-버전.zip`을 다운로드합니다.
3. 콘솔에서 새 항목을 만들고 ZIP을 **압축을 풀지 않은 상태로** 업로드합니다. ZIP 최상위에 `manifest.json`이 포함되어 있습니다.
4. 이름은 `Bitbucket PR Description`, 요약은 `Bitbucket PR 화면에서 코드와 설명을 나란히 확인합니다.`로 작성합니다.
5. 소개에는 Description 버튼, 설명 검색, Markdown 복사, 패널 너비 조절 기능을 적습니다. 등록 화면이 요구하는 규격의 미리보기 이미지를 준비합니다. 업무용 PR 화면 대신 가상 데모를 사용하세요.
6. 단일 목적은 `Bitbucket PR의 설명을 코드 옆 패널에 표시`로 설명합니다. 사이트 접근은 `bitbucket.org`의 현재 PR 설명 조회 및 버튼·패널 표시를 위해 사용합니다. 데이터 이용 항목은 실제 구현에 맞게 작성합니다.
7. 필수 등록 정보를 완료하고 심사를 요청합니다. 제출과 심사 승인, 실제 게시 상태는 각각 확인해야 합니다.
8. 게시되면 웹스토어 항목 주소를 README에 추가합니다. 시험 설치한 확장프로그램을 끄고 웹스토어 항목에서 한 번 설치합니다.

## 다음 버전 배포

GitHub Actions가 새 버전의 ZIP을 발행하면 **기존 웹스토어 항목**에 새 ZIP을 업로드하고 게시 절차를 진행합니다. 버전마다 새 웹스토어 항목을 만들지 않습니다. 웹스토어 게시 후에는 해당 항목에서 설치한 사용자의 Chrome이 새 버전을 자동으로 업데이트합니다. 반영 시점은 Chrome의 업데이트 확인과 게시 상태에 따라 달라집니다.

현재 자동화는 GitHub 버전 증가·검증·ZIP 발행까지입니다. 웹스토어 업로드·게시 자동화는 연결하지 않았습니다. 나중에 연결할 때에는 웹스토어 항목 ID와 게시자 인증을 GitHub Actions 설정에 넣어야 하며, 인증정보를 코드나 문서에 기록하지 않습니다.

확장프로그램 아이콘의 팝업은 실제 Chrome 설치 버전을 표시합니다. 시험 설치는 수동 설치 안내를, 웹스토어 설치는 Chrome 자동 업데이트 안내를 표시합니다.

공식 안내: [최초 게시](https://developer.chrome.com/docs/webstore/publish), [기존 항목 업데이트](https://developer.chrome.com/docs/webstore/update).
