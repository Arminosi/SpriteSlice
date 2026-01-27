/**
 * 历史管理类 - 负责切割历史的存储和管理
 */
class HistoryManager {
    constructor() {
        this.storageKey = CONFIG.STORAGE_KEYS.HISTORY;
        this.maxCount = CONFIG.LIMITS.MAX_HISTORY_COUNT;
        this.historyPane = null;
        this.historyList = null;
        this.init();
    }

    /**
     * 初始化历史管理器
     */
    init() {
        this.historyPane = document.getElementById('historyPane');
        this.historyList = document.getElementById('historyList');
        this.setupEventListeners();
        this.setupDragFunctionality();
        
        // 监听语言切换事件
        window.addEventListener('languageChanged', () => {
            this.updateLanguage();
        });
    }

    /**
     * 更新语言显示
     */
    updateLanguage() {
        // 重新渲染历史列表以更新按钮文本
        this.render();
        
        // 更新已打开的预览模态框
        const existingModal = document.querySelector('.preview-modal');
        if (existingModal) {
            // 更新标题
            const title = existingModal.querySelector('h3');
            if (title) {
                title.textContent = i18n.t('tilePreview.title');
            }
            
            // 更新配置信息
            const infoSpan = existingModal.querySelector('.preview-info');
            if (infoSpan && infoSpan.dataset.rows && infoSpan.dataset.cols && infoSpan.dataset.total) {
                const rows = infoSpan.dataset.rows;
                const cols = infoSpan.dataset.cols;
                const total = infoSpan.dataset.total;
                infoSpan.textContent = `${i18n.t('previewConfig.config')} ${rows}${i18n.t('previewConfig.rows')} × ${cols}${i18n.t('previewConfig.cols')} (${i18n.t('previewConfig.total')}${total}${i18n.t('previewConfig.tiles')})`;
            }
        }
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 历史按钮
        document.getElementById('toggleHistoryBtn')?.addEventListener('click', () => {
            this.show();
        });

        // 关闭按钮
        document.getElementById('closeHistoryPane')?.addEventListener('click', () => {
            this.hide();
        });

        // 清空按钮
        document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
            this.clearAll();
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.hide();
            }
        });
    }

    /**
     * 保存切割历史
     * @param {string} name 文件名
     * @param {Blob} blob 文件数据
     * @param {Object} settings 切割参数
     */
    async save(name, blob, settings = {}) {
        try {
            const dataUrl = await this._blobToDataUrl(blob);
            const historyItem = {
                id: Utils.generateId(),
                name,
                data: dataUrl,
                time: Utils.formatDateTime(),
                settings,
                size: blob.size
            };

            let history = this.getAll();
            history.unshift(historyItem);

            // 限制历史记录数量
            if (history.length > this.maxCount) {
                history = history.slice(0, this.maxCount);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(history));
            this.render();
            
            Utils.showNotification(i18n.t('notifications.historySaved'), 'success');
        } catch (error) {
            console.error('保存历史记录失败:', error);
            Utils.showNotification(i18n.t('notifications.historySaveFailed'), 'error');
        }
    }

    /**
     * 获取所有历史记录
     * @returns {Array} 历史记录数组
     */
    getAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('读取历史记录失败:', error);
            return [];
        }
    }

    /**
     * 删除单个历史记录
     * @param {string} id 记录ID
     */
    delete(id) {
        try {
            const history = this.getAll().filter(item => item.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(history));
            this.render();
            Utils.showNotification(i18n.t('history.deleted'), 'success');
        } catch (error) {
            console.error('删除历史记录失败:', error);
            Utils.showNotification(i18n.t('history.deleteFailed'), 'error');
        }
    }

    /**
     * 清空所有历史记录
     */
    clearAll() {
        if (confirm(i18n.t('history.clearConfirm'))) {
            try {
                localStorage.removeItem(this.storageKey);
                this.render();
                Utils.showNotification(i18n.t('history.cleared'), 'success');
            } catch (error) {
                console.error('清空历史记录失败:', error);
                Utils.showNotification(i18n.t('history.clearFailed'), 'error');
            }
        }
    }

    /**
     * 渲染历史记录列表
     */
    render() {
        if (!this.historyList) return;

        const history = this.getAll();
        this.historyList.innerHTML = '';

        if (history.length === 0) {
            this.historyList.innerHTML = `<li style="color:#a0aec0;text-align:center;padding:20px;">${i18n.t('history.empty')}</li>`;
            return;
        }

        history.forEach(item => {
            const li = this._createHistoryItem(item);
            this.historyList.appendChild(li);
        });
    }

    /**
     * 创建历史记录项
     * @private
     */
    _createHistoryItem(item) {
        const li = Utils.createElement('li', {
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '12px',
                background: '#f7fafc',
                borderRadius: '8px',
                marginBottom: '8px',
                transition: 'all 0.3s ease'
            }
        });

        // 文件信息
        const info = Utils.createElement('div', {
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }
        });

        const nameSpan = Utils.createElement('span', {
            text: item.name,
            style: {
                fontWeight: 'bold',
                color: '#2d3748',
                fontSize: '0.9em'
            }
        });

        const sizeSpan = Utils.createElement('span', {
            text: Utils.formatFileSize(item.size),
            style: {
                color: '#718096',
                fontSize: '0.8em'
            }
        });

        info.appendChild(nameSpan);
        info.appendChild(sizeSpan);

        // 时间
        const timeSpan = Utils.createElement('div', {
            text: item.time,
            style: {
                color: '#a0aec0',
                fontSize: '0.8em'
            }
        });

        // 按钮组
        const buttonGroup = Utils.createElement('div', {
            style: {
                display: 'flex',
                gap: '8px',
                marginTop: '4px'
            }
        });

        // 下载按钮
        const downloadBtn = Utils.createElement('button', {
            text: i18n.t('history.download'),
            className: 'btn secondary',
            style: {
                padding: '4px 12px',
                fontSize: '0.8em'
            },
            events: {
                click: () => this.download(item)
            }
        });

        // 预览按钮
        const previewBtn = Utils.createElement('button', {
            text: i18n.t('history.preview'),
            className: 'btn',
            style: {
                padding: '4px 12px',
                fontSize: '0.8em',
                backgroundColor: '#f39c12',
                color: 'white'
            },
            events: {
                click: () => this.preview(item)
            }
        });

        // 删除按钮
        const deleteBtn = Utils.createElement('button', {
            text: i18n.t('history.delete'),
            className: 'btn',
            style: {
                padding: '4px 12px',
                fontSize: '0.8em',
                backgroundColor: '#e53e3e',
                color: 'white'
            },
            events: {
                click: () => this.delete(item.id)
            }
        });

        buttonGroup.appendChild(downloadBtn);
        buttonGroup.appendChild(previewBtn);
        buttonGroup.appendChild(deleteBtn);

        li.appendChild(info);
        li.appendChild(timeSpan);
        li.appendChild(buttonGroup);

        return li;
    }

    /**
     * 下载历史记录
     * @param {Object} item 历史记录项
     */
    download(item) {
        try {
            Utils.downloadFile(item.data, item.name);
            Utils.showNotification(i18n.t('history.downloadStart'), 'success');
        } catch (error) {
            console.error('下载失败:', error);
            Utils.showNotification(i18n.t('history.downloadFailed'), 'error');
        }
    }

    /**
     * 预览历史记录
     * @param {Object} item 历史记录项
     */
    async preview(item) {
        try {
            if (typeof JSZip === 'undefined') {
                Utils.showNotification(i18n.t('notifications.missingJsZip'), 'error');
                return;
            }

            const blob = await fetch(item.data).then(res => res.blob());
            const zip = await JSZip.loadAsync(blob);
            
            const files = Object.keys(zip.files)
                .filter(f => f.startsWith('tiles/') && f.endsWith('.png'))
                .sort();

            if (files.length === 0) {
                Utils.showNotification(i18n.t('history.zipNoImages'), 'warning');
                return;
            }

            const base64Array = await Promise.all(
                files.map(f => zip.files[f].async('base64'))
            );

            // 传递原始设置参数给预览模态框
            this._showPreviewModal(base64Array, files, item.settings || {});
        } catch (error) {
            console.error('预览失败:', error);
            Utils.showNotification(i18n.t('history.previewFailed'), 'error');
        }
    }

    /**
     * 显示预览模态框
     * @private
     */
    _showPreviewModal(base64Array, files, settings = {}) {
        let modal = document.getElementById('previewModal');
        
        if (!modal) {
            modal = this._createPreviewModal();
            document.body.appendChild(modal);
        }

        const grid = modal.querySelector('#previewGrid');
        grid.innerHTML = '';

        // 使用原始切割配置的行列数
        const rows = settings.rows || CONFIG.DEFAULTS.ROWS;
        const cols = settings.cols || CONFIG.DEFAULTS.COLS;
        
        // 计算预览网格的列数，优先使用原始列数
        const previewCols = Math.min(cols, 12); // 最多12列避免太挤
        grid.style.gridTemplateColumns = `repeat(${previewCols}, minmax(60px, 1fr))`;
        
        // 添加标题显示切割信息
        const header = modal.querySelector('#previewHeader');
        if (header) {
            const infoText = `${i18n.t('previewConfig.config')} ${rows}${i18n.t('previewConfig.rows')} × ${cols}${i18n.t('previewConfig.cols')} (${i18n.t('previewConfig.total')}${base64Array.length}${i18n.t('previewConfig.tiles')})`;
            let infoSpan = header.querySelector('.preview-info');
            if (!infoSpan) {
                infoSpan = Utils.createElement('span', {
                    className: 'preview-info',
                    style: {
                        color: '#718096',
                        fontSize: '0.9em',
                        marginLeft: '10px'
                    }
                });
                header.appendChild(infoSpan);
            }
            
            // 添加数据属性以便语言切换时更新
            infoSpan.dataset.rows = rows;
            infoSpan.dataset.cols = cols;
            infoSpan.dataset.total = base64Array.length;
            infoSpan.textContent = infoText;
        }

        base64Array.forEach((base64, index) => {
            const item = this._createPreviewItem(base64, files[index], index, { rows, cols });
            grid.appendChild(item);
        });

        modal.style.display = 'flex';
    }

    /**
     * 创建预览模态框
     * @private
     */
    _createPreviewModal() {
        const modal = Utils.createElement('div', {
            id: 'previewModal',
            style: {
                position: 'fixed',
                left: '0',
                top: '0',
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '9999',
                backdropFilter: 'blur(4px)'
            },
            events: {
                click: (e) => {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                    }
                }
            }
        });

        const content = Utils.createElement('div', {
            style: {
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative'
            }
        });

        const closeBtn = Utils.createElement('button', {
            text: '×',
            style: {
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '30px',
                height: '30px',
                border: 'none',
                background: '#e53e3e',
                color: 'white',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '18px',
                zIndex: '10001'
            },
            events: {
                click: () => modal.style.display = 'none'
            }
        });

        // 添加头部信息区域
        const header = Utils.createElement('div', {
            id: 'previewHeader',
            style: {
                display: 'flex',
                alignItems: 'center',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '1px solid #e2e8f0'
            }
        });

        const title = Utils.createElement('h3', {
            text: i18n.t('tilePreview.title'),
            style: {
                margin: '0',
                color: '#2d3748',
                fontSize: '1.2em'
            }
        });

        header.appendChild(title);

        const grid = Utils.createElement('div', {
            id: 'previewGrid',
            style: {
                display: 'grid',
                gap: '12px'
            }
        });

        content.appendChild(closeBtn);
        content.appendChild(header);
        content.appendChild(grid);
        modal.appendChild(content);

        return modal;
    }

    /**
     * 创建预览项
     * @private
     */
    _createPreviewItem(base64, filename, index, gridInfo = {}) {
        const container = Utils.createElement('div', {
            style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px',
                background: '#f7fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                transition: 'transform 0.2s ease',
                cursor: 'pointer'
            },
            events: {
                mouseenter: (e) => {
                    e.target.style.transform = 'scale(1.05)';
                },
                mouseleave: (e) => {
                    e.target.style.transform = 'scale(1)';
                }
            }
        });

        const img = Utils.createElement('img', {
            attributes: {
                src: `data:image/png;base64,${base64}`,
                alt: `预览图 ${index + 1}`
            },
            style: {
                maxWidth: '80px',
                maxHeight: '80px',
                borderRadius: '4px',
                marginBottom: '4px'
            }
        });

        // 计算行列位置
        const { rows = 0, cols = 0 } = gridInfo;
        const row = cols > 0 ? Math.floor(index / cols) + 1 : 0;
        const col = cols > 0 ? (index % cols) + 1 : 0;
        
        // 创建标签容器
        const labelContainer = Utils.createElement('div', {
            style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px'
            }
        });

        // 主序号
        const mainLabel = Utils.createElement('div', {
            text: `${index + 1}`,
            style: {
                fontSize: '14px',
                color: '#e53e3e',
                fontWeight: 'bold',
                marginBottom: '2px'
            }
        });

        // 位置信息
        if (rows > 0 && cols > 0) {
            const positionLabel = Utils.createElement('div', {
                text: `${row},${col}`,
                style: {
                    fontSize: '10px',
                    color: '#718096',
                    backgroundColor: '#e2e8f0',
                    padding: '1px 4px',
                    borderRadius: '3px'
                }
            });
            labelContainer.appendChild(mainLabel);
            labelContainer.appendChild(positionLabel);
        } else {
            labelContainer.appendChild(mainLabel);
        }

        container.appendChild(img);
        container.appendChild(labelContainer);

        return container;
    }

    /**
     * 设置拖拽功能
     */
    setupDragFunctionality() {
        if (!this.historyPane) return;

        const header = document.getElementById('historyPaneHeader');
        if (!header) return;

        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let paneStartX = 0;
        let paneStartY = 0;

        // 防止滚动的函数
        const preventScroll = (e) => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        // 防止键盘滚动的函数
        const preventKeyScroll = (e) => {
            if (isDragging) {
                const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' '];
                if (scrollKeys.includes(e.key)) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }
        };

        // 获取窗格当前位置
        const getPosition = () => {
            const style = window.getComputedStyle(this.historyPane);
            let x = parseInt(style.left) || 0;
            let y = parseInt(style.top) || 0;
            
            // 如果使用的是right和bottom定位，需要转换为left和top
            if (style.right !== 'auto' && style.left === 'auto') {
                x = window.innerWidth - parseInt(style.right) - this.historyPane.offsetWidth;
            }
            if (style.bottom !== 'auto' && style.top === 'auto') {
                y = window.innerHeight - parseInt(style.bottom) - this.historyPane.offsetHeight;
            }
            
            return { x, y };
        };

        // 设置窗格位置
        const setPosition = (x, y) => {
            // 确保窗格不会移出视口
            const paneWidth = this.historyPane.offsetWidth;
            const paneHeight = this.historyPane.offsetHeight;
            const maxX = window.innerWidth - paneWidth;
            const maxY = window.innerHeight - paneHeight;
            
            x = Math.max(0, Math.min(x, maxX));
            y = Math.max(0, Math.min(y, maxY));
            
            this.historyPane.style.left = x + 'px';
            this.historyPane.style.top = y + 'px';
            this.historyPane.style.right = 'auto';
            this.historyPane.style.bottom = 'auto';
        };

        // 鼠标按下事件
        const dragStart = (e) => {
            // 如果点击的是按钮，不开始拖拽
            if (e.target.closest('button')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            
            isDragging = true;
            this.historyPane.classList.add('dragging');
            
            // 记录鼠标按下时的位置
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            
            // 记录窗格当前位置
            const pos = getPosition();
            paneStartX = pos.x;
            paneStartY = pos.y;

            // 添加全局事件监听器
            document.addEventListener('mousemove', drag, { passive: false });
            document.addEventListener('mouseup', dragEnd);
            
            // 防止文本选择
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            document.body.style.msUserSelect = 'none';
            
            // 只阻止滚动事件，不改变CSS
            document.addEventListener('wheel', preventScroll, { passive: false });
            document.addEventListener('touchmove', preventScroll, { passive: false });
            document.addEventListener('keydown', preventKeyScroll, { passive: false });
        };

        // 鼠标移动事件
        const drag = (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            // 计算鼠标移动的距离
            const deltaX = e.clientX - dragStartX;
            const deltaY = e.clientY - dragStartY;
            
            // 计算新位置
            const newX = paneStartX + deltaX;
            const newY = paneStartY + deltaY;
            
            setPosition(newX, newY);
        };

        // 鼠标释放事件
        const dragEnd = (e) => {
            if (!isDragging) return;
            
            e && e.preventDefault && e.preventDefault();
            e && e.stopPropagation && e.stopPropagation();
            
            isDragging = false;
            this.historyPane.classList.remove('dragging');
            
            // 移除全局事件监听器
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('wheel', preventScroll);
            document.removeEventListener('touchmove', preventScroll);
            document.removeEventListener('keydown', preventKeyScroll);
            
            // 恢复页面状态
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
            document.body.style.msUserSelect = '';
            
            // 保存位置到本地存储
            this.savePosition();
        };

        // 确保在页面失去焦点时也能正确恢复状态
        const handleBlur = () => {
            if (isDragging) {
                document.body.style.userSelect = '';
                document.body.style.webkitUserSelect = '';
                document.body.style.msUserSelect = '';
                document.removeEventListener('wheel', preventScroll);
                document.removeEventListener('touchmove', preventScroll);
                document.removeEventListener('keydown', preventKeyScroll);
                isDragging = false;
                this.historyPane.classList.remove('dragging');
            }
        };

        // 确保在ESC键按下时也能正确恢复状态
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isDragging) {
                document.body.style.userSelect = '';
                document.body.style.webkitUserSelect = '';
                document.body.style.msUserSelect = '';
                document.removeEventListener('wheel', preventScroll);
                document.removeEventListener('touchmove', preventScroll);
                document.removeEventListener('keydown', preventKeyScroll);
                isDragging = false;
                this.historyPane.classList.remove('dragging');
            }
        };

        // 触摸事件支持
        const touchStart = (e) => {
            if (e.target.closest('button')) return;
            
            const touch = e.touches[0];
            dragStart({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => e.preventDefault(),
                stopPropagation: () => e.stopPropagation(),
                target: e.target
            });
        };

        const touchMove = (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            const touch = e.touches[0];
            drag({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => e.preventDefault(),
                stopPropagation: () => e.stopPropagation()
            });
        };

        const touchEnd = (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            dragEnd({
                preventDefault: () => e.preventDefault(),
                stopPropagation: () => e.stopPropagation()
            });
        };

        // 绑定事件监听器
        header.addEventListener('mousedown', dragStart);
        header.addEventListener('touchstart', touchStart, { passive: false });
        document.addEventListener('touchmove', touchMove, { passive: false });
        document.addEventListener('touchend', touchEnd, { passive: false });
        
        // 添加额外的保护事件监听器
        window.addEventListener('blur', handleBlur);
        document.addEventListener('keydown', handleEscape);
        
        // 存储清理函数，以便在需要时移除事件监听器
        this.dragCleanup = () => {
            header.removeEventListener('mousedown', dragStart);
            header.removeEventListener('touchstart', touchStart);
            document.removeEventListener('touchmove', touchMove);
            document.removeEventListener('touchend', touchEnd);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('keydown', handleEscape);
        };
    }

    /**
     * 保存窗格位置
     */
    savePosition() {
        if (!this.historyPane) return;
        
        const rect = this.historyPane.getBoundingClientRect();
        const position = {
            left: rect.left,
            top: rect.top
        };
        
        localStorage.setItem('historyPanePosition', JSON.stringify(position));
    }

    /**
     * 恢复窗格位置
     */
    restorePosition() {
        if (!this.historyPane) return;
        
        try {
            const savedPosition = localStorage.getItem('historyPanePosition');
            if (savedPosition) {
                const position = JSON.parse(savedPosition);
                
                // 确保位置在视口内
                const maxX = window.innerWidth - this.historyPane.offsetWidth;
                const maxY = window.innerHeight - this.historyPane.offsetHeight;
                
                const x = Math.max(0, Math.min(position.left, maxX));
                const y = Math.max(0, Math.min(position.top, maxY));
                
                this.historyPane.style.left = x + 'px';
                this.historyPane.style.top = y + 'px';
                this.historyPane.style.right = 'auto';
                this.historyPane.style.bottom = 'auto';
            }
        } catch (error) {
            console.warn('恢复窗格位置失败:', error);
        }
    }

    /**
     * 显示历史窗格
     */
    show() {
        if (this.historyPane) {
            this.historyPane.style.display = 'block';
            this.render();
            // 显示后恢复位置
            setTimeout(() => {
                this.restorePosition();
            }, 0);
        }
    }

    /**
     * 隐藏历史窗格
     */
    hide() {
        if (this.historyPane) {
            this.historyPane.style.display = 'none';
        }
    }

    /**
     * 检查历史窗格是否可见
     */
    isVisible() {
        return this.historyPane && this.historyPane.style.display !== 'none';
    }

    /**
     * Blob转DataURL
     * @private
     */
    _blobToDataUrl(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}

// 导出历史管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HistoryManager;
}
