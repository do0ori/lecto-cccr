import { sendDiscordMessage } from "../utils/helper.js";

document.addEventListener("DOMContentLoaded", async () => {
    const webNotiSwitch = document.getElementById("web-noti-switch");
    const discordNotiSwitch = document.getElementById("discord-noti-switch");
    const webhookContainer = document.getElementById("webhook-container");
    const webhookUrl = document.getElementById("webhook-url");
    const testWebhookBtn = document.getElementById("test-webhook");

    chrome.storage.sync.get(
        ["webNotiEnabled", "discordNotiEnabled", "webhookUrl"],
        ({
            webNotiEnabled,
            discordNotiEnabled,
            webhookUrl: savedWebhookUrl,
        }) => {
            webNotiSwitch.checked = webNotiEnabled ?? true;
            discordNotiSwitch.checked = discordNotiEnabled ?? false;
            webhookUrl.value = savedWebhookUrl || "";
            if (discordNotiEnabled) {
                webhookContainer.style.pointerEvents = "auto";
                webhookContainer.style.opacity = "1";
            } else {
                webhookContainer.style.pointerEvents = "none";
                webhookContainer.style.opacity = "0.5";
            }
            testWebhookBtn.disabled = !webhookUrl.value;
        }
    );

    webNotiSwitch.addEventListener("change", () => {
        chrome.storage.sync.set({ webNotiEnabled: webNotiSwitch.checked });
    });

    discordNotiSwitch.addEventListener("change", () => {
        const isEnabled = discordNotiSwitch.checked;
        chrome.storage.sync.set({ discordNotiEnabled: isEnabled });
        if (isEnabled) {
            webhookContainer.style.pointerEvents = "auto";
            webhookContainer.style.opacity = "1";
        } else {
            webhookContainer.style.pointerEvents = "none";
            webhookContainer.style.opacity = "0.5";
        }
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
