/**
 * 应用主逻辑
 * 初始化页面，处理数据渲染和自动刷新
 */

const App = {
    // 刷新间隔（毫秒）- 实时模式使用3秒
    refreshInterval: 3000,
    // 定时器ID
    timerId: null,
    // 是否自动刷新
    isAutoRefresh: true,
    // 是否正在刷新
    isRefreshing: false,
    // 上一次的数据（用于对比变化）
    lastStockData: null,
    lastSectorData: null,
    
    /**
     * 初始化应用
     */
    init() {
        this.bindEvents();
        this.checkMarketStatus();
        this.refreshData();
        this.startAutoRefresh();
    },
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 手动刷新按钮
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }
        
        // 自动刷新开关
        const autoRefreshCheckbox = document.getElementById('autoRefresh');
        if (autoRefreshCheckbox) {
            autoRefreshCheckbox.addEventListener('change', (e) => {
                this.isAutoRefresh = e.target.checked;
                if (this.isAutoRefresh) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });
        }
        
        // 页面可见性变化时处理
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoRefresh();
            } else if (this.isAutoRefresh) {
                this.startAutoRefresh();
                this.refreshData();
            }
        });
    },
    
    /**
     * 检查市场状态
     */
    checkMarketStatus() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const day = now.getDay();
        
        const marketStatusEl = document.getElementById('marketStatus');
        if (!marketStatusEl) return;
        
        // 周末休市
        if (day === 0 || day === 6) {
            marketStatusEl.textContent = '休市中';
            marketStatusEl.className = 'market-status closed';
            return;
        }
        
        // 交易时间：9:30-11:30, 13:00-15:00
        const time = hours * 60 + minutes;
        const isOpen = (time >= 570 && time <= 690) || (time >= 780 && time <= 900);
        
        if (isOpen) {
            marketStatusEl.textContent = '交易中';
            marketStatusEl.className = 'market-status open';
        } else {
            marketStatusEl.textContent = '已收盘';
            marketStatusEl.className = 'market-status closed';
        }
    },
    
    /**
     * 开始自动刷新
     */
    startAutoRefresh() {
        this.stopAutoRefresh();
        if (this.isAutoRefresh) {
            this.timerId = setInterval(() => {
                this.refreshData();
            }, this.refreshInterval);
        }
    },
    
    /**
     * 停止自动刷新
     */
    stopAutoRefresh() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    },
    
    /**
     * 刷新数据
     */
    async refreshData() {
        if (this.isRefreshing) return;
        
        this.isRefreshing = true;
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.classList.add('refreshing');
            refreshBtn.disabled = true;
        }
        
        try {
            // 并行获取股票和行业数据
            const [stocks, sectors] = await Promise.all([
                StockService.getTopGainers(10),
                SectorService.getTopSectors(5)
            ]);
            
            // 对比数据变化
            const stockChanges = this.compareData(stocks, this.lastStockData, 'code');
            const sectorChanges = this.compareData(sectors, this.lastSectorData, 'code');
            
            // 保存当前数据
            this.lastStockData = stocks;
            this.lastSectorData = sectors;
            
            // 渲染数据（传入变化信息）
            this.renderStocks(stocks, stockChanges);
            this.renderSectors(sectors, sectorChanges);
            
            // 更新时间
            this.updateTime();
            
            // 更新市场状态
            this.checkMarketStatus();
            
        } catch (error) {
            console.error('刷新数据失败:', error);
            // 如果API失败，显示错误信息
            this.showError('数据加载失败，请检查网络连接或稍后重试');
        } finally {
            this.isRefreshing = false;
            if (refreshBtn) {
                refreshBtn.classList.remove('refreshing');
                refreshBtn.disabled = false;
            }
        }
    },
    
    /**
     * 对比数据变化
     * @param {Array} newData - 新数据
     * @param {Array} oldData - 旧数据
     * @param {string} key - 对比键
     * @returns {Object} - 变化信息
     */
    compareData(newData, oldData, key) {
        if (!oldData) return {};
        
        const changes = {};
        const oldMap = {};
        oldData.forEach(item => {
            oldMap[item[key]] = item;
        });
        
        newData.forEach(item => {
            const oldItem = oldMap[item[key]];
            if (oldItem) {
                const priceChange = parseFloat(item.price) - parseFloat(oldItem.price);
                const percentChange = parseFloat(item.changePercent) - parseFloat(oldItem.changePercent);
                
                if (Math.abs(priceChange) > 0.001 || Math.abs(percentChange) > 0.01) {
                    changes[item[key]] = {
                        priceChange: priceChange,
                        percentChange: percentChange,
                        isUp: priceChange > 0,
                        isDown: priceChange < 0
                    };
                }
            }
        });
        
        return changes;
    },
    

    
    /**
     * 渲染股票列表
     * @param {Array} stocks - 股票数据数组
     * @param {Object} changes - 变化信息
     */
    renderStocks(stocks, changes = {}) {
        const container = document.getElementById('stockList');
        if (!container) return;
        
        if (!stocks || stocks.length === 0) {
            container.innerHTML = '<div class="error">暂无数据</div>';
            return;
        }
        
        const html = stocks.map((stock, index) => {
            const rankClass = index === 0 ? 'top1' : index === 1 ? 'top2' : index === 2 ? 'top3' : 'other';
            const trendClass = stock.isUp ? 'up' : stock.isDown ? 'down' : 'flat';
            const sign = stock.isUp ? '+' : '';
            
            // 检查是否有变化
            const change = changes[stock.code];
            const flashClass = change ? (change.isUp ? 'flash-up' : change.isDown ? 'flash-down' : '') : '';
            
            return `
                <div class="stock-item ${trendClass} ${flashClass}" data-code="${stock.code}">
                    <div class="stock-rank ${rankClass}">${index + 1}</div>
                    <div class="stock-info">
                        <div class="stock-name">${stock.name}</div>
                        <div class="stock-code">${stock.code}</div>
                    </div>
                    <div class="stock-price">${stock.price}</div>
                    <div class="stock-change">
                        <div class="change-percent">${sign}${stock.changePercent}%</div>
                        <div class="change-amount">${sign}${stock.changeAmount}</div>
                    </div>
                    <div class="stock-volume">${stock.volume}</div>
                    <div class="stock-turnover">${stock.turnover}</div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
        
        // 移除闪烁效果
        setTimeout(() => {
            container.querySelectorAll('.flash-up, .flash-down').forEach(el => {
                el.classList.remove('flash-up', 'flash-down');
            });
        }, 1000);
    },
    
    /**
     * 渲染行业列表
     * @param {Array} sectors - 行业数据数组
     * @param {Object} changes - 变化信息
     */
    renderSectors(sectors, changes = {}) {
        const container = document.getElementById('sectorList');
        if (!container) return;
        
        if (!sectors || sectors.length === 0) {
            container.innerHTML = '<div class="error">暂无数据</div>';
            return;
        }
        
        const html = sectors.map((sector, index) => {
            const trendClass = sector.isUp ? 'up' : sector.isDown ? 'down' : 'flat';
            const sign = sector.isUp ? '+' : '';
            const leadingTrendClass = parseFloat(sector.leadingStockChange) > 0 ? 'up' : 
                                      parseFloat(sector.leadingStockChange) < 0 ? 'down' : 'flat';
            const leadingSign = parseFloat(sector.leadingStockChange) > 0 ? '+' : '';
            
            // 检查是否有变化
            const change = changes[sector.code];
            const flashClass = change ? (change.isUp ? 'flash-up' : change.isDown ? 'flash-down' : '') : '';
            
            return `
                <div class="sector-item ${trendClass} ${flashClass}" data-code="${sector.code}">
                    <div class="sector-header">
                        <div class="sector-name">${index + 1}. ${sector.name}</div>
                        <div class="sector-change">
                            <div class="change-percent">${sign}${sector.changePercent}%</div>
                        </div>
                    </div>
                    <div class="sector-index">指数: ${sector.index}</div>
                    <div class="sector-details">
                        <div class="sector-detail-item">
                            <span class="sector-detail-label">成交量</span>
                            <span class="sector-detail-value">${sector.volume}</span>
                        </div>
                        <div class="sector-detail-item">
                            <span class="sector-detail-label">成交额</span>
                            <span class="sector-detail-value">${sector.turnover}</span>
                        </div>
                    </div>
                    <div class="sector-leading">
                        <span class="sector-leading-label">领涨股</span>
                        <div class="sector-leading-stock">
                            <span class="leading-name">${sector.leadingStock}</span>
                            <span class="leading-change ${leadingTrendClass}">${leadingSign}${sector.leadingStockChange}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
        
        // 移除闪烁效果
        setTimeout(() => {
            container.querySelectorAll('.flash-up, .flash-down').forEach(el => {
                el.classList.remove('flash-up', 'flash-down');
            });
        }, 1000);
    },
    
    /**
     * 更新时间显示
     */
    updateTime() {
        const timeEl = document.getElementById('updateTime');
        if (timeEl) {
            const now = new Date();
            const timeStr = now.toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            timeEl.textContent = timeStr;
        }
    },
    
    /**
     * 显示错误信息
     * @param {string} message - 错误消息
     */
    showError(message) {
        const stockList = document.getElementById('stockList');
        const sectorList = document.getElementById('sectorList');
        
        if (stockList) {
            stockList.innerHTML = `<div class="error">${message}</div>`;
        }
        if (sectorList) {
            sectorList.innerHTML = `<div class="error">${message}</div>`;
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// 导出App模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
