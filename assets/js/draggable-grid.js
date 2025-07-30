/**
 * 可拖拽网格类 - 处理图块的拖拽排序功能
 */
class DraggableGrid {
    constructor() {
        this.container = null;
        this.tiles = [];
        this.tileOrder = [];
        this.draggedTile = null;
        this.dropTarget = null;
        this.isDragging = false;
        this.originalImage = null;
        this.options = {};
    }

    /**
     * 初始化可拖拽网格
     * @param {HTMLElement} container 容器元素
     * @param {HTMLImageElement} image 原始图片
     * @param {Object} options 选项
     */
    init(container, image, options) {
        this.container = container;
        this.originalImage = image;
        this.options = options;
        this.createGrid();
        this.setupEventListeners();
        this.setupResizeListener();
        this.setupNumberToggleListener();
    }

    /**
     * 设置窗口大小变化监听器
     */
    setupResizeListener() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        const handleResize = () => {
            if (this.container && this.originalImage && this.options) {
                this.adjustGridSize(this.options.rows || CONFIG.DEFAULTS.ROWS, this.options.cols || CONFIG.DEFAULTS.COLS);
            }
        };

        // 防抖处理resize事件
        const debouncedResize = () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(handleResize, 300);
        };

        window.addEventListener('resize', debouncedResize);
        this.resizeListener = debouncedResize;
    }

    /**
     * 设置序号显示开关监听器
     */
    setupNumberToggleListener() {
        const toggleCheckbox = document.getElementById('showDragGridNumber');
        if (toggleCheckbox) {
            toggleCheckbox.addEventListener('change', () => {
                this.toggleNumbers();
            });
        }
    }

    /**
     * 切换序号显示
     */
    toggleNumbers() {
        const showNumbers = document.getElementById('showDragGridNumber')?.checked !== false;
        const startNum = this.options.startNum || 0;
        
        this.tiles.forEach((tile, index) => {
            const numberSpan = tile.querySelector('.grid-tile-number');
            const originalSpan = tile.querySelector('.grid-tile-original-number');
            
            if (showNumbers) {
                // 显示序号
                if (!numberSpan) {
                    // 计算当前正确的序号（基于当前位置）
                    const currentNumber = startNum + index + 1;
                    const originalIndex = tile.dataset.originalIndex || '0';
                    
                    const newNumberSpan = document.createElement('span');
                    newNumberSpan.className = 'grid-tile-number';
                    newNumberSpan.textContent = currentNumber;
                    tile.appendChild(newNumberSpan);

                    const newOriginalSpan = document.createElement('span');
                    newOriginalSpan.className = 'grid-tile-original-number';
                    newOriginalSpan.textContent = `原:${parseInt(originalIndex) + 1}`;
                    tile.appendChild(newOriginalSpan);
                    
                    // 更新数据属性
                    tile.dataset.currentNumber = currentNumber;
                }
            } else {
                // 隐藏序号
                if (numberSpan) numberSpan.remove();
                if (originalSpan) originalSpan.remove();
            }
        });
    }

    /**
     * 创建网格
     */
    createGrid() {
        const {
            rows = CONFIG.DEFAULTS.ROWS,
            cols = CONFIG.DEFAULTS.COLS,
            startNum = CONFIG.DEFAULTS.START_NUM,
            sortDirection = CONFIG.DEFAULTS.SORT_DIRECTION
        } = this.options;

        // 清空容器
        this.container.innerHTML = '';
        
        // 设置基本的Grid显示，具体布局由adjustGridSize处理
        this.container.style.display = 'grid';

        // 计算合适的容器高度，确保图块为正方形
        this.adjustGridSize(rows, cols);

        // 计算图块尺寸
        const tileWidth = this.originalImage.width / cols;
        const tileHeight = this.originalImage.height / rows;

        this.tiles = [];
        this.tileOrder = [];

        // 创建临时canvas来提取图块
        const canvas = document.createElement('canvas');
        canvas.width = tileWidth;
        canvas.height = tileHeight;
        const ctx = canvas.getContext('2d');

        let tileIndex = 0;
        for (let r = 0; r < rows; r++) {
            const row = sortDirection === CONFIG.SORT_DIRECTIONS.REVERSE ? rows - 1 - r : r;
            for (let c = 0; c < cols; c++) {
                // 计算实际的列索引（考虑排序方向）
                const actualCol = this._getColumnIndex(row, c, cols, sortDirection);
                
                // 提取图块
                ctx.clearRect(0, 0, tileWidth, tileHeight);
                ctx.drawImage(
                    this.originalImage,
                    actualCol * tileWidth, row * tileHeight, tileWidth, tileHeight,
                    0, 0, tileWidth, tileHeight
                );

                // 创建图块元素
                const tile = this.createTile(canvas.toDataURL(), tileIndex, startNum + tileIndex + 1);
                tile.dataset.originalIndex = tileIndex;
                tile.dataset.currentIndex = tileIndex;
                tile.dataset.row = row;
                tile.dataset.col = actualCol;

                this.container.appendChild(tile);
                this.tiles.push(tile);
                this.tileOrder.push(tileIndex);
                tileIndex++;
            }
        }
    }

    /**
     * 调整网格大小以适应容器
     */
    adjustGridSize(rows, cols) {
        const previewContainer = this.container.parentElement;
        const containerWidth = previewContainer.clientWidth;
        const containerHeight = previewContainer.clientHeight;
        
        // 计算网格间隙和拖拽网格的padding (CSS中设置为0px)
        const gap = 8;
        const gridPadding = 0; // 0px * 2 (左右或上下)
        
        // 计算每个图块的最大可用尺寸 (减去网格padding)
        const maxTileWidth = (containerWidth - gridPadding - (cols - 1) * gap) / cols;
        const maxTileHeight = (containerHeight - gridPadding - (rows - 1) * gap) / rows;
        
        // 选择较小的尺寸以确保图块为正方形且完全适应容器
        const tileSize = Math.max(20, Math.min(maxTileWidth, maxTileHeight));
        
        // 设置CSS Grid属性
        this.container.style.gridTemplateColumns = `repeat(${cols}, ${tileSize}px)`;
        this.container.style.gridTemplateRows = `repeat(${rows}, ${tileSize}px)`;
        this.container.style.gap = `${gap}px`;
        
        // 计算实际网格尺寸
        const gridWidth = cols * tileSize + (cols - 1) * gap;
        const gridHeight = rows * tileSize + (rows - 1) * gap;
        
        // 设置容器尺寸，让CSS处理定位
        this.container.style.width = `${gridWidth}px`;
        this.container.style.height = `${gridHeight}px`;
        
        // 只清除可能冲突的margin，保留CSS的定位样式
        this.container.style.removeProperty('margin');
        
        console.log(`网格调整: ${rows}行 ${cols}列, 图块尺寸: ${Math.round(tileSize)}px`);
        console.log(`网格尺寸: ${gridWidth}x${gridHeight}px, 容器尺寸: ${containerWidth}x${containerHeight}px`);
    }

    /**
     * 创建图块元素
     * @param {string} imageData 图块的base64数据
     * @param {number} originalIndex 原始索引
     * @param {number} currentNumber 当前显示的数字
     * @returns {HTMLElement} 图块元素
     */
    createTile(imageData, originalIndex, currentNumber) {
        const tile = document.createElement('div');
        tile.className = 'grid-tile';
        tile.draggable = true;
        tile.style.backgroundImage = `url(${imageData})`;
        tile.title = '双击预览图块，右键删除'; // 添加工具提示
        
        // 保存数据属性，供切换序号时使用
        tile.dataset.originalIndex = originalIndex;
        tile.dataset.currentNumber = currentNumber;
        tile.dataset.deleted = 'false'; // 标记是否已删除
        
        // 移除固定尺寸设置，让CSS控制自适应
        // 图块尺寸由CSS Grid和容器大小自动计算
        
        // 检查是否显示序号
        const showNumbers = document.getElementById('showDragGridNumber')?.checked !== false;
        
        if (showNumbers) {
            // 添加当前序号
            const numberSpan = document.createElement('span');
            numberSpan.className = 'grid-tile-number';
            numberSpan.textContent = currentNumber;
            tile.appendChild(numberSpan);

            // 添加原始序号（小字显示）
            const originalSpan = document.createElement('span');
            originalSpan.className = 'grid-tile-original-number';
            originalSpan.textContent = `原:${originalIndex + 1}`;
            tile.appendChild(originalSpan);
        }

        // 添加删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'grid-tile-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = '删除此图块';
        deleteBtn.setAttribute('aria-label', '删除图块');
        tile.appendChild(deleteBtn);

        return tile;
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 为容器添加拖拽事件监听器，处理在空隙中的拖拽
        this.container.addEventListener('dragover', (e) => this.onDragOver(e));
        this.container.addEventListener('drop', (e) => this.onDrop(e));
        this.container.addEventListener('dragenter', (e) => this.onDragEnter(e));
        this.container.addEventListener('dragleave', (e) => this.onDragLeave(e));
        
        // 阻止容器右键菜单，避免与图块右键删除功能冲突
        this.container.addEventListener('contextmenu', (e) => {
            // 如果右键点击的是图块，则允许图块处理右键事件
            if (e.target.classList.contains('grid-tile')) {
                return;
            }
            // 其他情况阻止右键菜单
            e.preventDefault();
        });
        
        this.tiles.forEach(tile => {
            // 桌面端拖拽事件
            tile.addEventListener('dragstart', (e) => this.onDragStart(e));
            tile.addEventListener('dragend', (e) => this.onDragEnd(e));
            tile.addEventListener('dragover', (e) => this.onDragOver(e));
            tile.addEventListener('drop', (e) => this.onDrop(e));
            tile.addEventListener('dragenter', (e) => this.onDragEnter(e));
            tile.addEventListener('dragleave', (e) => this.onDragLeave(e));

            // 双击预览事件
            tile.addEventListener('dblclick', (e) => this.onTileDoubleClick(e));

            // 右键删除事件
            tile.addEventListener('contextmenu', (e) => this.onTileRightClick(e));

            // 删除按钮点击事件
            const deleteBtn = tile.querySelector('.grid-tile-delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => this.onDeleteClick(e));
            }

            // 触摸设备支持
            tile.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
            tile.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
            tile.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
        });
    }

    /**
     * 拖拽开始事件
     */
    onDragStart(e) {
        this.draggedTile = e.target;
        this.isDragging = true;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        
        // 延迟设置不透明度，避免拖拽时看到半透明的原元素
        setTimeout(() => {
            if (this.draggedTile) {
                this.draggedTile.style.opacity = '0.5';
            }
        }, 0);
    }

    /**
     * 拖拽结束事件
     */
    onDragEnd(e) {
        this.isDragging = false;
        e.target.classList.remove('dragging');
        e.target.style.opacity = '';
        
        // 清除所有指示器样式
        this.clearInsertIndicator();
        
        this.draggedTile = null;
        this.dropTarget = null;
    }

    /**
     * 拖拽悬停事件
     */
    onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // 无论鼠标在哪里，都尝试找到最近的图块
        const nearestInfo = this.findNearestTile(e.clientX, e.clientY);
        
        if (nearestInfo && nearestInfo.tile && nearestInfo.tile !== this.draggedTile) {
            this.showInsertIndicator(nearestInfo.tile, nearestInfo.position);
        } else {
            this.clearInsertIndicator();
        }
    }

    /**
     * 找到鼠标位置最近的图块
     */
    findNearestTile(mouseX, mouseY) {
        let nearestTile = null;
        let minDistance = Infinity;
        let bestPosition = 'right';
        
        this.tiles.forEach(tile => {
            if (tile === this.draggedTile) return;
            
            const rect = tile.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // 计算鼠标到图块中心的距离
            const distance = Math.sqrt(
                Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestTile = tile;
                
                // 判断应该插入到左边还是右边
                if (mouseX < centerX) {
                    bestPosition = 'left';
                } else {
                    bestPosition = 'right';
                }
            }
        });
        
        return { tile: nearestTile, position: bestPosition };
    }

    /**
     * 显示插入指示器
     */
    showInsertIndicator(targetTile, position = null) {
        // 清除之前的指示器
        this.clearInsertIndicator();
        
        // 如果第一个参数是事件对象（向后兼容）
        if (targetTile && targetTile.clientX !== undefined) {
            const e = targetTile;
            const tile = position || e.target;
            if (!tile || !tile.classList.contains('grid-tile')) {
                return;
            }
            
            const rect = tile.getBoundingClientRect();
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            // 计算鼠标相对于图块的位置
            const relativeX = (mouseX - rect.left) / rect.width;
            const relativeY = (mouseY - rect.top) / rect.height;
            
            let insertPosition = null;
            let indicatorClass = '';
            
            // 判断插入位置
            if (relativeX < 0.3) {
                insertPosition = 'before';
                indicatorClass = 'insert-left';
            } else if (relativeX > 0.7) {
                insertPosition = 'after';
                indicatorClass = 'insert-right';
            } else if (relativeY < 0.3) {
                insertPosition = 'above';
                indicatorClass = 'insert-top';
            } else if (relativeY > 0.7) {
                insertPosition = 'below';
                indicatorClass = 'insert-bottom';
            } else {
                // 中心区域 - 交换位置
                insertPosition = 'swap';
                indicatorClass = 'swap-target';
            }
            
            tile.classList.add(indicatorClass);
            tile.dataset.insertPosition = insertPosition;
            this.dropTarget = tile;
            
            return;
        }
        
        // 新的直接位置参数模式
        const tile = targetTile;
        if (!tile || !tile.classList.contains('grid-tile')) {
            return;
        }
        
        let insertPosition = null;
        let indicatorClass = '';
        
        // 直接使用提供的位置
        if (position === 'left') {
            insertPosition = 'before';
            indicatorClass = 'insert-left';
        } else if (position === 'right') {
            insertPosition = 'after';
            indicatorClass = 'insert-right';
        } else {
            // 默认右侧插入
            insertPosition = 'after';
            indicatorClass = 'insert-right';
        }
        
        tile.classList.add(indicatorClass);
        tile.dataset.insertPosition = insertPosition;
        this.dropTarget = tile;
    }

    /**
     * 清除插入指示器
     */
    clearInsertIndicator() {
        this.tiles.forEach(tile => {
            tile.classList.remove('insert-left', 'insert-right', 'insert-top', 'insert-bottom', 'swap-target', 'drop-target');
            delete tile.dataset.insertPosition;
        });
    }

    /**
     * 拖拽进入事件
     */
    onDragEnter(e) {
        e.preventDefault();
        // 让onDragOver处理指示器显示
    }

    /**
     * 拖拽离开事件
     */
    onDragLeave(e) {
        // 只在完全离开容器时清除指示器
        if (!this.container.contains(e.relatedTarget)) {
            this.clearInsertIndicator();
        }
    }

    /**
     * 放置事件
     */
    onDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        // 如果没有dropTarget，尝试找到最近的图块
        let targetTile = this.dropTarget;
        if (!targetTile) {
            const nearestInfo = this.findNearestTile(e.clientX, e.clientY);
            if (nearestInfo && nearestInfo.tile && nearestInfo.tile !== this.draggedTile) {
                // 直接使用找到的图块和位置
                targetTile = nearestInfo.tile;
                // 设置插入位置数据
                targetTile.dataset.insertPosition = nearestInfo.position === 'left' ? 'before' : 'after';
            }
        }

        if (targetTile && this.draggedTile && this.draggedTile !== targetTile) {
            try {
                const insertPosition = targetTile.dataset.insertPosition;
                
                if (insertPosition === 'swap') {
                    // 交换两个图块的位置
                    this.swapTiles(this.draggedTile, targetTile);
                } else if (insertPosition) {
                    // 插入到指定位置
                    this.insertTile(this.draggedTile, targetTile, insertPosition);
                }
                
                // 更新序号显示
                this.updateTileNumbers();
                
                // 触发变化事件
                this.onOrderChanged();
            } catch (error) {
                console.error('拖拽操作失败:', error);
            }
        }

        // 清理样式和指示器
        this.clearInsertIndicator();
        
        // 清理拖拽状态
        if (this.draggedTile) {
            this.draggedTile.classList.remove('dragging');
            this.draggedTile = null;
        }
        this.dropTarget = null;
        
        // 清理所有可能残留的插入位置数据
        this.tiles.forEach(tile => {
            if (tile.dataset.insertPosition) {
                delete tile.dataset.insertPosition;
            }
        });
    }

    /**
     * 插入图块到指定位置
     */
    insertTile(draggedTile, targetTile, position) {
        if (!draggedTile || !targetTile || !position) {
            console.warn('insertTile: 缺少必要参数');
            return;
        }
        
        const draggedIndex = parseInt(draggedTile.dataset.currentIndex);
        const targetIndex = parseInt(targetTile.dataset.currentIndex);
        
        if (isNaN(draggedIndex) || isNaN(targetIndex)) {
            console.warn('insertTile: 无效的索引值');
            return;
        }
        
        // 计算实际插入位置
        let insertIndex = targetIndex;
        const gridStyle = window.getComputedStyle(this.container);
        const cols = gridStyle.gridTemplateColumns ? gridStyle.gridTemplateColumns.split(' ').length : 1;
        
        switch (position) {
            case 'before':
                insertIndex = targetIndex;
                break;
            case 'after':
                insertIndex = targetIndex + 1;
                break;
            case 'above':
                insertIndex = Math.max(0, targetIndex - cols);
                break;
            case 'below':
                insertIndex = Math.min(this.tiles.length, targetIndex + cols);
                break;
        }
        
        // 如果拖拽的图块在插入位置之前，需要调整插入位置
        if (draggedIndex < insertIndex) {
            insertIndex--;
        }
        
        // 执行插入操作
        this.moveToPosition(draggedIndex, insertIndex);
    }

    /**
     * 将图块移动到指定位置
     */
    moveToPosition(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        
        // 获取要移动的图块数据
        const draggedTile = this.tiles[fromIndex];
        const draggedOrder = this.tileOrder[fromIndex];
        
        // 从原位置移除
        this.tiles.splice(fromIndex, 1);
        this.tileOrder.splice(fromIndex, 1);
        
        // 插入到新位置
        this.tiles.splice(toIndex, 0, draggedTile);
        this.tileOrder.splice(toIndex, 0, draggedOrder);
        
        // 更新所有图块的索引
        this.tiles.forEach((tile, index) => {
            tile.dataset.currentIndex = index;
        });
        
        // 重新排列DOM元素
        this.reorderDOMElements();
    }

    /**
     * 重新排列DOM元素
     */
    reorderDOMElements() {
        // 清空容器
        this.container.innerHTML = '';
        
        // 按新顺序添加图块
        this.tiles.forEach(tile => {
            this.container.appendChild(tile);
        });
    }

    /**
     * 交换两个图块的位置
     */
    swapTiles(tile1, tile2) {
        const tile1Index = parseInt(tile1.dataset.currentIndex);
        const tile2Index = parseInt(tile2.dataset.currentIndex);

        // 交换DOM位置
        const tile1Next = tile1.nextSibling;
        const tile1Parent = tile1.parentNode;
        const tile2Next = tile2.nextSibling;
        const tile2Parent = tile2.parentNode;

        tile1Parent.insertBefore(tile2, tile1Next);
        tile2Parent.insertBefore(tile1, tile2Next);

        // 更新数据
        tile1.dataset.currentIndex = tile2Index;
        tile2.dataset.currentIndex = tile1Index;

        // 更新tiles数组
        const tempTile = this.tiles[tile1Index];
        this.tiles[tile1Index] = this.tiles[tile2Index];
        this.tiles[tile2Index] = tempTile;

        // 更新tileOrder数组
        const tempOrder = this.tileOrder[tile1Index];
        this.tileOrder[tile1Index] = this.tileOrder[tile2Index];
        this.tileOrder[tile2Index] = tempOrder;
    }

    /**
     * 更新图块序号显示
     */
    updateTileNumbers() {
        const startNum = this.options.startNum || 0;
        this.tiles.forEach((tile, index) => {
            const currentNumber = startNum + index + 1;
            
            // 更新数据属性
            tile.dataset.currentNumber = currentNumber;
            
            // 更新显示的序号
            const numberSpan = tile.querySelector('.grid-tile-number');
            if (numberSpan) {
                numberSpan.textContent = currentNumber;
            }
        });
    }

    /**
     * 获取列索引（考虑排序方向）
     */
    _getColumnIndex(row, col, cols, sortDirection) {
        switch (sortDirection) {
            case 'oddLeftEvenRight':
                return (row % 2 === 0) ? col : (cols - 1 - col);
            case 'evenLeftOddRight':
                return (row % 2 === 1) ? col : (cols - 1 - col);
            default:
                return col;
        }
    }

    /**
     * 获取当前的图块顺序
     * @returns {Array} 按当前顺序排列的原始索引数组
     */
    getCurrentOrder() {
        return this.tiles.map(tile => parseInt(tile.dataset.originalIndex));
    }

    /**
     * 重置为默认顺序
     */
    resetOrder() {
        // 先恢复所有已删除的图块
        this.resetDeletions();
        
        // 按原始索引重新排序
        const sortedTiles = [...this.tiles].sort((a, b) => {
            return parseInt(a.dataset.originalIndex) - parseInt(b.dataset.originalIndex);
        });

        // 重新添加到容器中
        this.container.innerHTML = '';
        sortedTiles.forEach((tile, index) => {
            tile.dataset.currentIndex = index;
            this.container.appendChild(tile);
        });

        this.tiles = sortedTiles;
        this.tileOrder = this.tiles.map((_, index) => index);
        this.updateTileNumbers();
        this.onOrderChanged();
    }

    /**
     * 顺序改变时的回调
     */
    onOrderChanged() {
        // 触发自定义事件
        const event = new CustomEvent('tileOrderChanged', {
            detail: {
                order: this.getCurrentOrder(),
                tiles: this.tiles
            }
        });
        this.container.dispatchEvent(event);
    }

    /**
     * 销毁网格
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // 清理resize监听器
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
            this.resizeListener = null;
        }
        
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = null;
        }
        
        this.tiles = [];
        this.tileOrder = [];
        this.draggedTile = null;
        this.dropTarget = null;
        this.isDragging = false;
    }

    /**
     * 触摸开始事件（移动设备支持）
     */
    onTouchStart(e) {
        e.preventDefault();
        this.touchStartTile = e.target.closest('.grid-tile');
        if (this.touchStartTile) {
            this.touchStartTile.classList.add('dragging');
            this.isDragging = true;
        }
    }

    /**
     * 触摸移动事件
     */
    onTouchMove(e) {
        if (!this.isDragging || !this.touchStartTile) return;
        e.preventDefault();

        const touch = e.touches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetTile = elementBelow?.closest('.grid-tile');

        // 清除之前的指示器
        this.clearInsertIndicator();

        if (targetTile && targetTile !== this.touchStartTile) {
            // 创建模拟事件来使用showInsertIndicator
            const mockEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                target: targetTile
            };
            this.showInsertIndicator(mockEvent);
        }
    }

    /**
     * 触摸结束事件
     */
    onTouchEnd(e) {
        e.preventDefault();
        
        if (this.touchStartTile && this.dropTarget) {
            const insertPosition = this.dropTarget.dataset.insertPosition;
            
            if (insertPosition === 'swap') {
                // 交换两个图块的位置
                this.swapTiles(this.touchStartTile, this.dropTarget);
            } else if (insertPosition) {
                // 插入到指定位置
                this.insertTile(this.touchStartTile, this.dropTarget, insertPosition);
            }
            
            this.updateTileNumbers();
            this.onOrderChanged();
        }

        // 清理状态
        if (this.touchStartTile) {
            this.touchStartTile.classList.remove('dragging');
        }
        this.clearInsertIndicator();

        this.touchStartTile = null;
        this.dropTarget = null;
        this.isDragging = false;
    }

    /**
     * 图块双击事件 - 预览图块图像
     */
    onTileDoubleClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const tile = e.currentTarget;
        const backgroundImage = tile.style.backgroundImage;
        
        if (backgroundImage) {
            // 提取图片URL
            const imageUrl = backgroundImage.slice(5, -2); // 移除 'url("' 和 '")'
            
            // 获取图块信息
            const currentNumber = tile.dataset.currentNumber || '未知';
            const originalIndex = tile.dataset.originalIndex || '0';
            const row = parseInt(tile.dataset.row) + 1 || 1;
            const col = parseInt(tile.dataset.col) + 1 || 1;
            
            this.showTilePreview(imageUrl, {
                currentNumber,
                originalIndex: parseInt(originalIndex) + 1,
                row,
                col
            });
        }
    }

    /**
     * 显示图块预览模态框
     */
    showTilePreview(imageUrl, tileInfo) {
        // 移除已存在的预览模态框
        const existingModal = document.getElementById('tilePreviewModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 创建模态框
        const modal = document.createElement('div');
        modal.id = 'tilePreviewModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(4px);
        `;

        // 创建内容容器
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 12px;
            max-width: 90vw;
            max-height: 90vh;
            text-align: center;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        // 创建关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            border: none;
            background: #e53e3e;
            color: white;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            z-index: 10001;
            transition: background 0.3s ease;
        `;
        closeBtn.onmouseover = () => closeBtn.style.background = '#c53030';
        closeBtn.onmouseout = () => closeBtn.style.background = '#e53e3e';

        // 创建标题
        const title = document.createElement('h3');
        title.textContent = `图块 #${tileInfo.currentNumber} 预览`;
        title.style.cssText = `
            margin: 0 0 15px 0;
            color: #2d3748;
            font-size: 1.2em;
        `;

        // 创建图片信息
        const info = document.createElement('div');
        info.innerHTML = `
            <div style="color: #718096; font-size: 0.9em; margin-bottom: 15px;">
                <span style="margin-right: 15px;">当前序号: ${tileInfo.currentNumber}</span>
                <span style="margin-right: 15px;">原始序号: ${parseInt(tileInfo.originalIndex) + 1}</span>
                <span>位置: 第${parseInt(tileInfo.row) + 1}行，第${parseInt(tileInfo.col) + 1}列</span>
            </div>
        `;

        // 创建预览图片
        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.cssText = `
            max-width: 400px;
            max-height: 400px;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
        `;

        // 组装模态框
        content.appendChild(closeBtn);
        content.appendChild(title);
        content.appendChild(info);
        content.appendChild(img);
        modal.appendChild(content);

        // 添加事件监听器
        const closeModal = () => modal.remove();
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // ESC键关闭
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        // 添加到页面
        document.body.appendChild(modal);
    }

    /**
     * 右键删除事件
     */
    onTileRightClick(e) {
        e.preventDefault();
        const tile = e.target.closest('.grid-tile');
        if (tile) {
            // 如果图块已删除，则恢复它
            if (tile.dataset.deleted === 'true') {
                this.restoreTile(tile);
            } else {
                // 否则直接删除它
                this.deleteTile(tile);
            }
        }
    }

    /**
     * 删除按钮点击事件
     */
    onDeleteClick(e) {
        e.preventDefault();
        e.stopPropagation();
        const tile = e.target.closest('.grid-tile');
        if (tile) {
            // 如果图块已删除，则恢复它
            if (tile.dataset.deleted === 'true') {
                this.restoreTile(tile);
            } else {
                // 否则直接删除它
                this.deleteTile(tile);
            }
        }
    }

    /**
     * 删除图块
     */
    deleteTile(tile) {
        // 标记为已删除
        tile.dataset.deleted = 'true';
        tile.classList.add('deleted');
        
        // 更新删除按钮为恢复按钮
        const deleteBtn = tile.querySelector('.grid-tile-delete-btn');
        if (deleteBtn) {
            deleteBtn.innerHTML = '↻';
            deleteBtn.title = '恢复此图块';
        }
        
        // 更新图块顺序，移除已删除的图块
        const originalIndex = parseInt(tile.dataset.originalIndex);
        this.tileOrder = this.tileOrder.filter(index => index !== originalIndex);
        
        // 触发顺序变化事件
        this.container.dispatchEvent(new CustomEvent('tileOrderChanged', {
            detail: { order: this.getValidTileOrder() },
            bubbles: true
        }));
        
        // 显示通知
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
            Utils.showNotification(`图块 #${tile.dataset.currentNumber} 已删除`, 'success', 2000);
        }
    }

    /**
     * 恢复已删除的图块
     */
    restoreTile(tile) {
        // 取消删除标记
        tile.dataset.deleted = 'false';
        tile.classList.remove('deleted');
        
        // 更新按钮为删除按钮
        const deleteBtn = tile.querySelector('.grid-tile-delete-btn');
        if (deleteBtn) {
            deleteBtn.innerHTML = '×';
            deleteBtn.title = '删除此图块';
        }
        
        // 重新添加到图块顺序中
        const originalIndex = parseInt(tile.dataset.originalIndex);
        if (!this.tileOrder.includes(originalIndex)) {
            this.tileOrder.push(originalIndex);
            this.tileOrder.sort((a, b) => a - b); // 保持顺序
        }
        
        // 触发顺序变化事件
        this.container.dispatchEvent(new CustomEvent('tileOrderChanged', {
            detail: { order: this.getValidTileOrder() },
            bubbles: true
        }));
        
        // 显示通知
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
            Utils.showNotification(`图块 #${tile.dataset.currentNumber} 已恢复`, 'success', 2000);
        }
    }

    /**
     * 获取有效的图块顺序（排除已删除的）
     */
    getValidTileOrder() {
        return this.tileOrder.filter(index => {
            const tile = this.tiles.find(t => parseInt(t.dataset.originalIndex) === index);
            return tile && tile.dataset.deleted !== 'true';
        });
    }

    /**
     * 重置删除状态
     */
    resetDeletions() {
        this.tiles.forEach(tile => {
            if (tile.dataset.deleted === 'true') {
                this.restoreTile(tile);
            }
        });
        
        // 显示通知
        if (typeof Utils !== 'undefined' && Utils.showNotification) {
            Utils.showNotification('所有已删除的图块已恢复', 'success', 2000);
        }
    }

    /**
     * 根据排序方向获取列索引
     * @private
     */
    _getColumnIndex(row, col, cols, sortDirection) {
        switch (sortDirection) {
            case CONFIG.SORT_DIRECTIONS.ODD_LEFT_EVEN_RIGHT:
                return row % 2 === 0 ? col : cols - 1 - col;
            case CONFIG.SORT_DIRECTIONS.EVEN_LEFT_ODD_RIGHT:
                return row % 2 !== 0 ? col : cols - 1 - col;
            case CONFIG.SORT_DIRECTIONS.REVERSE:
                return cols - 1 - col;
            case CONFIG.SORT_DIRECTIONS.NORMAL:
            default:
                return col;
        }
    }
}

