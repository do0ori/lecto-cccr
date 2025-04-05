import { ACTIONS } from "./utils/constants.js";
import { log, sendDiscordMessage } from "./utils/helper.js";

let isRunning = false;
let originalTabId = null;

chrome.storage.sync.set({ completedLectures: 0 });

function handleAutomation() {
    chrome.tabs.reload(originalTabId, () => {
        log("페이지 새로고침 요청됨, 로딩 감지 시작");

        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
            if (tabId === originalTabId && changeInfo.status === "complete") {
                log("새로고침 완료, 스크립트 주입 시작", "success");

                chrome.scripting.executeScript({
                    target: { tabId: originalTabId },
                    files: ["scripts/automation.js"],
                });

                chrome.tabs.onUpdated.removeListener(listener);
            }
        });
    });
}

function handleCompletionNotification() {
    chrome.storage.sync.get(
        [
            "webNotiEnabled",
            "discordNotiEnabled",
            "webhookUrl",
            "completedLectures",
        ],
        async ({
            webNotiEnabled,
            discordNotiEnabled,
            webhookUrl,
            completedLectures,
        }) => {
            // 웹 알림 처리
            if (webNotiEnabled) {
                chrome.notifications.create(
                    {
                        type: "basic",
                        title: "🤖 Lecto has completed all lectures for you!",
                        message: `${completedLectures} Lectures Completed ✅`,
                        iconUrl: "icons/cccr_extension.png",
                    },
                    (notificationId) => {
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
                    `# 🎉 강의 수강 완료!\n> ${completedLectures}개 강의가 수강 완료되었습니다.`
                );
            }
        }
    );
}

function handleOpenLectureTab(url) {
    chrome.tabs.create(
        { url, active: true, openerTabId: originalTabId },
        (tab) => {
            // 기존 탭으로 잠시 포커스 이동
            setTimeout(() => {
                chrome.tabs.update(originalTabId, { active: true }, () => {
                    log("기존 탭으로 잠시 이동");

                    // 새 탭으로 다시 포커스 이동 (alert 제거 효과)
                    setTimeout(() => {
                        chrome.tabs.update(tab.id, { active: true }, () => {
                            log("새 강의 탭으로 다시 이동");
                        });
                    }, 1000);
                });
            }, 1000);

            chrome.tabs.onUpdated.addListener(function listener(
                tabId,
                changeInfo
            ) {
                if (tabId === tab.id && changeInfo.status === "complete") {
                    chrome.tabs.onUpdated.removeListener(listener);

                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ["scripts/lecture-player.js"],
                    });
                }
            });
        }
    );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case ACTIONS.EXECUTE_AUTOMATION:
            isRunning = true;
            chrome.storage.sync.set({ completedLectures: 0 });
            if (!originalTabId) originalTabId = sender.tab.id;
            log("자동화 시작");
            handleAutomation();
            break;

        case ACTIONS.STOP_AUTOMATION:
            log("자동화 중지");
            isRunning = false;
            chrome.tabs.reload(originalTabId);
            break;

        case ACTIONS.END_AUTOMATION:
            log(`자동화 종료`, "success");
            handleCompletionNotification();
            isRunning = false;
            chrome.tabs.reload(originalTabId);
            break;

        case ACTIONS.OPEN_LECTURE_TAB:
            if (!message.url) {
                log("강의 URL을 찾을 수 없음", "error");
                break;
            }

            chrome.storage.sync.get(
                ["completedLectures"],
                ({ completedLectures }) => {
                    const newCount = completedLectures + 1;
                    chrome.storage.sync.set({ completedLectures: newCount });
                    log(`강의 탭 열기: ${message.url}`);
                    log(`${newCount}번째 강의 수강 중`);
                }
            );
            handleOpenLectureTab(message.url);
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
