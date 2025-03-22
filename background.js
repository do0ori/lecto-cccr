import { ACTIONS } from "./utils/constants.js";
import { log, sendDiscordMessage } from "./utils/helper.js";

let isRunning = false;
let totalLectures = 0;
let originalTabId = null;

// 강의 완료 후 알림 처리
function handleCompletionNotification() {
    chrome.storage.sync.get(
        ["notiEnabled", "webNotiEnabled", "discordNotiEnabled", "webhookUrl"],
        async ({
            notiEnabled,
            webNotiEnabled,
            discordNotiEnabled,
            webhookUrl,
        }) => {
            if (!notiEnabled) return;

            // 웹 알림 처리
            if (webNotiEnabled) {
                chrome.notifications.create(
                    {
                        type: "basic",
                        title: "🤖Lecto has completed all lectures for you!",
                        message: `${totalLectures} Lectures Completed✅`,
                        iconUrl: "icons/cccr_extension.png",
                    },
                    (notificationId) => {
                        // 알림 소리 처리
                        chrome.storage.sync.get(
                            "notiSound",
                            ({ notiSound }) => {
                                if (notiSound !== false) {
                                    chrome.scripting.executeScript({
                                        target: { tabId: originalTabId },
                                        func: () => {
                                            const noti_sound = new Audio(
                                                chrome.runtime.getURL(
                                                    "audios/Slack-Ding.mp3"
                                                )
                                            );
                                            noti_sound.play();
                                        },
                                    });
                                }
                            }
                        );

                        // 알림 클릭 처리
                        chrome.notifications.onClicked.addListener(
                            (clickedId) => {
                                if (clickedId === notificationId) {
                                    chrome.tabs.update(originalTabId, {
                                        active: true,
                                    });
                                    chrome.notifications.clear(clickedId);
                                }
                            }
                        );
                    }
                );
            }

            // 디스코드 알림 처리
            if (discordNotiEnabled && webhookUrl) {
                await sendDiscordMessage(
                    webhookUrl,
                    `# 🤖 강의 수강을 모두 완료했습니다!\n${totalLectures}개 강의가 수강 완료되었습니다.`
                );
            }
        }
    );
}

// 메시지 리스너
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case ACTIONS.EXECUTE_AUTOMATION:
            isRunning = true;
            if (message.tabId) originalTabId = message.tabId;
            log("자동화 시작");
            chrome.tabs.reload(originalTabId, () => {
                log("페이지 새로고침 요청됨, 로딩 감지 시작");

                chrome.tabs.onUpdated.addListener(function listener(
                    tabId,
                    changeInfo
                ) {
                    if (
                        tabId === originalTabId &&
                        changeInfo.status === "complete"
                    ) {
                        log("새로고침 완료, 스크립트 주입 시작", "success");

                        chrome.scripting.executeScript({
                            target: { tabId: originalTabId },
                            files: [
                                "scripts/constants.js",
                                "scripts/helper.js",
                                "scripts/automation.js",
                            ],
                        });

                        chrome.tabs.onUpdated.removeListener(listener);
                    }
                });
            });
            break;

        case ACTIONS.END_AUTOMATION:
            log("자동화 종료", "success");
            handleCompletionNotification();
            isRunning = false;
            totalLectures = 0;
            break;

        case ACTIONS.OPEN_LECTURE_TAB:
            log(`강의 탭 열기: ${message.url}`);
            totalLectures++;
            log(`${totalLectures}번 째 강의`);

            // 강의 URL이 있는 경우 새 탭 열기
            if (message.url) {
                chrome.tabs.create(
                    { url: message.url, active: true },
                    (tab) => {
                        // 기존 탭으로 잠시 포커스 이동
                        setTimeout(() => {
                            chrome.tabs.update(
                                originalTabId,
                                { active: true },
                                () => {
                                    log("기존 탭으로 잠시 이동");

                                    // 새 탭으로 다시 포커스 이동 (alert 제거 효과)
                                    setTimeout(() => {
                                        chrome.tabs.update(
                                            tab.id,
                                            { active: true },
                                            () => {
                                                log("새 강의 탭으로 다시 이동");
                                            }
                                        );
                                    }, 1000);
                                }
                            );
                        }, 1000);

                        chrome.tabs.onUpdated.addListener(function listener(
                            tabId,
                            changeInfo
                        ) {
                            if (
                                tabId === tab.id &&
                                changeInfo.status === "complete"
                            ) {
                                chrome.tabs.onUpdated.removeListener(listener);

                                chrome.scripting.executeScript({
                                    target: { tabId: tab.id },
                                    files: [
                                        "scripts/constants.js",
                                        "scripts/helper.js",
                                        "scripts/lecture-player.js",
                                    ],
                                });
                            }
                        });
                    }
                );
            } else {
                log("강의 URL을 찾을 수 없음", "error");
            }
            break;

        case ACTIONS.CLOSE_CURRENT_TAB:
            if (sender.tab && sender.tab.id !== undefined) {
                chrome.tabs.remove(sender.tab.id, () => {
                    log(`탭 (${sender.tab.id}) 닫힘`);
                });
            } else {
                log("탭 정보를 찾을 수 없음 (sender.tab.id)", "warning");
            }
            break;

        case ACTIONS.GET_STATE:
            sendResponse(isRunning);
            break;

        case ACTIONS.KEEP_ALIVE:
            log("자동화 진행 중");
            break;
    }
});
