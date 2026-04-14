/**
 * 行业数据逻辑模块
 * 处理行业板块数据的获取、排序和格式化
 */

const SectorService = {
    // 缓存数据
    cache: null,
    cacheTime: null,
    cacheDuration: 5000, // 缓存5秒
    
    /**
     * 获取涨幅最好的行业
     * @param {number} count - 获取数量，默认5
     * @returns {Promise<Array>} - 返回排序后的行业数组
     */
    async getTopSectors(count = 5) {
        try {
            // 检查缓存
            if (this.cache && this.cacheTime && 
                (Date.now() - this.cacheTime) < this.cacheDuration) {
                return this.sortAndLimit(this.cache, count);
            }
            
            // 获取行业列表
            const sectors = await StockAPI.getSectorList(20);
            
            // 更新缓存
            this.cache = sectors;
            this.cacheTime = Date.now();
            
            return this.sortAndLimit(sectors, count);
        } catch (error) {
            console.error('获取涨幅行业失败:', error);
            throw error;
        }
    },
    
    /**
     * 排序并限制数量
     * @param {Array} sectors - 行业数组
     * @param {number} count - 限制数量
     * @returns {Array} - 处理后的数组
     */
    sortAndLimit(sectors, count) {
        // 过滤掉无效数据
        const validSectors = sectors.filter(sector => 
            sector.changePercent !== null && 
            sector.changePercent !== undefined &&
            sector.changePercent !== '-'
        );
        
        // 按涨跌幅降序排序
        const sorted = validSectors.sort((a, b) => b.changePercent - a.changePercent);
        
        // 取前count个
        return sorted.slice(0, count).map(sector => this.formatSector(sector));
    },
    
    /**
     * 格式化行业数据
     * @param {Object} sector - 原始行业数据
     * @returns {Object} - 格式化后的数据
     */
    formatSector(sector) {
        return {
            code: sector.code,
            name: sector.name,
            index: this.formatPrice(sector.price),
            changePercent: this.formatPercent(sector.changePercent),
            changeAmount: this.formatPrice(sector.changeAmount),
            volume: this.formatVolume(sector.volume),
            turnover: this.formatTurnover(sector.turnover),
            turnoverRate: this.formatPercent(sector.turnoverRate),
            leadingStock: sector.leadingStock || '-',
            leadingStockChange: this.formatPercent(sector.leadingStockChange),
            // 用于判断涨跌状态
            isUp: sector.changePercent > 0,
            isDown: sector.changePercent < 0,
            isFlat: sector.changePercent === 0
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
    module.exports = SectorService;
}
