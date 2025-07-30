/**
 * 图片处理类 - 负责图片的切割、预览等操作
 */
class ImageProcessor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
    }

    /**
     * 生成预览图
     * @param {HTMLImageElement} img 原始图片
     * @param {Object} options 选项
     * @returns {string} 预览图的DataURL
     */
    generatePreview(img, options) {
        const {
            rows = CONFIG.DEFAULTS.ROWS,
            cols = CONFIG.DEFAULTS.COLS,
            startNum = CONFIG.DEFAULTS.START_NUM,
            fontSize = CONFIG.DEFAULTS.FONT_SIZE,
            addNumber = CONFIG.DEFAULTS.ADD_NUMBER,
            sortDirection = CONFIG.DEFAULTS.SORT_DIRECTION
        } = options;

        // 创建画布
        this.canvas = document.createElement('canvas');
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx = this.canvas.getContext('2d');

        // 绘制原图
        this.ctx.drawImage(img, 0, 0);

        // 计算区块尺寸
        const tileWidth = img.width / cols;
        const tileHeight = img.height / rows;

        // 绘制网格
        this._drawGrid(tileWidth, tileHeight, rows, cols);

        // 添加序号
        if (addNumber) {
            this._drawNumbers(tileWidth, tileHeight, rows, cols, startNum, fontSize, sortDirection);
        }

        return this.canvas.toDataURL('image/png');
    }

    /**
     * 切割图片
     * @param {HTMLImageElement} img 原始图片
     * @param {Object} options 选项
     * @returns {Promise<Blob>} ZIP文件Blob
     */
    async splitImage(img, options) {
        const {
            rows = CONFIG.DEFAULTS.ROWS,
            cols = CONFIG.DEFAULTS.COLS,
            startNum = CONFIG.DEFAULTS.START_NUM,
            fontSize = CONFIG.DEFAULTS.FONT_SIZE,
            addNumber = CONFIG.DEFAULTS.ADD_NUMBER,
            sortDirection = CONFIG.DEFAULTS.SORT_DIRECTION,
            customOrder = null
        } = options;

        const tileWidth = img.width / cols;
        const tileHeight = img.height / rows;

        const zip = new JSZip();
        const imgFolder = zip.folder('tiles');
        const promises = [];

        // 创建所有图块数据
        const tiles = [];
        let originalIndex = 0;

        for (let r = 0; r < rows; r++) {
            const row = sortDirection === CONFIG.SORT_DIRECTIONS.REVERSE ? rows - 1 - r : r;
            for (let c = 0; c < cols; c++) {
                const col = this._getColumnIndex(row, c, cols, sortDirection);
                
                const tileCanvas = this._createTileCanvas(
                    img, col, row, tileWidth, tileHeight, 0, fontSize, addNumber
                );
                
                tiles.push({
                    canvas: tileCanvas,
                    originalIndex: originalIndex,
                    row: row,
                    col: col
                });
                originalIndex++;
            }
        }

        // 如果有自定义顺序，按自定义顺序重排，并过滤掉已删除的图块
        let orderedTiles = tiles;
        if (customOrder && Array.isArray(customOrder)) {
            // customOrder现在包含的是有效的（未删除的）图块索引
            orderedTiles = customOrder.map(index => tiles[index]).filter(tile => tile);
        }

        // 生成文件
        orderedTiles.forEach((tile, index) => {
            const count = startNum + index + 1;
            const filename = `${count.toString().padStart(4, '0')}.png`;
            
            const promise = this._canvasToBlob(tile.canvas).then(blob => {
                imgFolder.file(filename, blob);
            });
            promises.push(promise);
        });

        await Promise.all(promises);
        return await zip.generateAsync({ type: 'blob' });
    }

    /**
     * 绘制网格线
     * @private
     */
    _drawGrid(tileWidth, tileHeight, rows, cols) {
        this.ctx.strokeStyle = CONFIG.UI.GRID_COLOR;
        this.ctx.lineWidth = CONFIG.UI.GRID_LINE_WIDTH;

        // 绘制垂直线
        for (let i = 1; i < cols; i++) {
            const x = i * tileWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // 绘制水平线
        for (let i = 1; i < rows; i++) {
            const y = i * tileHeight;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    /**
     * 绘制序号
     * @private
     */
    _drawNumbers(tileWidth, tileHeight, rows, cols, startNum, fontSize, sortDirection) {
        this.ctx.font = `${fontSize}px 'Segoe UI', Arial, sans-serif`;
        this.ctx.fillStyle = CONFIG.UI.TEXT_COLOR;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 3;

        let count = startNum + 1;

        for (let r = 0; r < rows; r++) {
            // 根据排序方向确定实际的行索引
            const row = sortDirection === CONFIG.SORT_DIRECTIONS.REVERSE ? rows - 1 - r : r;
            
            for (let col = 0; col < cols; col++) {
                const colIdx = this._getColumnIndex(row, col, cols, sortDirection);
                const x = colIdx * tileWidth + tileWidth / 2;
                const y = row * tileHeight + tileHeight / 2;
                
                const text = count.toString();
                
                // 绘制文字描边
                this.ctx.strokeText(text, x, y);
                // 绘制文字填充
                this.ctx.fillText(text, x, y);
                
                count++;
            }
        }
    }

    /**
     * 获取列索引（根据排序方向）
     * @private
     */
    _getColumnIndex(row, col, cols, sortDirection) {
        switch (sortDirection) {
            case CONFIG.SORT_DIRECTIONS.NORMAL:
                return col;
            case CONFIG.SORT_DIRECTIONS.ODD_LEFT_EVEN_RIGHT:
                return (row + 1) % 2 === 0 ? cols - col - 1 : col;
            case CONFIG.SORT_DIRECTIONS.EVEN_LEFT_ODD_RIGHT:
                return (row + 1) % 2 === 0 ? col : cols - col - 1;
            default:
                return col;
        }
    }

    /**
     * 创建单个瓦片画布
     * @private
     */
    _createTileCanvas(img, colIdx, row, tileWidth, tileHeight, count, fontSize, addNumber) {
        const canvas = document.createElement('canvas');
        canvas.width = tileWidth;
        canvas.height = tileHeight;
        const ctx = canvas.getContext('2d');

        // 切割图片
        ctx.drawImage(
            img,
            colIdx * tileWidth, row * tileHeight, tileWidth, tileHeight,
            0, 0, tileWidth, tileHeight
        );

        // 添加序号
        if (addNumber) {
            ctx.font = `${fontSize}px 'Segoe UI', Arial, sans-serif`;
            ctx.fillStyle = CONFIG.UI.TEXT_COLOR;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;

            const text = count.toString();
            const x = tileWidth / 2;
            const y = tileHeight / 2;

            // 绘制文字描边和填充
            ctx.strokeText(text, x, y);
            ctx.fillText(text, x, y);
        }

        return canvas;
    }

    /**
     * 将画布转换为Blob
     * @private
     */
    _canvasToBlob(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png');
        });
    }

    /**
     * 获取图片信息
     * @param {HTMLImageElement} img 图片元素
     * @returns {Object} 图片信息
     */
    getImageInfo(img) {
        return {
            width: img.width,
            height: img.height,
            aspectRatio: (img.width / img.height).toFixed(2),
            format: 'Unknown'
        };
    }

    /**
     * 调整图片大小（如果需要）
     * @param {HTMLImageElement} img 原始图片
     * @param {number} maxWidth 最大宽度
     * @param {number} maxHeight 最大高度
     * @returns {HTMLCanvasElement} 调整后的画布
     */
    resizeImage(img, maxWidth, maxHeight) {
        let { width, height } = img;
        
        // 计算新的尺寸
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        return canvas;
    }

    /**
     * 清理资源
     */
    dispose() {
        this.canvas = null;
        this.ctx = null;
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

// 导出图片处理类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageProcessor;
}
