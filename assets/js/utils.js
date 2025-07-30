/**
 * 工具类 - 提供通用的工具函数
 */
class Utils {
    /**
     * 防抖函数
     * @param {Function} func 要执行的函数
     * @param {number} delay 延迟时间(ms)
     * @returns {Function} 防抖后的函数
     */
    static debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * 节流函数
     * @param {Function} func 要执行的函数
     * @param {number} delay 延迟时间(ms)
     * @returns {Function} 节流后的函数
     */
    static throttle(func, delay) {
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            if (currentTime - lastExecTime >= delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            }
        };
    }

    /**
     * 格式化文件大小
     * @param {number} bytes 字节数
     * @returns {string} 格式化后的大小
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 格式化时间
     * @param {Date} date 日期对象
     * @returns {string} 格式化后的时间字符串
     */
    static formatDateTime(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * 验证图片文件
     * @param {File} file 文件对象
     * @returns {boolean} 是否为有效图片
     */
    static isValidImageFile(file) {
        return file && CONFIG.SUPPORTED_FORMATS.includes(file.type);
    }

    /**
     * 创建DOM元素
     * @param {string} tag 标签名
     * @param {Object} options 选项
     * @returns {HTMLElement} 创建的元素
     */
    static createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        if (options.className) element.className = options.className;
        if (options.id) element.id = options.id;
        if (options.text) element.textContent = options.text;
        if (options.html) element.innerHTML = options.html;
        
        if (options.style) {
            Object.assign(element.style, options.style);
        }
        
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        if (options.events) {
            Object.entries(options.events).forEach(([event, handler]) => {
                element.addEventListener(event, handler);
            });
        }
        
        return element;
    }

    /**
     * 显示通知消息
     * @param {string} message 消息内容
     * @param {string} type 消息类型 (success, error, warning, info)
     * @param {number} duration 显示时长(ms)
     */
    static showNotification(message, type = 'info', duration = 3000) {
        // 移除已存在的通知
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = this.createElement('div', {
            className: `notification notification-${type}`,
            text: message,
            style: {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 20px',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                zIndex: '10001',
                opacity: '0',
                transform: 'translateX(100%)',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                backgroundColor: this.getNotificationColor(type)
            }
        });

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // 自动隐藏
        if (duration > 0) {
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
    }

    /**
     * 获取通知颜色
     * @param {string} type 消息类型
     * @returns {string} 颜色值
     */
    static getNotificationColor(type) {
        const colors = {
            success: '#48bb78',
            error: '#e53e3e',
            warning: '#ed8936',
            info: '#4299e1'
        };
        return colors[type] || colors.info;
    }

    /**
     * 下载文件
     * @param {Blob|string} data 文件数据
     * @param {string} filename 文件名
     */
    static downloadFile(data, filename) {
        const url = typeof data === 'string' ? data : URL.createObjectURL(data);
        const link = this.createElement('a', {
            attributes: {
                href: url,
                download: filename
            }
        });
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (typeof data !== 'string') {
            URL.revokeObjectURL(url);
        }
    }

    /**
     * 加载图片
     * @param {string|File} source 图片源
     * @returns {Promise<HTMLImageElement>} 图片元素
     */
    static loadImage(source) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('图片加载失败'));
            
            if (source instanceof File) {
                const reader = new FileReader();
                reader.onload = (e) => img.src = e.target.result;
                reader.onerror = () => reject(new Error('文件读取失败'));
                reader.readAsDataURL(source);
            } else {
                img.src = source;
            }
        });
    }

    /**
     * 深度克隆对象
     * @param {*} obj 要克隆的对象
     * @returns {*} 克隆后的对象
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Object) {
            const clonedObj = {};
            Object.keys(obj).forEach(key => {
                clonedObj[key] = this.deepClone(obj[key]);
            });
            return clonedObj;
        }
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 检查浏览器支持
     * @returns {Object} 支持情况
     */
    static checkBrowserSupport() {
        return {
            canvas: !!document.createElement('canvas').getContext,
            fileReader: !!window.FileReader,
            localStorage: !!window.localStorage,
            dragDrop: 'draggable' in document.createElement('div'),
            webWorker: !!window.Worker
        };
    }
}

// 导出工具类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
