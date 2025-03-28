// 로그 출력 함수
function log(message, type = "info") {
    const prefix = "[Lecto]";

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

// 미완료 강의 찾기
function findIncompleteLectures() {
    const rows = document.querySelectorAll(SELECTORS.LESSON_TABLE.ROW);
    const incompleteLectures = Array.from(rows).filter((row) => {
        const statusCell = row.querySelector(
            SELECTORS.LESSON_TABLE.STATUS_CELL
        );
        return !statusCell.querySelector(SELECTORS.LESSON_STATUS.COMPLETE);
    });
    return incompleteLectures;
}

// 강의 URL 추출 함수
function extractLectureUrl(lectureRow) {
    const studyButton = lectureRow.querySelector(
        SELECTORS.LESSON_TABLE.STUDY_BUTTON
    );

    if (!studyButton) {
        return null;
    }

    // chapter 값 가져오기
    const chapterCell = lectureRow.querySelector(
        SELECTORS.LESSON_TABLE.CHAPTER_CELL
    );
    const chapter = chapterCell ? chapterCell.textContent.trim() : "";

    let url = null;

    // onclick 속성에서 openViewer 함수 호출 패턴 확인
    if (studyButton.onclick || studyButton.getAttribute("onclick")) {
        const onclickStr =
            studyButton.getAttribute("onclick") ||
            studyButton.onclick.toString();
        const match = onclickStr.match(
            /openViewer\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'\)/
        );

        if (match) {
            // openViewer 함수의 매개변수 추출
            const cuid = match[1];
            const lid = match[2];

            // URL 구성
            url = `https://www.cccr-edu.or.kr/classroom/viewer.jsp?cuid=${cuid}&lid=${lid}&chapter=${chapter}`;
        }
    }

    return url;
}

// 강의 진도 추출
function extractStudyTime(lectureRow) {
    const strongElem = lectureRow.querySelector(SELECTORS.LESSON_TABLE.TIME);
    if (!strongElem) {
        return null;
    }
    // 숫자만 추출
    const number = parseInt(strongElem.textContent.trim(), 10);
    return number;
}
