(async function injectAutomationButton() {
    const title = document.querySelector(SELECTORS.TITLE);
    if (!title || document.getElementById(SELECTORS.AUTOMATION_BUTTON)) return;

    const titleText = title.textContent;
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.justifyContent = "space-between";
    wrapper.style.alignItems = "center";
    wrapper.style.width = "100%";

    const titleSpan = document.createElement("span");
    titleSpan.textContent = titleText;

    const button = document.createElement("button");
    button.id = SELECTORS.AUTOMATION_BUTTON;
    button.style.cssText = `
        padding: 6px 12px;
        font-size: 14px;
        border: none;
        border-radius: 4px;
        background-color: #7877d6;
        color: #fff;
        cursor: pointer;
        transition: background-color 0.2s;
        margin-right: 6px;
    `;

    const setButtonUI = (running) => {
        button.textContent = running ? "⛔ 멈추기" : "🚀 자동 수강";
    };

    const incompleteLessons = findIncompleteLectures();
    const hasIncomplete = incompleteLessons.length > 0;

    const initialState = await chrome.runtime.sendMessage({
        action: "GET_STATE",
    });
    setButtonUI(initialState);

    button.disabled = !hasIncomplete;
    button.style.opacity = hasIncomplete ? "1" : "0.6";
    button.style.cursor = hasIncomplete ? "pointer" : "not-allowed";
    button.title = hasIncomplete
        ? ""
        : "모든 강의를 완료하여 비활성화되었습니다.";

    button.addEventListener("mouseenter", () => {
        if (!button.disabled) button.style.backgroundColor = "#5f5fcf";
    });
    button.addEventListener("mouseleave", () => {
        button.style.backgroundColor = "#7877d6";
    });

    button.addEventListener("click", async () => {
        if (!hasIncomplete) return;

        const isRunning = await chrome.runtime.sendMessage({
            action: "GET_STATE",
        });

        if (!isRunning) {
            chrome.runtime.sendMessage({ action: ACTIONS.EXECUTE_AUTOMATION });
            setButtonUI(true);
        } else {
            chrome.runtime.sendMessage({ action: ACTIONS.STOP_AUTOMATION });
            setButtonUI(false);
        }
    });

    const settingsBtn = document.createElement("span");
    settingsBtn.textContent = "⚙️";
    settingsBtn.style.cursor = "pointer";
    settingsBtn.style.fontSize = "18px";
    settingsBtn.style.marginLeft = "6px";
    settingsBtn.title = "설정 열기";
    settingsBtn.style.transition = "opacity 0.2s";
    settingsBtn.style.opacity = "0.8";

    settingsBtn.addEventListener("mouseenter", () => {
        settingsBtn.style.opacity = "1";
    });
    settingsBtn.addEventListener("mouseleave", () => {
        settingsBtn.style.opacity = "0.8";
    });

    settingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const existing = document.getElementById("lecto-settings-iframe");
        if (existing) {
            existing.remove();
            return;
        }

        const iframe = document.createElement("iframe");
        iframe.src = chrome.runtime.getURL("popup/popup.html");
        iframe.id = "lecto-settings-iframe";
        iframe.style.position = "fixed";
        iframe.style.top = "20px";
        iframe.style.right = "20px";
        iframe.style.width = "216px";
        iframe.style.height = "174px";
        iframe.style.zIndex = "999999";
        iframe.style.border = "1px solid #ccc";
        iframe.style.borderRadius = "8px";
        iframe.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        iframe.style.backgroundColor = "#fff";
        iframe.style.overflow = "hidden";
        iframe.setAttribute("scrolling", "no");

        document.body.appendChild(iframe);

        // 바깥 영역 클릭 시 iframe 닫기
        function onOutsideClick(e) {
            if (!iframe.contains(e.target) && e.target !== settingsBtn) {
                iframe.remove();
                document.removeEventListener("click", onOutsideClick);
            }
        }
        // setTimeout으로 이벤트 등록하면 현재 클릭 이벤트와 분리됨
        setTimeout(() => {
            document.addEventListener("click", onOutsideClick);
        }, 0);
    });

    title.textContent = "";
    const rightSide = document.createElement("div");
    rightSide.style.display = "flex";
    rightSide.style.alignItems = "center";
    rightSide.appendChild(button);
    rightSide.appendChild(settingsBtn);

    wrapper.appendChild(titleSpan);
    wrapper.appendChild(rightSide);
    title.appendChild(wrapper);
})();
