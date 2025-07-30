/**
 * 标签页功能模块
 * 处理设置面板中的标签页切换
 */

class TabManager {
    constructor() {
        this.currentTab = 'basic';
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // 标签页按钮点击事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button')) {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            }
        });
    }

    switchTab(tabName) {
        // 移除所有标签按钮的激活状态
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // 隐藏所有标签页内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // 激活当前标签按钮
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // 显示当前标签页内容
        const activeContent = document.getElementById(`${tabName}Tab`);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        this.currentTab = tabName;
    }

    getCurrentTab() {
        return this.currentTab;
    }
}

// 创建全局标签页管理器实例
window.tabManager = new TabManager();
