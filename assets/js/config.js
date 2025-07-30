/**
 * 精灵图切割工具配置文件
 */
const CONFIG = {
    // 应用信息
    APP: {
        NAME: '精灵图切割工具',
        VERSION: '2.0.0',
        AUTHOR: 'AI Assistant'
    },

    // 默认设置
    DEFAULTS: {
        ROWS: 8,
        COLS: 12,
        START_NUM: 0,
        FONT_SIZE: 20,
        ADD_NUMBER: true,
        SORT_DIRECTION: 'normal'
    },

    // 限制值
    LIMITS: {
        MIN_ROWS: 1,
        MAX_ROWS: 50,
        MIN_COLS: 1,
        MAX_COLS: 50,
        MIN_FONT_SIZE: 8,
        MAX_FONT_SIZE: 100,
        MAX_HISTORY_COUNT: 15
    },

    // 支持的文件类型
    SUPPORTED_FORMATS: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],

    // UI设置
    UI: {
        ANIMATION_DURATION: 300,
        PREVIEW_MAX_WIDTH: 800,
        PREVIEW_MAX_HEIGHT: 600,
        GRID_COLOR: '#e53e3e',
        TEXT_COLOR: '#e53e3e',
        GRID_LINE_WIDTH: 2
    },

    // 存储键名
    STORAGE_KEYS: {
        HISTORY: 'spritecut_history',
        SETTINGS: 'spritecut_settings'
    },

    // 排序方向选项
    SORT_DIRECTIONS: {
        NORMAL: 'normal',
        ODD_LEFT_EVEN_RIGHT: 'oddLeftEvenRight',
        EVEN_LEFT_ODD_RIGHT: 'evenLeftOddRight'
    }
};

// 导出配置（如果支持模块）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
