// 강의 자동화 메인 스크립트
(function () {
    // 강의 페이지 열기
    function openLecturePage(lectureRow) {
        const url = extractLectureUrl(lectureRow);

        if (!url) {
            log("강의 URL을 추출할 수 없습니다.", "error");

            // URL을 추출할 수 없는 경우 직접 버튼 클릭 시도
            const studyButton = lectureRow.querySelector(
                SELECTORS.LESSON_TABLE.STUDY_BUTTON
            );
            if (studyButton) {
                log("URL을 추출할 수 없어 직접 버튼 클릭", "warning");
                studyButton.click();
            } else {
                log("수강 버튼을 찾을 수 없습니다.", "error");
                return false;
            }
        } else {
            // background.js에 메시지 전송
            log(`강의 URL 추출 성공: ${url}`, "success");
            chrome.runtime.sendMessage({
                action: ACTIONS.OPEN_LECTURE_TAB,
                url: url,
            });
        }

        return true;
    }

    // 실행 시작
    function start() {
        // 미완료 강의 찾기
        const incompleteLessons = findIncompleteLectures();
        if (incompleteLessons.length === 0) {
            log("모든 강의가 완료되었습니다.", "success");
            chrome.runtime.sendMessage({
                action: ACTIONS.END_AUTOMATION,
            });
            return;
        }

        openLecturePage(incompleteLessons[0]);
    }

    // 실행
    start();
})();
