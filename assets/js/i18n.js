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
            title: 'SpriteSlice v2.4 · 精灵图处理工具',
            description: '精灵图处理工具：切割精灵图、拖拽调整顺序、GIF 拆帧合成精灵图并导出',
            
            // 头部
            header: {
                title: '精灵图处理工具',
                subtitle: '切割精灵图、拖拽调整顺序，并支持 GIF 拆帧合成精灵图导出'
            },
            
            // 文件上传
            upload: {
                title: '步骤 1: 选择图片（精灵图 / GIF）',
                selectFile: '选择图片',
                dragDrop: '或将文件拖拽到此处',
                supportedFormats: '支持 PNG、JPEG、WebP 精灵图切割；支持 GIF 拆帧合成精灵图。快捷键：Ctrl+O'
            },
            
            // 设置参数
            settings: {
                title: '设置分割参数',
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
                addNumber: '在导出切片上绘制序号',
                addNumberHelp: '影响导出的切片内容（不影响预览显示开关）',
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
                restoreTooltip: '恢复此图块',
                originalNumberPrefix: '原:'
            },
            
            // 操作按钮
            actions: {
                generatePreview: '生成预览',
                startSplit: '导出',
                exportTiles: '导出切片（ZIP）',
                exportSpriteSheet: '导出精灵图（PNG）',
                historyFiles: '历史文件',
                previewShortcut: '快捷键：Ctrl+P',
                splitShortcut: '快捷键：Ctrl+S（导出）'
            },
            
            // 历史记录
            history: {
                title: '历史导出文件',
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
                previewFailed: '预览失败',
                clearConfirm: '确定要清空所有历史记录吗？此操作不可撤销。',
                cleared: '所有历史记录已清空',
                clearFailed: '清空失败',
                zipNoImages: '压缩包内无图片文件'
            },
            
            // 状态消息
            status: {
                ready: '就绪',
                processing: '处理中...',
                generating: '正在生成预览...',
                splitting: '正在导出...',
                previewGenerated: '预览已生成',
                splitComplete: '导出完成',
                selectFile: '请选择图片文件',
                loadingImage: '正在加载图片...',
                processingGif: '正在解析 GIF 并合成精灵图...',
                exportingTiles: '正在导出切片，请稍候...',
                exportingSpriteSheet: '正在导出精灵图，请稍候...',
                exportComplete: '导出完成！',
                error: '处理出错'
            },
            
            // 通知消息
            notifications: {
                ready: 'SpriteSlice 已就绪',
                orderUpdated: '图块顺序已更新',
                orderReset: '图块顺序已重置',
                selectFile: '请先选择图片文件',
                previewError: '预览生成失败',
                splitError: '导出失败',
                historyCleared: '历史记录已清空',
                fileCopied: '文件已复制到剪贴板',
                languageChanged: '语言已切换',
                tileDeleted: '图块已删除',
                tileRestored: '图块已恢复',
                allTilesRestored: '所有已删除的图块已恢复',
                tileDeletedNumber: '图块 #{num} 已删除',
                tileRestoredNumber: '图块 #{num} 已恢复',
                historySaved: '历史记录已保存',
                historySaveFailed: '保存历史记录失败',
                browserUnsupported: '您的浏览器不支持以下功能: {features}',
                invalidFile: '请选择有效的图片文件（PNG、JPEG、GIF、WebP）',
                imageLoaded: '图片已加载: {width}x{height}',
                gifSpriteSheetReady: 'GIF 已合成精灵图：{frames} 帧（{cols}x{rows}）',
                processingWait: '正在处理中，请稍候...',
                exportedSpriteSheet: '精灵图已导出',
                exportedAndDownloaded: '导出完成，文件已下载',
                exportFailedRetry: '导出失败，请重试',
                imageLoadFailedRetry: '图片加载失败，请重试',
                missingJsZip: 'JSZip 库未加载，请检查网络连接或 CDN 可用性',
                appErrorRefresh: '应用发生错误，请刷新页面重试',
                operationFailedRetry: '操作失败，请重试',
                switchToGridMode: '请先切换到可拖拽网格模式'
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
                titleWithNumber: '图块 #{num} 预览',
                currentNumber: '当前序号',
                originalNumber: '原始序号',
                positionLabel: '位置',
                positionFormat: '第{row}行，第{col}列',
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
            },

            gifMeta: {
                title: 'GIF 参数',
                totalFrames: '总帧数',
                frameDelay: '帧间隔',
                fps: '平均帧率',
                duration: '总时长',
                loop: '循环',
                loopUnknown: '未知',
                loopInfinite: '是（无限）',
                loopCount: '是（{count}）'
            }
        },
        
        'en-US': {
            // Page title
            title: 'SpriteSlice v2.4 · Sprite Tool',
            description: 'Sprite tool: slice sprite sheets, reorder by drag-and-drop, and convert GIF to a spritesheet for export',
            
            // Header
            header: {
                title: 'Sprite Tool',
                subtitle: 'Slice sprite sheets, reorder by drag-and-drop, and export spritesheets from GIF'
            },
            
            // File upload
            upload: {
                title: 'Step 1: Select Image (Sprite / GIF)',
                selectFile: 'Select Image',
                dragDrop: 'or drag and drop files here',
                supportedFormats: 'PNG/JPEG/WebP for slicing; GIF for spritesheet export. Shortcut: Ctrl+O'
            },
            
            // Settings
            settings: {
                title: 'Slicing Parameters',
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
                addNumber: 'Draw numbers on exported tiles',
                addNumberHelp: 'Affects exported tiles (independent from preview-only numbering)',
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
                restoreAll: 'Restore All Tiles',
                showPreviewNumber: 'Show numbers in preview',
                showPreviewNumberHelp: 'Show numbers only in preview mode, does not affect final output',
                showDragGridNumber: 'Show numbers in drag grid',
                showDragGridNumberHelp: 'Controls number display on tiles in draggable grid mode',
                placeholder: 'Preview will be displayed after uploading an image',
                tilePreviewTooltip: 'Double-click to preview tile, right-click to delete',
                deleteTooltip: 'Delete this tile',
                restoreTooltip: 'Restore this tile',
                originalNumberPrefix: 'Orig:'
            },
            
            // Action buttons
            actions: {
                generatePreview: 'Generate Preview',
                startSplit: 'Export',
                exportTiles: 'Export Tiles (ZIP)',
                exportSpriteSheet: 'Export Spritesheet (PNG)',
                historyFiles: 'History Files',
                previewShortcut: 'Shortcut: Ctrl+P',
                splitShortcut: 'Shortcut: Ctrl+S (Export)'
            },
            
            // History
            history: {
                title: 'Export History',
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
                previewFailed: 'Preview failed',
                clearConfirm: 'Clear all history records? This action cannot be undone.',
                cleared: 'All history records cleared',
                clearFailed: 'Clear failed',
                zipNoImages: 'No image files found in the ZIP'
            },
            
            // Status messages
            status: {
                ready: 'Ready',
                processing: 'Processing...',
                generating: 'Generating preview...',
                splitting: 'Exporting...',
                previewGenerated: 'Preview generated',
                splitComplete: 'Export complete',
                selectFile: 'Please select an image file',
                loadingImage: 'Loading image...',
                processingGif: 'Parsing GIF and building a spritesheet...',
                exportingTiles: 'Exporting tiles, please wait...',
                exportingSpriteSheet: 'Exporting spritesheet, please wait...',
                exportComplete: 'Export complete!',
                error: 'Processing error'
            },
            
            // Notifications
            notifications: {
                ready: 'SpriteSlice is ready',
                orderUpdated: 'Tile order updated',
                orderReset: 'Tile order reset',
                selectFile: 'Please select an image file first',
                previewError: 'Preview generation failed',
                splitError: 'Export failed',
                historyCleared: 'History cleared',
                fileCopied: 'File copied to clipboard',
                languageChanged: 'Language switched',
                tileDeleted: 'Tile deleted',
                tileRestored: 'Tile restored',
                allTilesRestored: 'All deleted tiles restored',
                tileDeletedNumber: 'Tile #{num} deleted',
                tileRestoredNumber: 'Tile #{num} restored',
                historySaved: 'History saved',
                historySaveFailed: 'Failed to save history',
                browserUnsupported: 'Your browser does not support: {features}',
                invalidFile: 'Please select a valid image file (PNG, JPEG, GIF, WebP)',
                imageLoaded: 'Image loaded: {width}x{height}',
                gifSpriteSheetReady: 'GIF converted: {frames} frames ({cols}x{rows})',
                processingWait: 'Processing, please wait...',
                exportedSpriteSheet: 'Spritesheet exported',
                exportedAndDownloaded: 'Export complete. File downloaded.',
                exportFailedRetry: 'Export failed. Please try again.',
                imageLoadFailedRetry: 'Image loading failed. Please try again.',
                missingJsZip: 'JSZip is not loaded. Please check the CDN/network.',
                appErrorRefresh: 'Something went wrong. Please refresh and try again.',
                operationFailedRetry: 'Operation failed. Please try again.',
                switchToGridMode: 'Switch to Draggable Grid mode first'
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
                titleWithNumber: 'Tile #{num} Preview',
                currentNumber: 'Current No.',
                originalNumber: 'Original No.',
                positionLabel: 'Position',
                positionFormat: 'Row {row}, Col {col}',
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
            },

            gifMeta: {
                title: 'GIF Info',
                totalFrames: 'Frames',
                frameDelay: 'Frame Delay',
                fps: 'Avg FPS',
                duration: 'Duration',
                loop: 'Loop',
                loopUnknown: 'Unknown',
                loopInfinite: 'Yes (Infinite)',
                loopCount: 'Yes ({count})'
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
