import { ACTIONS } from "../utils/constants.js";
import { sendDiscordMessage } from "../utils/helper.js";

document.addEventListener("DOMContentLoaded", async () => {
    const buttonText = document.getElementsByClassName("buttonText")[0];
    const loader = document.getElementsByClassName("loader")[0];
    const note = document.getElementById("note");
    const automationButton = document.getElementById("automationButton");
    const notiSwitch = document.getElementById("noti-switch");
    const notiOptions = document.getElementById("noti-options");
    const webNotiSwitch = document.getElementById("web-noti-switch");
    const discordNotiSwitch = document.getElementById("discord-noti-switch");
    const webhookContainer = document.getElementById("webhook-container");
    const webhookUrl = document.getElementById("webhook-url");
    const testWebhookBtn = document.getElementById("test-webhook");

    chrome.storage.sync.get(
        ["notiEnabled", "webNotiEnabled", "discordNotiEnabled", "webhookUrl"],
        ({
            notiEnabled,
            webNotiEnabled,
            discordNotiEnabled,
            webhookUrl: savedWebhookUrl,
        }) => {
            notiSwitch.checked = notiEnabled ?? false;
            webNotiSwitch.checked = webNotiEnabled ?? true;
            discordNotiSwitch.checked = discordNotiEnabled ?? false;
            webhookUrl.value = savedWebhookUrl || "";

            notiOptions.style.display = notiEnabled ? "flex" : "none";
            webhookContainer.style.display = discordNotiEnabled
                ? "flex"
                : "none";
            testWebhookBtn.disabled = !webhookUrl.value;
        }
    );

    const setButtonRunningState = () => {
        buttonText.style.display = "none";
        loader.style.display = "flex";
    };

    const getCurrentTab = async () => {
        let queryOptions = { active: true, lastFocusedWindow: true };
        const [tab] = await chrome.tabs.query(queryOptions);
        return tab;
    };

    loader.style.display = "none";

    const tab = await getCurrentTab();
    console.log(tab);
    const url = tab.url;
    const urlPattern =
        /^https:\/\/www\.cccr-edu\.or\.kr\/classroom\/index\.jsp\?cuid=\d+$/;
    if (urlPattern.test(url)) {
        note.innerText = "✅Available Page✅";
        const isRunning = await chrome.runtime.sendMessage({
            action: ACTIONS.GET_STATE,
            tabId: tab.id,
        });
        if (isRunning) {
            automationButton.disabled = true;
            setButtonRunningState();
        } else {
            automationButton.disabled = false;
        }
    } else {
        note.innerText = "⛔Unavailable Page⛔";
        automationButton.disabled = true;
    }

    automationButton.addEventListener("click", async () => {
        setButtonRunningState();
        automationButton.disabled = true;
        chrome.runtime.sendMessage({
            action: ACTIONS.EXECUTE_AUTOMATION,
            tabId: tab.id,
        });
    });

    notiSwitch.addEventListener("change", () => {
        const isEnabled = notiSwitch.checked;
        chrome.storage.sync.set({ notiEnabled: isEnabled });
        notiOptions.style.display = isEnabled ? "flex" : "none";
    });

    webNotiSwitch.addEventListener("change", () => {
        chrome.storage.sync.set({ webNotiEnabled: webNotiSwitch.checked });
    });

    discordNotiSwitch.addEventListener("change", () => {
        const isEnabled = discordNotiSwitch.checked;
        chrome.storage.sync.set({ discordNotiEnabled: isEnabled });
        webhookContainer.style.display = isEnabled ? "flex" : "none";
    });

    webhookUrl.addEventListener("input", () => {
        testWebhookBtn.disabled = !webhookUrl.value;
    });

    testWebhookBtn.addEventListener("click", async () => {
        const url = webhookUrl.value;
        testWebhookBtn.disabled = true;

        const result = await sendDiscordMessage(
            url,
            "Hi, Discord! 웹훅 메시지입니다."
        );

        if (result.success) {
            chrome.storage.sync.set({ webhookUrl: url }, () => {
                alert("Discord webhook 테스트 성공!");
            });
        } else {
            alert(result.error);
            webhookUrl.value = "";
        }

        testWebhookBtn.disabled = !webhookUrl.value;
    });
});
