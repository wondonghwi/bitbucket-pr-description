const manifest = chrome.runtime.getManifest();
document.querySelector("#version").textContent = `v${manifest.version}`;

async function showInstallation() {
  const mode = document.querySelector("#install-mode");
  const help = document.querySelector("#update-help");
  const link = document.querySelector("#update-link");
  try {
    const info = await chrome.management.getSelf();
    if (info.installType === "development") {
      mode.textContent = "개발자 모드 · 시험 설치";
      help.textContent =
        "이 설치는 자동 업데이트되지 않습니다. 새 버전은 버전별 폴더에 압축을 풀고 새로 등록하세요. 기존 파일을 덮어쓰지 않습니다.";
      link.textContent = "새 버전 설치 방법";
    } else if (
      manifest.update_url === "https://clients2.google.com/service/update2/crx"
    ) {
      mode.textContent = "Chrome 웹스토어 설치";
      help.textContent =
        "웹스토어에 새 버전이 게시되면 Chrome이 자동으로 업데이트합니다. ZIP을 받거나 설치 폴더를 바꿀 필요가 없습니다.";
      link.textContent = "웹스토어에서 보기";
      link.href = `https://chromewebstore.google.com/detail/${chrome.runtime.id}`;
    } else {
      mode.textContent = "Chrome에 설치됨";
      help.textContent = "업데이트 방법은 설치한 배포 경로에서 확인하세요.";
    }
  } catch {
    mode.textContent = "설치 방식 확인 불가";
    help.textContent =
      "위의 버전은 현재 Chrome이 로드한 버전입니다. 설치·업데이트 안내에서 사용한 설치 방식을 확인하세요.";
  }
}
void showInstallation();
