/**
 * 主应用类 - 精灵图切割工具
 */
class SpriteCutter {
    constructor() {
        this.imageProcessor = new ImageProcessor();
        this.historyManager = new HistoryManager();
        this.currentImage = null;
        this.isProcessing = false;
        
        this.init();
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
        
        Utils.showNotification('精灵图切割工具已就绪', 'success', 2000);
    }

    /**
     * 设置元素引用
     */
    setupElements() {
        this.elements = {
            fileInput: document.getElementById('fileInput'),
            fileNameDisplay: document.getElementById('fileNameDisplay'),
            dropArea: document.getElementById('dropArea'),
            previewBtn: document.getElementById('previewBtn'),
            splitBtn: document.getElementById('splitBtn'),
            previewImg: document.getElementById('previewImg'),
            previewPlaceholder: document.getElementById('previewPlaceholder'),
            statusMessage: document.getElementById('statusMessage'),
            
            // 设置元素
            rows: document.getElementById('rows'),
            cols: document.getElementById('cols'),
            startNum: document.getElementById('startNum'),
            fontSize: document.getElementById('fontSize'),
            addNumber: document.getElementById('addNumber'),
            sortDirectionInputs: document.querySelectorAll('input[name="sortDirection"]')
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

        // 设置变化监听（实时预览）
        const settingsElements = [
            this.elements.rows, this.elements.cols, this.elements.startNum,
            this.elements.fontSize, this.elements.addNumber, ...this.elements.sortDirectionInputs
        ];

        settingsElements.forEach(element => {
            const eventType = element.type === 'checkbox' || element.type === 'radio' ? 'change' : 'input';
            element.addEventListener(eventType, Utils.debounce(() => {
                if (this.currentImage && this.elements.addNumber.checked) {
                    this.generatePreview();
                }
                this.saveSettings();
            }, 500));
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
                `您的浏览器不支持以下功能: ${unsupported.join(', ')}`,
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
            Utils.showNotification('请选择有效的图片文件（PNG、JPEG、GIF、WebP）', 'error');
            this.resetFileDisplay();
            return;
        }

        try {
            this.updateStatus('正在加载图片...');
            this.elements.fileNameDisplay.textContent = `${file.name} (${Utils.formatFileSize(file.size)})`;
            
            this.currentImage = await Utils.loadImage(file);
            
            // 显示图片信息
            const info = this.imageProcessor.getImageInfo(this.currentImage);
            Utils.showNotification(
                `图片已加载: ${info.width}x${info.height}`,
                'success'
            );

            // 自动生成预览
            await this.generatePreview();
            
        } catch (error) {
            console.error('图片加载失败:', error);
            Utils.showNotification('图片加载失败，请重试', 'error');
            this.resetFileDisplay();
        }
    }

    /**
     * 重置文件显示
     */
    resetFileDisplay() {
        this.currentImage = null;
        this.elements.fileNameDisplay.textContent = '或将文件拖拽到此处';
        this.elements.previewImg.style.display = 'none';
        this.elements.previewPlaceholder.style.display = 'block';
        this.updateStatus('请选择图片文件');
    }

    /**
     * 生成预览
     */
    async generatePreview() {
        if (!this.currentImage) {
            Utils.showNotification('请先选择图片文件', 'warning');
            return;
        }

        if (this.isProcessing) return;

        try {
            this.isProcessing = true;
            this.updateStatus('正在生成预览...');
            
            const settings = this.getSettings();
            const previewDataUrl = this.imageProcessor.generatePreview(this.currentImage, settings);
            
            this.elements.previewImg.src = previewDataUrl;
            this.elements.previewImg.style.display = 'block';
            this.elements.previewPlaceholder.style.display = 'none';
            
            this.updateStatus('预览已生成');
            
        } catch (error) {
            console.error('预览生成失败:', error);
            Utils.showNotification('预览生成失败', 'error');
            this.updateStatus('预览生成失败');
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * 切割图片
     */
    async splitImage() {
        if (!this.currentImage) {
            Utils.showNotification('请先选择图片文件', 'warning');
            return;
        }

        if (this.isProcessing) {
            Utils.showNotification('正在处理中，请稍候...', 'warning');
            return;
        }

        try {
            this.isProcessing = true;
            this.elements.splitBtn.disabled = true;
            this.updateStatus('正在切割图片，请稍候...');

            const settings = this.getSettings();
            const zipBlob = await this.imageProcessor.splitImage(this.currentImage, settings);
            
            // 生成文件名
            const timestamp = Utils.formatDateTime().replace(/[:\s]/g, '_');
            const filename = `精灵图切割_${timestamp}.zip`;
            
            // 下载文件
            Utils.downloadFile(zipBlob, filename);
            
            // 保存到历史
            await this.historyManager.save(filename, zipBlob, settings);
            
            this.updateStatus('切割完成！');
            Utils.showNotification('切割完成，文件已下载', 'success');
            
        } catch (error) {
            console.error('图片切割失败:', error);
            Utils.showNotification('图片切割失败，请重试', 'error');
            this.updateStatus('切割失败');
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
            this.elements.addNumber.checked = settings.addNumber !== undefined ? settings.addNumber : CONFIG.DEFAULTS.ADD_NUMBER;
            
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
        alert('JSZip库未加载，请检查网络连接或CDN可用性');
        return;
    }

    // 初始化应用
    window.spriteCutter = new SpriteCutter();
    
    // 全局错误处理
    window.addEventListener('error', (e) => {
        console.error('应用错误:', e.error);
        Utils.showNotification('应用发生错误，请刷新页面重试', 'error');
    });
    
    // 未处理的Promise错误
    window.addEventListener('unhandledrejection', (e) => {
        console.error('未处理的Promise错误:', e.reason);
        Utils.showNotification('操作失败，请重试', 'error');
    });
});

// 导出主应用类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpriteCutter;
}
