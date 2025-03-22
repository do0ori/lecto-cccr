const SELECTORS = {
    TITLE: "h5.tb_title",
    AUTOMATION_BUTTON: "lecto-start-button",

    LESSON_STATUS: {
        COMPLETE: "span.lesson_complete",
        PROCEEDING: "span.lesson_proceeding",
        INCOMPLETE: "span.lesson_incomplete",
    },

    LESSON_TABLE: {
        ROW: "tbody tr",
        STUDY_BUTTON: "button.btn_study",
        STATUS_CELL: "td.col_lesson_status",
        CHAPTER_CELL: "td.col_lesson_idx",
        TIME: "p.study_time strong",
    },

    PLAYER: {
        IFRAME: "player",
    },
};

const ACTIONS = {
    EXECUTE_AUTOMATION: "EXECUTE_AUTOMATION",
    STOP_AUTOMATION: "STOP_AUTOMATION",
    END_AUTOMATION: "END_AUTOMATION",
    PROCESS_NEXT_LECTURE: "PROCESS_NEXT_LECTURE",
    GET_STATE: "GET_STATE",
    KEEP_ALIVE: "KEEP_ALIVE",
    OPEN_LECTURE_TAB: "OPEN_LECTURE_TAB",
    CLOSE_CURRENT_TAB: "CLOSE_CURRENT_TAB",
};

const PLAYER_STATE = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
};
