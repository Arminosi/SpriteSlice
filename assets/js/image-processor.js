/**
 * 图片处理类 - 负责图片的切割、预览等操作
 */
class ImageProcessor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this._gifuctLoadingPromise = null;
    }

    async processGif(file) {
        const buffer = await this._readFileAsArrayBuffer(file);
        return await this.processGifArrayBuffer(buffer);
    }

    async processGifArrayBuffer(buffer) {
        const gifMeta = this._extractGifMetadata(buffer);
        if (typeof ImageDecoder !== 'undefined' && ImageDecoder.isTypeSupported) {
            const supported = await ImageDecoder.isTypeSupported('image/gif');
            if (supported) {
                const result = await this._processGifWithImageDecoder(buffer);
                return { ...result, gifMeta };
            }
        }

        await this._ensureGifuctLoaded();

        const gifuctLib = window.gifuct || null;
        const parseGIFFn =
            (gifuctLib && typeof gifuctLib.parseGIF === 'function' && gifuctLib.parseGIF) ||
            (typeof window.parseGIF === 'function' && window.parseGIF) ||
            null;
        const decompressFramesFn =
            (gifuctLib && typeof gifuctLib.decompressFrames === 'function' && gifuctLib.decompressFrames) ||
            (typeof window.decompressFrames === 'function' && window.decompressFrames) ||
            null;

        if (!parseGIFFn || !decompressFramesFn) {
            throw new Error('GIF 解析库未加载，请刷新页面重试');
        }

        const gif = parseGIFFn(buffer);
        const frames = decompressFramesFn(gif, true);

        if (!frames || frames.length === 0) {
            throw new Error('无法解析 GIF 帧');
        }

        const renderedFrames = this._renderGifFrames(frames, gif.lsd);
        const frameCount = renderedFrames.length;
        const cols = Math.ceil(Math.sqrt(frameCount));
        const rows = Math.ceil(frameCount / cols);

        const frameWidth = gif.lsd.width;
        const frameHeight = gif.lsd.height;

        const spriteCanvas = document.createElement('canvas');
        spriteCanvas.width = cols * frameWidth;
        spriteCanvas.height = rows * frameHeight;
        const ctx = spriteCanvas.getContext('2d');

        renderedFrames.forEach((frameCanvas, index) => {
            const r = Math.floor(index / cols);
            const c = index % cols;
            ctx.drawImage(frameCanvas, c * frameWidth, r * frameHeight);
        });

        return {
            canvas: spriteCanvas,
            rows,
            cols,
            frameCount,
            frameWidth,
            frameHeight,
            gifMeta
        };
    }

    async _processGifWithImageDecoder(buffer) {
        const decoder = new ImageDecoder({ data: buffer, type: 'image/gif' });
        await decoder.tracks.ready;

        const track = decoder.tracks.selectedTrack;
        const frameCount = track.frameCount || 1;

        const firstFrame = await decoder.decode({ frameIndex: 0 });
        const frameWidth = firstFrame.image.displayWidth;
        const frameHeight = firstFrame.image.displayHeight;
        firstFrame.image.close();

        const cols = Math.ceil(Math.sqrt(frameCount));
        const rows = Math.ceil(frameCount / cols);

        const spriteCanvas = document.createElement('canvas');
        spriteCanvas.width = cols * frameWidth;
        spriteCanvas.height = rows * frameHeight;
        const ctx = spriteCanvas.getContext('2d');

        for (let i = 0; i < frameCount; i++) {
            const decoded = await decoder.decode({ frameIndex: i });
            const r = Math.floor(i / cols);
            const c = i % cols;
            ctx.drawImage(decoded.image, c * frameWidth, r * frameHeight, frameWidth, frameHeight);
            decoded.image.close();
        }

        decoder.close();

        return {
            canvas: spriteCanvas,
            rows,
            cols,
            frameCount,
            frameWidth,
            frameHeight
        };
    }

    _extractGifMetadata(buffer) {
        const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        const len = bytes.length;
        if (len < 14) {
            return {
                width: 0,
                height: 0,
                frameCount: 0,
                delaysMs: [],
                minDelayMs: null,
                maxDelayMs: null,
                avgDelayMs: null,
                fps: null,
                durationMs: 0,
                loopCount: null
            };
        }

        const signature =
            String.fromCharCode(bytes[0], bytes[1], bytes[2]) +
            String.fromCharCode(bytes[3], bytes[4], bytes[5]);
        const isGif = signature === 'GIF87a' || signature === 'GIF89a';
        if (!isGif) {
            return {
                width: 0,
                height: 0,
                frameCount: 0,
                delaysMs: [],
                minDelayMs: null,
                maxDelayMs: null,
                avgDelayMs: null,
                fps: null,
                durationMs: 0,
                loopCount: null
            };
        }

        const readU16 = (offset) => bytes[offset] | (bytes[offset + 1] << 8);

        let pos = 6;
        const width = readU16(pos);
        const height = readU16(pos + 2);
        const lsdPacked = bytes[pos + 4];
        pos += 7;

        if (lsdPacked & 0x80) {
            const gctSize = 3 * (1 << ((lsdPacked & 0x07) + 1));
            pos += gctSize;
        }

        let loopCount = null;
        const delaysCs = [];
        let imageCount = 0;

        const skipSubBlocks = () => {
            while (pos < len) {
                const size = bytes[pos++];
                if (size === 0) return;
                pos += size;
            }
        };

        while (pos < len) {
            const blockId = bytes[pos++];

            if (blockId === 0x3b) {
                break;
            }

            if (blockId === 0x21) {
                const label = bytes[pos++];
                if (label === 0xf9) {
                    const blockSize = bytes[pos++];
                    if (blockSize >= 4 && pos + 4 <= len) {
                        pos += 1;
                        const delay = readU16(pos);
                        pos += 2;
                        pos += 1;
                        pos += 1;
                        delaysCs.push(delay);
                    } else {
                        pos += blockSize;
                        if (pos < len) pos += 1;
                    }
                    continue;
                }

                if (label === 0xff) {
                    const appBlockSize = bytes[pos++];
                    const appEnd = Math.min(len, pos + appBlockSize);
                    const appId = String.fromCharCode(...bytes.slice(pos, appEnd));
                    pos = appEnd;

                    const isNetscape = appId === 'NETSCAPE2.0' || appId === 'ANIMEXTS1.0';
                    while (pos < len) {
                        const size = bytes[pos++];
                        if (size === 0) break;
                        if (isNetscape && size >= 3 && bytes[pos] === 1 && loopCount === null) {
                            loopCount = bytes[pos + 1] | (bytes[pos + 2] << 8);
                        }
                        pos += size;
                    }
                    continue;
                }

                skipSubBlocks();
                continue;
            }

            if (blockId === 0x2c) {
                if (pos + 9 > len) break;
                const packed = bytes[pos + 8];
                pos += 9;
                imageCount += 1;

                if (packed & 0x80) {
                    const lctSize = 3 * (1 << ((packed & 0x07) + 1));
                    pos += lctSize;
                }

                pos += 1;
                skipSubBlocks();
                continue;
            }

            break;
        }

        const frameCount = Math.max(imageCount, delaysCs.length);
        const delaysMs = Array.from({ length: frameCount }).map((_, i) => {
            const cs = delaysCs[i];
            return typeof cs === 'number' ? cs * 10 : null;
        });

        const delaysForRate = delaysMs
            .map((ms) => (typeof ms === 'number' ? ms : null))
            .filter((ms) => typeof ms === 'number')
            .map((ms) => Math.max(10, ms));

        let minDelayMs = null;
        let maxDelayMs = null;
        let avgDelayMs = null;
        let fps = null;
        let durationMs = 0;

        if (delaysForRate.length > 0) {
            minDelayMs = Math.min(...delaysForRate);
            maxDelayMs = Math.max(...delaysForRate);
            durationMs = delaysForRate.reduce((sum, ms) => sum + ms, 0);
            avgDelayMs = durationMs / delaysForRate.length;
            fps = avgDelayMs > 0 ? 1000 / avgDelayMs : null;
        }

        return {
            width,
            height,
            frameCount,
            delaysMs,
            minDelayMs,
            maxDelayMs,
            avgDelayMs,
            fps,
            durationMs,
            loopCount
        };
    }

    _renderGifFrames(frames, lsd) {
        const canvas = document.createElement('canvas');
        canvas.width = lsd.width;
        canvas.height = lsd.height;
        const ctx = canvas.getContext('2d');
        const frameCanvases = [];

        const patchCanvas = document.createElement('canvas');
        const patchCtx = patchCanvas.getContext('2d');

        frames.forEach(frame => {
            const dims = frame.dims;
            const previousState = ctx.getImageData(0, 0, canvas.width, canvas.height);

            if (frame.patch && frame.patch.length > 0) {
                if (patchCanvas.width !== dims.width || patchCanvas.height !== dims.height) {
                    patchCanvas.width = dims.width;
                    patchCanvas.height = dims.height;
                }

                const imageData = new ImageData(frame.patch, dims.width, dims.height);
                patchCtx.putImageData(imageData, 0, 0);

                ctx.drawImage(patchCanvas, dims.left, dims.top);
            }

            const frameOutput = document.createElement('canvas');
            frameOutput.width = lsd.width;
            frameOutput.height = lsd.height;
            frameOutput.getContext('2d').drawImage(canvas, 0, 0);
            frameCanvases.push(frameOutput);

            if (frame.disposalType === 2) {
                ctx.clearRect(dims.left, dims.top, dims.width, dims.height);
            } else if (frame.disposalType === 3) {
                ctx.putImageData(previousState, 0, 0);
            }
        });

        return frameCanvases;
    }

    _readFileAsArrayBuffer(file) {
        if (file && typeof file.arrayBuffer === 'function') {
            return file.arrayBuffer();
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('读取文件失败'));
            reader.readAsArrayBuffer(file);
        });
    }

    async _ensureGifuctLoaded() {
        const hasGifuct =
            (window.gifuct && typeof window.gifuct.parseGIF === 'function' && typeof window.gifuct.decompressFrames === 'function') ||
            (typeof window.parseGIF === 'function' && typeof window.decompressFrames === 'function');

        if (hasGifuct) return;

        if (this._gifuctLoadingPromise) {
            return await this._gifuctLoadingPromise;
        }

        const urls = [
            'https://cdn.jsdelivr.net/npm/gifuct-js@2.1.2/dist/gifuct-js.min.js',
            'https://unpkg.com/gifuct-js@2.1.2/dist/gifuct-js.min.js'
        ];

        this._gifuctLoadingPromise = new Promise((resolve, reject) => {
            const tryLoad = (idx) => {
                if (idx >= urls.length) {
                    reject(new Error('GIF 解析库加载失败'));
                    return;
                }

                const script = document.createElement('script');
                script.src = urls[idx];
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => {
                    script.remove();
                    tryLoad(idx + 1);
                };
                document.head.appendChild(script);
            };

            tryLoad(0);
        });

        await this._gifuctLoadingPromise;
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
