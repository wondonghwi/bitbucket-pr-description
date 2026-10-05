# Chrome 웹스토어 배포

[Bitbucket PR Description](https://chromewebstore.google.com/detail/bitbucket-pr-description/dgjphamhkmfefiblfjibpfhpammjjckf)은 Chrome 웹스토어에 게시되어 있습니다. **2026년 10월 5일 확인 기준**, 공개 버전은 **v0.1.2**, 업데이트 날짜는 **2026년 10월 3일**입니다.

- 웹스토어 항목 ID: `dgjphamhkmfefiblfjibpfhpammjjckf`
- 사용자 설치·교체·업데이트 안내: [README](../README.md#설치)
- 게시자 관리 화면: [Chrome 웹스토어 개발자 콘솔](https://chrome.google.com/webstore/devconsole)

## 다음 버전 배포

1. 확장프로그램 변경을 검증하고 `main`에 push합니다. 로컬에서는 `pnpm install --frozen-lockfile`과 `pnpm package`로 의존성, 포맷, 테스트, 빌드와 ZIP 생성을 확인합니다.
2. GitHub Actions의 **Check**와 **Release** 결과를 확인합니다. Release는 이전 버전 태그 이후 확장프로그램·빌드 관련 변경이 있으면 버전을 올리고 ZIP을 발행합니다. README 등 문서만 바뀌었다면 새 버전을 만들지 않습니다.
3. [최신 GitHub Release](https://github.com/wondonghwi/bitbucket-pr-description/releases/latest)에서 `bitbucket-pr-description-버전.zip`을 받습니다. `Source code (zip)`은 업로드할 패키지가 아닙니다.
4. 개발자 콘솔에서 **기존 Bitbucket PR Description 항목**을 선택하고 **Package → Upload New Package**로 ZIP을 압축 해제하지 않은 상태로 업로드합니다. 버전마다 새 항목을 만들지 않습니다.
5. 변경된 기능이나 권한이 있다면 소개와 개인정보 관련 선언도 실제 구현에 맞게 갱신하고 **Submit for Review**로 심사를 요청합니다.
6. 승인 후 자동 게시를 선택했다면 공개 페이지 반영을 확인합니다. 수동 게시를 선택했다면 승인 후 게시까지 진행합니다. 심사 제출만으로 공개 버전이 바뀌지는 않습니다.
7. 공개 웹스토어 페이지에서 새 버전을 확인하고, 웹스토어로 설치한 Chrome에서도 업데이트 후 버전과 Bitbucket PR 동작을 확인합니다. 수동 업데이트는 `chrome://extensions`에서 **개발자 모드 → 업데이트**로 확인합니다.

현재 자동화는 **GitHub 버전 증가·검증·ZIP 발행까지**입니다. 웹스토어 업로드·심사 요청·게시 자동화는 연결하지 않았습니다. GitHub Release 발행과 Chrome 웹스토어 게시는 별도로 확인해야 합니다.

## 설치와 업데이트 확인

확장프로그램 아이콘의 팝업은 실제 Chrome 설치 버전을 표시합니다. 개발자 모드로 로드한 확장은 수동 설치 안내를, 웹스토어 설치는 Chrome 자동 업데이트 안내를 표시합니다.

웹스토어 설치는 Chrome이 새 버전을 자동으로 확인하므로 ZIP이나 설치 폴더를 교체할 필요가 없습니다. 업데이트 반영 시점은 Chrome 상태와 조직 정책에 따라 달라질 수 있습니다. 업데이트 후에는 Bitbucket PR 페이지를 새로고침합니다.

웹스토어 게시 확인과 실제 로그인된 Bitbucket PR의 동작 검증은 별개입니다. 현재 검증 범위와 남은 확인 항목은 [검증 기록](VALIDATION.md)을 참고하세요.

공식 안내: [기존 항목 업데이트와 심사·게시](https://developer.chrome.com/docs/webstore/update), [Chrome 확장프로그램 업데이트](https://developer.chrome.com/docs/extensions/develop/concepts/extensions-update-lifecycle).
