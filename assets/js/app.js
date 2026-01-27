/**
 * 主应用类 - 精灵图切割工具
 */
class SpriteCutter {
    constructor() {
        this.imageProcessor = new ImageProcessor();
        this.historyManager = new HistoryManager();
        this.draggableGrid = new DraggableGrid();
        this.currentImage = null;
        this.currentFile = null;
        this.gifSpriteSheet = null;
        this.isProcessing = false;
        this.customTileOrder = null; // 存储自定义的图块顺序
        
        this.init();
    }

    t(key, params) {
        const template = (window.i18n && typeof window.i18n.t === 'function') ? window.i18n.t(key) : key;
        if (!params) return template;
        return template.replace(/\{(\w+)\}/g, (_, name) => {
            return Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : `{${name}}`;
        });
    }

    /**
     * 初始化应用
     */
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setupDragDrop();
        this.checkBrowserSupport();
        this.loadSettings();
        this.initializePreviewState(); // 初始化预览状态
        
        Utils.showNotification(this.t('notifications.ready'), 'success', 2000);
    }

    /**
     * 设置元素引用
     */
    setupElements() {
        this.elements = {
            fileInput: document.getElementById('fileInput'),
            fileNameDisplay: document.getElementById('fileNameDisplay'),
            gifMetaPanel: document.getElementById('gifMetaPanel'),
            dropArea: document.getElementById('dropArea'),
            previewBtn: document.getElementById('previewBtn'),
            splitBtn: document.getElementById('splitBtn'),
            resetOrderBtn: document.getElementById('resetOrderBtn'),
            restoreAllBtn: document.getElementById('restoreAllBtn'),
            previewImg: document.getElementById('previewImg'),
            draggableGrid: document.getElementById('draggableGrid'),
            previewPlaceholder: document.getElementById('previewPlaceholder'),
            statusMessage: document.getElementById('statusMessage'),
            
            // 设置元素
            rows: document.getElementById('rows'),
            cols: document.getElementById('cols'),
            startNum: document.getElementById('startNum'),
            fontSize: document.getElementById('fontSize'),
            addNumber: document.getElementById('addNumber'),
            showPreviewNumber: document.getElementById('showPreviewNumber'),
            sortDirectionInputs: document.querySelectorAll('input[name="sortDirection"]'),
            previewModeInputs: document.querySelectorAll('input[name="previewMode"]')
        };
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 文件选择
        this.elements.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // 预览按钮
        this.elements.previewBtn.addEventListener('click', () => {
            this.generatePreview();
        });

        // 切割按钮
        this.elements.splitBtn.addEventListener('click', () => {
            this.splitImage();
        });

        // 重置顺序按钮
        this.elements.resetOrderBtn.addEventListener('click', () => {
            this.resetTileOrder();
        });

        // 恢复所有图块按钮
        this.elements.restoreAllBtn.addEventListener('click', () => {
            this.restoreAllTiles();
        });

        // 设置变化监听（实时预览）
        const settingsElements = [
            this.elements.rows, this.elements.cols, this.elements.startNum,
            this.elements.fontSize, this.elements.addNumber, this.elements.showPreviewNumber,
            ...this.elements.sortDirectionInputs
        ];

        settingsElements.forEach(element => {
            const eventType = element.type === 'checkbox' || element.type === 'radio' ? 'change' : 'input';
            element.addEventListener(eventType, Utils.debounce(() => {
                if (this.currentImage) {
                    this.generatePreview();
                }
                this.saveSettings();
            }, 500));
        });

        // 预览模式切换监听
        this.elements.previewModeInputs.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateNumberControlsVisibility();
                if (this.currentImage) {
                    this.generatePreview();
                }
            });
        });

        // 初始化序号控制显示状态
        this.updateNumberControlsVisibility();

        // 监听可拖拽网格的顺序变化
        this.elements.draggableGrid.addEventListener('tileOrderChanged', (e) => {
            this.customTileOrder = e.detail.order;
            this.updateRestoreButtonVisibility();
            Utils.showNotification(this.t('notifications.orderUpdated'), 'success', 2000);
        });

        window.addEventListener('languageChanged', () => {
            this.updateActionButtons();
            if (!this.currentImage) {
                this.updateStatus(this.t('status.selectFile'));
            }
            if (this.gifSpriteSheet && this.gifSpriteSheet.gifMeta) {
                this.showGifMetaPanel(this.gifSpriteSheet.gifMeta);
            }
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'o':
                        e.preventDefault();
                        this.elements.fileInput.click();
                        break;
                    case 'p':
                        e.preventDefault();
                        this.generatePreview();
                        break;
                    case 's':
                        e.preventDefault();
                        this.splitImage();
                        break;
                }
            }
        });

        // 禁用预览区域的右键菜单，避免与图块右键删除功能冲突
        this.elements.previewImg.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // 禁用预览容器的右键菜单
        const previewContainer = document.querySelector('.preview-container');
        if (previewContainer) {
            previewContainer.addEventListener('contextmenu', (e) => {
                // 如果右键点击的是图块，则允许图块处理右键事件
                if (e.target.classList.contains('grid-tile')) {
                    return;
                }
                // 其他情况阻止右键菜单
                e.preventDefault();
            });
        }
    }

    /**
     * 设置拖拽上传
     */
    setupDragDrop() {
        const dropArea = this.elements.dropArea;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.remove('drag-over');
            }, false);
        });

        dropArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        }, false);
    }

    /**
     * 阻止默认事件
     */
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * 检查浏览器支持
     */
    checkBrowserSupport() {
        const support = Utils.checkBrowserSupport();
        const unsupported = Object.entries(support)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (unsupported.length > 0) {
            Utils.showNotification(
                this.t('notifications.browserUnsupported', { features: unsupported.join(', ') }),
                'warning',
                5000
            );
        }
    }

    /**
     * 处理文件选择
     */
    async handleFileSelect(file) {
        if (!file) {
            this.resetFileDisplay();
            return;
        }

        if (!Utils.isValidImageFile(file)) {
            Utils.showNotification(this.t('notifications.invalidFile'), 'error');
            this.resetFileDisplay();
            return;
        }

        try {
            this.currentFile = file;
            this.gifSpriteSheet = null;
            this.hideGifMetaPanel();
            this.updateStatus(this.t('status.loadingImage'));
            this.elements.fileNameDisplay.textContent = `${file.name} (${Utils.formatFileSize(file.size)})`;
            
            if (file.type === 'image/gif') {
                this.updateStatus(this.t('status.processingGif'));
                const result = await this.imageProcessor.processGif(file);
                this.gifSpriteSheet = result;
                this.showGifMetaPanel(result.gifMeta);

                const img = new Image();
                img.src = result.canvas.toDataURL('image/png');
                await new Promise(resolve => (img.onload = resolve));
                this.currentImage = img;

                const imageModeRadio = document.querySelector('input[name="previewMode"][value="image"]');
                if (imageModeRadio) {
                    imageModeRadio.checked = true;
                }
                this.updateNumberControlsVisibility();

                Utils.showNotification(
                    this.t('notifications.gifSpriteSheetReady', {
                        frames: result.frameCount,
                        cols: result.cols,
                        rows: result.rows
                    }),
                    'success'
                );
            } else {
                this.currentImage = await Utils.loadImage(file);
            }
            
            // 显示图片信息
            const info = this.imageProcessor.getImageInfo(this.currentImage);
            Utils.showNotification(
                this.t('notifications.imageLoaded', { width: info.width, height: info.height }),
                'success'
            );

            this.updateActionButtons();

            // 自动生成预览
            await this.generatePreview();
            
        } catch (error) {
            console.error('图片加载失败:', error);
            Utils.showNotification(this.t('notifications.imageLoadFailedRetry'), 'error');
            this.resetFileDisplay();
        }
    }

    /**
     * 重置文件显示
     */
    resetFileDisplay() {
        this.currentImage = null;
        this.currentFile = null;
        this.gifSpriteSheet = null;
        this.elements.fileNameDisplay.textContent = this.t('upload.dragDrop');
        this.hideGifMetaPanel();
        this.elements.previewImg.style.display = 'none';
        this.elements.previewPlaceholder.style.display = 'block';
        this.updateStatus(this.t('status.selectFile'));
        this.updateActionButtons();
    }

    hideGifMetaPanel() {
        if (!this.elements.gifMetaPanel) return;
        this.elements.gifMetaPanel.style.display = 'none';
        this.elements.gifMetaPanel.innerHTML = '';
    }

    showGifMetaPanel(meta) {
        if (!this.elements.gifMetaPanel) return;
        if (!meta || !meta.frameCount) {
            this.hideGifMetaPanel();
            return;
        }

        const delayText = (() => {
            if (typeof meta.minDelayMs !== 'number' || typeof meta.maxDelayMs !== 'number') return '-';
            const min = Math.round(meta.minDelayMs);
            const max = Math.round(meta.maxDelayMs);
            return min === max ? `${min} ms` : `${min}–${max} ms`;
        })();

        const fpsText = typeof meta.fps === 'number' ? meta.fps.toFixed(2) : '-';
        const durationText = typeof meta.durationMs === 'number' ? `${(meta.durationMs / 1000).toFixed(2)} s` : '-';

        const loopText = (() => {
            if (meta.loopCount === null || meta.loopCount === undefined) return this.t('gifMeta.loopUnknown');
            if (meta.loopCount === 0) return this.t('gifMeta.loopInfinite');
            return this.t('gifMeta.loopCount', { count: meta.loopCount });
        })();

        this.elements.gifMetaPanel.innerHTML = `
            <div class="gif-meta-title">${this.t('gifMeta.title')}</div>
            <div class="gif-meta-grid">
                <div class="gif-meta-key">${this.t('gifMeta.totalFrames')}</div>
                <div class="gif-meta-val">${meta.frameCount}</div>
                <div class="gif-meta-key">${this.t('gifMeta.frameDelay')}</div>
                <div class="gif-meta-val">${delayText}</div>
                <div class="gif-meta-key">${this.t('gifMeta.fps')}</div>
                <div class="gif-meta-val">${fpsText}</div>
                <div class="gif-meta-key">${this.t('gifMeta.duration')}</div>
                <div class="gif-meta-val">${durationText}</div>
                <div class="gif-meta-key">${this.t('gifMeta.loop')}</div>
                <div class="gif-meta-val">${loopText}</div>
            </div>
        `;
        this.elements.gifMetaPanel.style.display = 'block';
    }

    /**
     * 生成预览
     */
    async generatePreview() {
        if (!this.currentImage) {
            Utils.showNotification(this.t('notifications.selectFile'), 'warning');
            return;
        }

        if (this.isProcessing) return;

        try {
            this.isProcessing = true;
            this.updateStatus(this.t('status.generating'));
            
            const settings = this.getSettings();
            const previewMode = document.querySelector('input[name="previewMode"]:checked').value;

            if (this.gifSpriteSheet) {
                this.elements.draggableGrid.classList.remove('active');
                this.elements.draggableGrid.style.display = 'none';
                this.elements.previewPlaceholder.style.display = 'none';
                this.elements.previewImg.src = this.currentImage.src;
                this.elements.previewImg.style.display = 'block';
                this.updateStatus(this.t('status.previewGenerated'));
                return;
            }
            
            if (previewMode === 'grid') {
                // 显示可拖拽网格
                this.elements.previewImg.style.display = 'none';
                this.elements.draggableGrid.classList.add('active');
                this.elements.draggableGrid.style.removeProperty('display'); // 移除内联样式让CSS类生效
                this.elements.previewPlaceholder.style.display = 'none';
                
                // 可拖拽网格模式下，序号始终显示，不受addNumber影响
                const gridSettings = { ...settings, addNumber: true };
                this.draggableGrid.init(this.elements.draggableGrid, this.currentImage, gridSettings);
                this.updateRestoreButtonVisibility();
            } else {
                // 显示传统图像预览
                this.elements.draggableGrid.classList.remove('active');
                this.elements.draggableGrid.style.display = 'none'; // 强制隐藏
                this.elements.previewPlaceholder.style.display = 'none';
                
                // 图像预览模式下，使用showPreviewNumber控制序号显示
                const showPreviewNumber = this.elements.showPreviewNumber && this.elements.showPreviewNumber.checked;
                const previewSettings = { ...settings, addNumber: showPreviewNumber };
                const previewDataUrl = this.imageProcessor.generatePreview(this.currentImage, previewSettings);
                this.elements.previewImg.src = previewDataUrl;
                this.elements.previewImg.style.display = 'block';
                
                // 确保图像加载完成后再显示
                this.elements.previewImg.onload = () => {
                    console.log('图像预览已加载，显示状态:', this.elements.previewImg.style.display);
                };
                
                console.log('切换到图像预览模式，showPreviewNumber:', showPreviewNumber);
            }
            
            this.updateStatus(this.t('status.previewGenerated'));
            
        } catch (error) {
            console.error('预览生成失败:', error);
            Utils.showNotification(this.t('notifications.previewError'), 'error');
            this.updateStatus(this.t('notifications.previewError'));
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * 根据预览模式更新序号控制的显示状态
     */
    updateNumberControlsVisibility() {
        const previewMode = document.querySelector('input[name="previewMode"]:checked').value;
        const imageControl = document.getElementById('imagePreviewNumberControl');
        const gridControl = document.getElementById('gridPreviewNumberControl');

        if (this.gifSpriteSheet) {
            if (gridControl) gridControl.style.display = 'none';
            if (imageControl) imageControl.style.display = 'none';
            return;
        }
        
        if (previewMode === 'grid') {
            // 可拖拽网格模式 - 显示网格序号控制，隐藏图像序号控制
            if (gridControl) gridControl.style.display = 'block';
            if (imageControl) imageControl.style.display = 'none';
        } else {
            // 图像预览模式 - 显示图像序号控制，隐藏网格序号控制
            if (imageControl) imageControl.style.display = 'block';
            if (gridControl) gridControl.style.display = 'none';
        }
    }

    /**
     * 初始化预览状态
     */
    initializePreviewState() {
        // 确保拖拽网格初始状态是隐藏的
        this.elements.draggableGrid.classList.remove('active');
        // 确保预览图片初始状态是隐藏的
        this.elements.previewImg.style.display = 'none';
        // 显示占位符
        this.elements.previewPlaceholder.style.display = 'block';
    }

    /**
     * 切割图片
     */
    async splitImage() {
        if (!this.currentImage) {
            Utils.showNotification(this.t('notifications.selectFile'), 'warning');
            return;
        }

        if (!this.gifSpriteSheet && typeof JSZip === 'undefined') {
            Utils.showNotification(this.t('notifications.missingJsZip'), 'error');
            this.updateStatus(this.t('notifications.splitError'));
            return;
        }

        if (this.isProcessing) {
            Utils.showNotification(this.t('notifications.processingWait'), 'warning');
            return;
        }

        try {
            this.isProcessing = true;
            this.elements.splitBtn.disabled = true;
            this.updateStatus(this.gifSpriteSheet ? this.t('status.exportingSpriteSheet') : this.t('status.exportingTiles'));

            if (this.gifSpriteSheet) {
                const blob = await new Promise(resolve => {
                    this.gifSpriteSheet.canvas.toBlob(resolve, 'image/png');
                });

                const originalName = (this.currentFile && this.currentFile.name) ? this.currentFile.name : 'gif';
                const baseName = originalName.replace(/\.[^/.]+$/, '');
                const timestamp = Utils.formatDateTime().replace(/[:\s]/g, '_');
                const filename = `${baseName}_spritesheet_${this.gifSpriteSheet.cols}x${this.gifSpriteSheet.rows}_${timestamp}.png`;
                Utils.downloadFile(blob, filename);

                this.updateStatus(this.t('status.exportComplete'));
                Utils.showNotification(this.t('notifications.exportedSpriteSheet'), 'success');
                return;
            }

            const settings = this.getSettings();
            
            // 如果有自定义顺序，添加到设置中
            if (this.customTileOrder) {
                settings.customOrder = this.customTileOrder;
            }
            
            const zipBlob = await this.imageProcessor.splitImage(this.currentImage, settings);
            
            // 生成文件名
            const timestamp = Utils.formatDateTime().replace(/[:\s]/g, '_');
            const filename = `SpriteSlice_export_${timestamp}.zip`;
            
            // 下载文件
            Utils.downloadFile(zipBlob, filename);
            
            // 保存到历史
            await this.historyManager.save(filename, zipBlob, settings);
            
            this.updateStatus(this.t('status.exportComplete'));
            Utils.showNotification(this.t('notifications.exportedAndDownloaded'), 'success');
            
        } catch (error) {
            console.error('图片切割失败:', error);
            Utils.showNotification(this.t('notifications.exportFailedRetry'), 'error');
            this.updateStatus(this.t('notifications.splitError'));
        } finally {
            this.isProcessing = false;
            this.elements.splitBtn.disabled = false;
        }
    }

    /**
     * 获取当前设置
     */
    getSettings() {
        const sortDirection = document.querySelector('input[name="sortDirection"]:checked')?.value || CONFIG.DEFAULTS.SORT_DIRECTION;
        
        return {
            rows: Math.max(CONFIG.LIMITS.MIN_ROWS, Math.min(parseInt(this.elements.rows.value) || CONFIG.DEFAULTS.ROWS, CONFIG.LIMITS.MAX_ROWS)),
            cols: Math.max(CONFIG.LIMITS.MIN_COLS, Math.min(parseInt(this.elements.cols.value) || CONFIG.DEFAULTS.COLS, CONFIG.LIMITS.MAX_COLS)),
            startNum: Math.max(0, parseInt(this.elements.startNum.value) || CONFIG.DEFAULTS.START_NUM),
            fontSize: Math.max(CONFIG.LIMITS.MIN_FONT_SIZE, Math.min(parseInt(this.elements.fontSize.value) || CONFIG.DEFAULTS.FONT_SIZE, CONFIG.LIMITS.MAX_FONT_SIZE)),
            addNumber: this.elements.addNumber.checked,
            showPreviewNumber: this.elements.showPreviewNumber.checked,
            sortDirection
        };
    }

    /**
     * 保存设置到本地存储
     */
    saveSettings() {
        try {
            const settings = this.getSettings();
            localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    }

    /**
     * 从本地存储加载设置
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
            if (!saved) return;

            const settings = JSON.parse(saved);
            
            this.elements.rows.value = settings.rows || CONFIG.DEFAULTS.ROWS;
            this.elements.cols.value = settings.cols || CONFIG.DEFAULTS.COLS;
            this.elements.startNum.value = settings.startNum || CONFIG.DEFAULTS.START_NUM;
            this.elements.fontSize.value = settings.fontSize || CONFIG.DEFAULTS.FONT_SIZE;
            this.elements.addNumber.checked = settings.addNumber !== undefined ? settings.addNumber : false; // 默认不添加序号到最终图片
            this.elements.showPreviewNumber.checked = settings.showPreviewNumber !== undefined ? settings.showPreviewNumber : true; // 默认在预览中显示序号
            
            // 设置排序方向
            const sortRadio = document.querySelector(`input[name="sortDirection"][value="${settings.sortDirection || CONFIG.DEFAULTS.SORT_DIRECTION}"]`);
            if (sortRadio) {
                sortRadio.checked = true;
            }
            
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    }

    /**
     * 更新状态显示
     */
    updateStatus(message) {
        if (this.elements.statusMessage) {
            this.elements.statusMessage.textContent = message;
        }
    }

    /**
     * 重置图块顺序
     */
    resetTileOrder() {
        if (this.draggableGrid && this.elements.draggableGrid.style.display !== 'none') {
            this.draggableGrid.resetOrder();
            this.customTileOrder = null;
            this.updateRestoreButtonVisibility();
            Utils.showNotification(this.t('notifications.orderReset'), 'success', 2000);
        } else {
            Utils.showNotification(this.t('notifications.switchToGridMode'), 'warning', 3000);
        }
    }

    /**
     * 恢复所有图块
     */
    restoreAllTiles() {
        if (this.draggableGrid && this.elements.draggableGrid.style.display !== 'none') {
            this.draggableGrid.resetDeletions();
            this.updateRestoreButtonVisibility();
        } else {
            Utils.showNotification(this.t('notifications.switchToGridMode'), 'warning', 3000);
        }
    }

    updateActionButtons() {
        if (!this.elements || !this.elements.splitBtn) return;
        if (!this.currentImage) {
            this.elements.splitBtn.textContent = this.t('actions.startSplit');
            return;
        }
        this.elements.splitBtn.textContent = this.gifSpriteSheet ? this.t('actions.exportSpriteSheet') : this.t('actions.exportTiles');
    }

    /**
     * 更新恢复按钮的显示状态
     */
    updateRestoreButtonVisibility() {
        if (!this.draggableGrid || !this.elements.restoreAllBtn) return;
        
        // 检查是否有已删除的图块
        const hasDeletedTiles = this.draggableGrid.tiles && this.draggableGrid.tiles.some(tile => 
            tile.dataset.deleted === 'true'
        );
        
        // 显示或隐藏恢复按钮
        this.elements.restoreAllBtn.style.display = hasDeletedTiles ? 'inline-block' : 'none';
    }

    /**
     * 重置应用状态
     */
    reset() {
        this.resetFileDisplay();
        this.isProcessing = false;
        this.elements.splitBtn.disabled = false;
        this.imageProcessor.dispose();
    }

    /**
     * 销毁应用
     */
    destroy() {
        this.reset();
        this.imageProcessor = null;
        this.historyManager = null;
        this.currentImage = null;
    }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 检查必要的依赖
    if (typeof JSZip === 'undefined') {
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
            Utils.showNotification((window.i18n && typeof window.i18n.t === 'function') ? window.i18n.t('notifications.missingJsZip') : 'JSZip is not loaded', 'warning');
        }
    }

    // 初始化应用
    window.spriteCutter = new SpriteCutter();
    
    // 全局错误处理
    window.addEventListener('error', (e) => {
        console.error('应用错误:', e.error);
        Utils.showNotification((window.i18n && typeof window.i18n.t === 'function') ? window.i18n.t('notifications.appErrorRefresh') : 'Application error', 'error');
    });
    
    // 未处理的Promise错误
    window.addEventListener('unhandledrejection', (e) => {
        console.error('未处理的Promise错误:', e.reason);
        Utils.showNotification((window.i18n && typeof window.i18n.t === 'function') ? window.i18n.t('notifications.operationFailedRetry') : 'Operation failed', 'error');
    });
});

// 导出主应用类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpriteCutter;
}
