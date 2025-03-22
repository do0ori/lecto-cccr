// 디스코드 메시지 전송 함수
export async function sendDiscordMessage(webhookUrl, content) {
    try {
        if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
            return {
                success: false,
                error: "올바른 Discord webhook URL 형식이 아닙니다.",
            };
        }

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "Lecto Bot",
                avatar_url:
                    "https://avatars.githubusercontent.com/u/71831926?v=4",
                content: content,
            }),
        });

        if (!response.ok) {
            return {
                success: false,
                error: `Discord webhook 오류 (${response.status})`,
            };
        }

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: "네트워크 오류가 발생했습니다.",
        };
    }
}

// 로그 출력 함수
export function log(message, type = "info") {
    const timestamp = new Date().toISOString().substring(11, 19);
    const prefix = `[Lecto ${timestamp}]`;

    switch (type) {
        case "error":
            console.error(`${prefix} ❌ ${message}`);
            break;
        case "warning":
            console.warn(`${prefix} ⚠️ ${message}`);
            break;
        case "success":
            console.log(`${prefix} ✅ ${message}`);
            break;
        default:
            console.log(`${prefix} ℹ️ ${message}`);
    }
}
