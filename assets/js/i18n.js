/**
 * 国际化配置
 * Internationalization Configuration
 */

const i18n = {
    // 当前语言
    currentLanguage: 'zh-CN',
    
    // 支持的语言
    supportedLanguages: {
        'zh-CN': '简体中文',
        'en-US': 'English'
    },
    
    // 翻译文本
    translations: {
        'zh-CN': {
            // 页面标题
            title: '精灵图切割工具 v2.4',
            description: '专业的图片切割工具，支持多种排序方式和批量处理',
            
            // 头部
            header: {
                title: '精灵图切割工具',
                subtitle: '专业的图片切割工具，支持多种排序方式和批量处理'
            },
            
            // 文件上传
            upload: {
                title: '步骤 1: 选择精灵图',
                selectFile: '选择图片文件',
                dragDrop: '或将文件拖拽到此处',
                supportedFormats: '支持 PNG、JPEG、GIF、WebP 格式，快捷键：Ctrl+O'
            },
            
            // 设置参数
            settings: {
                title: '设置切割参数',
                basicTab: '基础参数',
                advancedTab: '高级选项',
                rows: '行数:',
                cols: '列数:',
                startNum: '起始序号:',
                fontSize: '字号:',
                rowsRange: '范围: 1-50',
                colsRange: '范围: 1-50',
                startNumHelp: '从此数字开始编号',
                fontSizeRange: '范围: 8-100px',
                addNumber: '在切割图片上添加序号',
                addNumberHelp: '最终输出的图片文件是否包含序号',
                sortDirection: '排序方向',
                sortNormal: '正常排序（从左到右，从上到下）',
                sortOddLeftEvenRight: '奇数行从左到右，偶数行从右到左排序',
                sortEvenLeftOddRight: '偶数行从左到右，奇数行从右到左排序',
                sortReverse: '倒序排序（从右到左，从下到上）'
            },
            
            // 预览区域
            preview: {
                title: '预览',
                imagePreview: '图像预览',
                draggableGrid: '可拖拽网格',
                resetOrder: '重置图块顺序',
                restoreAll: '恢复所有图块',
                showPreviewNumber: '预览时显示序号',
                showPreviewNumberHelp: '仅在预览模式下显示序号，不影响最终输出',
                showDragGridNumber: '拖拽网格中显示序号',
                showDragGridNumberHelp: '控制拖拽网格模式下图块上的序号显示',
                placeholder: '上传图片后将显示预览',
                tilePreviewTooltip: '双击预览图块，右键删除',
                deleteTooltip: '删除此图块',
                restoreTooltip: '恢复此图块'
            },
            
            // 操作按钮
            actions: {
                generatePreview: '生成预览',
                startSplit: '开始切割',
                historyFiles: '历史文件',
                previewShortcut: '快捷键：Ctrl+P',
                splitShortcut: '快捷键：Ctrl+S'
            },
            
            // 历史记录
            history: {
                title: '历史切割文件',
                clearAll: '清空全部',
                close: '关闭',
                empty: '暂无历史记录',
                download: '下载',
                preview: '预览',
                delete: '删除',
                deleted: '历史记录已删除',
                deleteFailed: '删除失败',
                downloadStart: '下载开始',
                downloadFailed: '下载失败',
                previewFailed: '预览失败'
            },
            
            // 状态消息
            status: {
                ready: '就绪',
                processing: '处理中...',
                generating: '正在生成预览...',
                splitting: '正在切割图片...',
                previewGenerated: '预览已生成',
                splitComplete: '切割完成',
                error: '处理出错'
            },
            
            // 通知消息
            notifications: {
                ready: '精灵图切割工具已就绪',
                orderUpdated: '图块顺序已更新',
                orderReset: '图块顺序已重置',
                selectFile: '请先选择图片文件',
                previewError: '预览生成失败',
                splitError: '图片切割失败',
                historyCleared: '历史记录已清空',
                fileCopied: '文件已复制到剪贴板',
                languageChanged: '语言已切换',
                tileDeleted: '图块已删除',
                tileRestored: '图块已恢复',
                allTilesRestored: '所有已删除的图块已恢复'
            },
            
            // 作者信息
            author: {
                by: '作者：',
                name: 'Arminosi',
                openSource: '开源项目：',
                projectName: 'SpriteSlice'
            },
            
            // 图块预览模态框
            tilePreview: {
                title: '图块预览',
                position: '位置：',
                size: '尺寸：',
                index: '索引：',
                close: '关闭'
            },
            
            // 预览配置信息
            previewConfig: {
                config: '切割配置:',
                rows: '行',
                cols: '列',
                total: '共',
                tiles: '个图块'
            }
        },
        
        'en-US': {
            // Page title
            title: 'Sprite Cutting Tool v2.4',
            description: 'Professional image cutting tool with multiple sorting methods and batch processing',
            
            // Header
            header: {
                title: 'Sprite Cutting Tool',
                subtitle: 'Professional image cutting tool with multiple sorting methods and batch processing'
            },
            
            // File upload
            upload: {
                title: 'Step 1: Select Sprite Image',
                selectFile: 'Select Image File',
                dragDrop: 'or drag and drop files here',
                supportedFormats: 'Supports PNG, JPEG, GIF, WebP formats, Shortcut: Ctrl+O'
            },
            
            // Settings
            settings: {
                title: 'Cutting Parameters',
                basicTab: 'Basic Parameters',
                advancedTab: 'Advanced Options',
                rows: 'Rows:',
                cols: 'Columns:',
                startNum: 'Start Number:',
                fontSize: 'Font Size:',
                rowsRange: 'Range: 1-50',
                colsRange: 'Range: 1-50',
                startNumHelp: 'Start numbering from this number',
                fontSizeRange: 'Range: 8-100px',
                addNumber: 'Add numbers to cut images',
                addNumberHelp: 'Whether the final output image files include numbers',
                sortDirection: 'Sort Direction',
                sortNormal: 'Normal sort (left to right, top to bottom)',
                sortOddLeftEvenRight: 'Odd rows left to right, even rows right to left',
                sortEvenLeftOddRight: 'Even rows left to right, odd rows right to left',
                sortReverse: 'Reverse sort (right to left, bottom to top)'
            },
            
            // Preview area
            preview: {
                title: 'Preview',
                imagePreview: 'Image Preview',
                draggableGrid: 'Draggable Grid',
                resetOrder: 'Reset Tile Order',
                showPreviewNumber: 'Show numbers in preview',
                showPreviewNumberHelp: 'Show numbers only in preview mode, does not affect final output',
                showDragGridNumber: 'Show numbers in drag grid',
                showDragGridNumberHelp: 'Controls number display on tiles in draggable grid mode',
                placeholder: 'Preview will be displayed after uploading an image',
                tilePreviewTooltip: 'Double-click to preview tile'
            },
            
            // Action buttons
            actions: {
                generatePreview: 'Generate Preview',
                startSplit: 'Start Cutting',
                historyFiles: 'History Files',
                previewShortcut: 'Shortcut: Ctrl+P',
                splitShortcut: 'Shortcut: Ctrl+S'
            },
            
            // History
            history: {
                title: 'History Cutting Files',
                clearAll: 'Clear All',
                close: 'Close',
                empty: 'No history records',
                download: 'Download',
                preview: 'Preview',
                delete: 'Delete',
                deleted: 'History record deleted',
                deleteFailed: 'Delete failed',
                downloadStart: 'Download started',
                downloadFailed: 'Download failed',
                previewFailed: 'Preview failed'
            },
            
            // Status messages
            status: {
                ready: 'Ready',
                processing: 'Processing...',
                generating: 'Generating preview...',
                splitting: 'Cutting image...',
                previewGenerated: 'Preview generated',
                splitComplete: 'Cutting complete',
                error: 'Processing error'
            },
            
            // Notifications
            notifications: {
                ready: 'Sprite cutting tool is ready',
                orderUpdated: 'Tile order updated',
                orderReset: 'Tile order reset',
                selectFile: 'Please select an image file first',
                previewError: 'Preview generation failed',
                splitError: 'Image cutting failed',
                historyCleared: 'History cleared',
                fileCopied: 'File copied to clipboard',
                languageChanged: 'Language switched'
            },
            
            // Author info
            author: {
                by: 'Author:',
                name: 'Arminosi',
                openSource: 'Open Source:',
                projectName: 'SpriteSlice'
            },
            
            // Tile preview modal
            tilePreview: {
                title: 'Tile Preview',
                position: 'Position:',
                size: 'Size:',
                index: 'Index:',
                close: 'Close'
            },
            
            // Preview configuration info
            previewConfig: {
                config: 'Cutting Config:',
                rows: 'rows',
                cols: 'cols',
                total: 'Total',
                tiles: 'tiles'
            }
        }
    },
    
    /**
     * 获取翻译文本
     * @param {string} key - 翻译键，支持点号分隔的嵌套键
     * @returns {string} 翻译文本
     */
    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                // 如果找不到翻译，尝试英文
                value = this.translations['en-US'];
                for (const k2 of keys) {
                    if (value && typeof value === 'object') {
                        value = value[k2];
                    } else {
                        return key; // 都找不到就返回原键
                    }
                }
                break;
            }
        }
        
        return typeof value === 'string' ? value : key;
    },
    
    /**
     * 切换语言
     * @param {string} language - 语言代码
     */
    switchLanguage(language) {
        if (this.supportedLanguages[language]) {
            this.currentLanguage = language;
            this.updatePageTexts();
            this.saveLanguagePreference();
            
            // 触发语言切换事件
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language }
            }));
        }
    },
    
    /**
     * 更新页面文本
     */
    updatePageTexts() {
        // 更新页面标题
        document.title = this.t('title');
        
        // 更新meta描述
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = this.t('description');
        }
        
        // 更新所有带有data-i18n属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.t(key);
            
            if (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit')) {
                element.value = text;
            } else if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                element.placeholder = text;
            } else {
                element.textContent = text;
            }
        });
        
        // 更新带有data-i18n-attr属性的元素属性
        document.querySelectorAll('[data-i18n-attr]').forEach(element => {
            const attrConfig = element.getAttribute('data-i18n-attr');
            const [attr, key] = attrConfig.split(':');
            element.setAttribute(attr, this.t(key));
        });
    },
    
    /**
     * 保存语言偏好
     */
    saveLanguagePreference() {
        localStorage.setItem('sprite-cutter-language', this.currentLanguage);
    },
    
    /**
     * 加载语言偏好
     */
    loadLanguagePreference() {
        const saved = localStorage.getItem('sprite-cutter-language');
        if (saved && this.supportedLanguages[saved]) {
            this.currentLanguage = saved;
        }
    },
    
    /**
     * 初始化国际化
     */
    init() {
        this.loadLanguagePreference();
        this.updatePageTexts();
        
        // 更新语言切换器
        this.updateLanguageSwitcher();
    },
    
    /**
     * 更新语言切换器
     */
    updateLanguageSwitcher() {
        // 更新按钮状态
        updateLanguageButtonState(this.currentLanguage);
    }
};

// 导出到全局
window.i18n = i18n;

// 初始化国际化系统
function initializeI18n() {
    console.log('初始化国际化系统...');
    
    // 初始化i18n系统
    i18n.init();
    
    // 设置语言切换器事件监听
    const languageBtn = document.getElementById('languageSwitcher');
    console.log('找到语言切换按钮:', languageBtn);
    
    if (languageBtn) {
        // 设置初始状态
        updateLanguageButtonState(i18n.currentLanguage);
        
        languageBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 切换语言
            const currentLang = i18n.currentLanguage;
            const newLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
            
            console.log('切换语言从', currentLang, '到', newLang);
            
            i18n.switchLanguage(newLang);
            updateLanguageButtonState(newLang);
        });
    } else {
        console.error('未找到语言切换按钮元素 #languageSwitcher');
    }
}

// 更新语言按钮状态
function updateLanguageButtonState(language) {
    const languageBtn = document.getElementById('languageSwitcher');
    if (languageBtn) {
        languageBtn.setAttribute('data-lang', language);
    }
}

// 导出初始化函数
window.initializeI18n = initializeI18n;
