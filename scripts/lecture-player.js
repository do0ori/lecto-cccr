(function () {
    log("YouTube IFrame 컨트롤러 로드됨", "success");

    const urlParams = new URLSearchParams(window.location.search);
    const startTimeParam = urlParams.get("start");
    const startTimeMinutes = startTimeParam ? parseInt(startTimeParam, 10) : 0;
    const startTimeSeconds = startTimeMinutes * 60;

    const iframe = document.getElementById(SELECTORS.PLAYER.IFRAME);

    if (!iframe) {
        log("YouTube IFrame을 찾을 수 없음", "error");
        return;
    }

    // YouTube iframe에 명령을 보내는 함수
    function sendCommand(command, args = []) {
        iframe.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: command, args }),
            "*"
        );
    }

    // 재생
    function playVideo() {
        sendCommand("playVideo");
        log("재생");
    }

    // 음소거
    function muteVideo() {
        sendCommand("mute");
        log("음소거");
    }

    // 재생 속도 설정 (기본 1배속)
    function setPlaybackRate(speed = 1) {
        sendCommand("setPlaybackRate", [speed]);
        log(`재생 속도 설정: ${speed}x`);
    }

    // 지정된 시간으로 이동
    function seekTo(timeInSeconds) {
        sendCommand("seekTo", [timeInSeconds, true]);
        log(`영상 이동: ${timeInSeconds}초 = ${timeInSeconds / 60}분으로 이동`);
    }

    // 상태 변경 메시지 수신 (웹페이지에서 이벤트 감지)
    window.addEventListener("message", (event) => {
        try {
            const data = JSON.parse(event.data);
            if (
                data.event === "infoDelivery" &&
                data.info &&
                data.info.playerState !== undefined
            ) {
                const playerState = data.info.playerState;
                log(`현재 플레이어 상태: ${playerState}`);
                if (playerState === PLAYER_STATE.ENDED) {
                    // END 상태
                    log("비디오 재생 완료!", "success");
                    chrome.runtime.sendMessage({
                        action: ACTIONS.EXECUTE_AUTOMATION,
                    });
                    chrome.runtime.sendMessage({
                        action: ACTIONS.CLOSE_CURRENT_TAB,
                    });
                } else if (playerState !== PLAYER_STATE.PLAYING) {
                    log("비디오 재생");
                    playVideo();
                }
            }
        } catch (e) {
            // JSON 파싱 에러 무시
        }
    });

    // Send message to service worker every 20 seconds to keep it alive during automation process
    setInterval(() => {
        chrome.runtime.sendMessage({ action: ACTIONS.KEEP_ALIVE });
    }, 20000);

    // startTimeMinutes 값이 0이 아니면 지정된 분(초)로 이동 후 재생
    if (startTimeMinutes && startTimeMinutes !== 0) {
        seekTo(startTimeSeconds);
    }
    playVideo();
    setPlaybackRate();
    muteVideo();
})();
