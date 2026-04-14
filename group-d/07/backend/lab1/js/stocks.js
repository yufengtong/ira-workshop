/**
 * 股票数据逻辑模块
 * 处理股票数据的获取、排序和格式化
 */

const StockService = {
    // 缓存数据
    cache: null,
    cacheTime: null,
    cacheDuration: 5000, // 缓存5秒
    
    /**
     * 获取涨幅最好的股票
     * @param {number} count - 获取数量，默认10
     * @returns {Promise<Array>} - 返回排序后的股票数组
     */
    async getTopGainers(count = 10) {
        try {
            // 检查缓存
            if (this.cache && this.cacheTime && 
                (Date.now() - this.cacheTime) < this.cacheDuration) {
                return this.sortAndLimit(this.cache, count);
            }
            
            // 获取股票列表
            const stocks = await StockAPI.getStockList(200);
            
            // 更新缓存
            this.cache = stocks;
            this.cacheTime = Date.now();
            
            return this.sortAndLimit(stocks, count);
        } catch (error) {
            console.error('获取涨幅股票失败:', error);
            throw error;
        }
    },
    
    /**
     * 排序并限制数量
     * @param {Array} stocks - 股票数组
     * @param {number} count - 限制数量
     * @returns {Array} - 处理后的数组
     */
    sortAndLimit(stocks, count) {
        // 过滤掉无效数据（停牌或涨跌幅为-的）
        const validStocks = stocks.filter(stock => 
            stock.changePercent !== null && 
            stock.changePercent !== undefined &&
            stock.changePercent !== '-'
        );
        
        // 按涨跌幅降序排序
        const sorted = validStocks.sort((a, b) => b.changePercent - a.changePercent);
        
        // 取前count个
        return sorted.slice(0, count).map(stock => this.formatStock(stock));
    },
    
    /**
     * 格式化股票数据
     * @param {Object} stock - 原始股票数据
     * @returns {Object} - 格式化后的数据
     */
    formatStock(stock) {
        return {
            code: stock.code,
            name: stock.name,
            price: this.formatPrice(stock.price),
            changePercent: this.formatPercent(stock.changePercent),
            changeAmount: this.formatPrice(stock.changeAmount),
            volume: this.formatVolume(stock.volume),
            turnover: this.formatTurnover(stock.turnover),
            turnoverRate: this.formatPercent(stock.turnoverRate),
            peRatio: stock.peRatio || '-',
            // 用于判断涨跌状态
            isUp: stock.changePercent > 0,
            isDown: stock.changePercent < 0,
            isFlat: stock.changePercent === 0
        };
    },
    
    /**
     * 格式化价格
     * @param {number} price - 价格
     * @returns {string} - 格式化后的价格
     */
    formatPrice(price) {
        if (price === null || price === undefined || price === '-') {
            return '-';
        }
        return parseFloat(price).toFixed(2);
    },
    
    /**
     * 格式化百分比
     * @param {number} percent - 百分比数值
     * @returns {string} - 格式化后的百分比
     */
    formatPercent(percent) {
        if (percent === null || percent === undefined || percent === '-') {
            return '-';
        }
        return parseFloat(percent).toFixed(2);
    },
    
    /**
     * 格式化成交量
     * @param {number} volume - 成交量
     * @returns {string} - 格式化后的成交量
     */
    formatVolume(volume) {
        if (volume === null || volume === undefined || volume === '-') {
            return '-';
        }
        const v = parseFloat(volume);
        if (v >= 100000000) {
            return (v / 100000000).toFixed(2) + '亿';
        } else if (v >= 10000) {
            return (v / 10000).toFixed(2) + '万';
        }
        return v.toString();
    },
    
    /**
     * 格式化成交额
     * @param {number} turnover - 成交额
     * @returns {string} - 格式化后的成交额
     */
    formatTurnover(turnover) {
        if (turnover === null || turnover === undefined || turnover === '-') {
            return '-';
        }
        const t = parseFloat(turnover);
        if (t >= 100000000) {
            return (t / 100000000).toFixed(2) + '亿';
        } else if (t >= 10000) {
            return (t / 10000).toFixed(2) + '万';
        }
        return t.toString();
    },
    

    
    /**
     * 清除缓存
     */
    clearCache() {
        this.cache = null;
        this.cacheTime = null;
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockService;
}
