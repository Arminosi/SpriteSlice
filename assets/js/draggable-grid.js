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
        
        // 设置CSS Grid布局
        this.container.style.display = 'grid';
        this.container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        this.container.style.gap = '2px';

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
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // 计算实际的列索引（考虑排序方向）
                const actualCol = this._getColumnIndex(row, col, cols, sortDirection);
                
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
        
        // 设置固定的图块尺寸，确保在网格中正确显示
        tile.style.width = '80px';
        tile.style.height = '80px';
        tile.style.minWidth = '60px';
        tile.style.minHeight = '60px';
        
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

        return tile;
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        this.tiles.forEach(tile => {
            // 桌面端拖拽事件
            tile.addEventListener('dragstart', (e) => this.onDragStart(e));
            tile.addEventListener('dragend', (e) => this.onDragEnd(e));
            tile.addEventListener('dragover', (e) => this.onDragOver(e));
            tile.addEventListener('drop', (e) => this.onDrop(e));
            tile.addEventListener('dragenter', (e) => this.onDragEnter(e));
            tile.addEventListener('dragleave', (e) => this.onDragLeave(e));

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
        
        // 清除所有drop-target样式
        this.tiles.forEach(tile => {
            tile.classList.remove('drop-target');
        });
        
        this.draggedTile = null;
        this.dropTarget = null;
    }

    /**
     * 拖拽悬停事件
     */
    onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    /**
     * 拖拽进入事件
     */
    onDragEnter(e) {
        e.preventDefault();
        if (e.target !== this.draggedTile && e.target.classList.contains('grid-tile')) {
            e.target.classList.add('drop-target');
            this.dropTarget = e.target;
        }
    }

    /**
     * 拖拽离开事件
     */
    onDragLeave(e) {
        if (e.target.classList.contains('grid-tile')) {
            e.target.classList.remove('drop-target');
        }
    }

    /**
     * 放置事件
     */
    onDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        if (this.dropTarget && this.draggedTile !== this.dropTarget) {
            // 交换两个图块的位置
            this.swapTiles(this.draggedTile, this.dropTarget);
            
            // 更新序号显示
            this.updateTileNumbers();
            
            // 触发变化事件
            this.onOrderChanged();
        }

        // 清理样式
        this.tiles.forEach(tile => {
            tile.classList.remove('drop-target');
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
            const numberSpan = tile.querySelector('.grid-tile-number');
            if (numberSpan) {
                numberSpan.textContent = startNum + index + 1;
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

        // 清除之前的drop-target样式
        this.tiles.forEach(tile => {
            if (tile !== this.touchStartTile) {
                tile.classList.remove('drop-target');
            }
        });

        if (targetTile && targetTile !== this.touchStartTile) {
            targetTile.classList.add('drop-target');
            this.dropTarget = targetTile;
        }
    }

    /**
     * 触摸结束事件
     */
    onTouchEnd(e) {
        e.preventDefault();
        
        if (this.touchStartTile && this.dropTarget) {
            // 执行交换
            this.swapTiles(this.touchStartTile, this.dropTarget);
            this.updateTileNumbers();
            this.onOrderChanged();
        }

        // 清理状态
        if (this.touchStartTile) {
            this.touchStartTile.classList.remove('dragging');
        }
        this.tiles.forEach(tile => {
            tile.classList.remove('drop-target');
        });

        this.touchStartTile = null;
        this.dropTarget = null;
        this.isDragging = false;
    }
}

