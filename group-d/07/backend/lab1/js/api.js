/**
 * 股票API模块
 * 封装东方财富公开API调用
 */

const StockAPI = {
    // 东方财富基础URL
    baseUrl: 'https://push2.eastmoney.com/api/qt/clist/get',
    
    /**
     * 使用JSONP方式获取数据（东方财富支持JSONP）
     * @param {string} url - 请求URL
     * @returns {Promise} - 返回Promise
     */
    jsonp(url, apiName = 'API') {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            const callbackName = 'stockCallback_' + Date.now();
            
            console.log(`[${apiName}] 请求URL:`, url);
            
            // 设置超时
            const timeout = setTimeout(() => {
                cleanup();
                console.error(`[${apiName}] 请求超时`);
                reject(new Error('请求超时'));
            }, 10000);
            
            // 清理函数
            const cleanup = () => {
                clearTimeout(timeout);
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
                delete window[callbackName];
            };
            
            // 回调函数
            window[callbackName] = (data) => {
                console.log(`[${apiName}] 返回数据:`, data);
                cleanup();
                resolve(data);
            };
            
            // 构建URL（东方财富使用cb参数）
            const separator = url.includes('?') ? '&' : '?';
            const fullUrl = `${url}${separator}cb=${callbackName}`;
            console.log(`[${apiName}] 完整URL:`, fullUrl);
            script.src = fullUrl;
            
            script.onerror = (e) => {
                console.error(`[${apiName}] 脚本加载失败:`, e);
                cleanup();
                reject(new Error('请求失败'));
            };
            
            document.head.appendChild(script);
        });
    },
    
    /**
     * 获取沪深A股涨幅榜
     * @param {number} pageSize - 每页数量
     * @returns {Promise} - 返回股票数据
     */
    async getStockList(pageSize = 100) {
        console.log('[股票API] 开始获取股票列表...');
        // 东方财富字段映射
        const fields = 'f12,f13,f14,f2,f3,f4,f5,f6,f7,f8,f9,f10,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152';
        // fs参数：m:0+t:6,m:0+t:13 深市A股；m:1+t:2,m:1+t:23 沪市A股
        const url = `${this.baseUrl}?pn=1&pz=${pageSize}&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:13,m:1+t:2,m:1+t:23&fields=${fields}`;
        
        try {
            const data = await this.jsonp(url, '股票API');
            console.log('[股票API] 数据解析结果:', data);
            const parsed = this.parseStockData(data);
            console.log('[股票API] 解析后股票数量:', parsed.length);
            return parsed;
        } catch (error) {
            console.error('[股票API] 获取股票列表失败:', error);
            throw error;
        }
    },
    
    /**
     * 获取行业板块涨幅榜
     * @param {number} pageSize - 每页数量
     * @returns {Promise} - 返回行业数据
     */
    async getSectorList(pageSize = 20) {
        console.log('[行业API] 开始获取行业列表...');
        // 东方财富字段映射
        const fields = 'f12,f13,f14,f2,f3,f4,f5,f6,f7,f8,f9,f10,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152';
        // fs=m:90+t:2 表示行业板块
        const url = `${this.baseUrl}?pn=1&pz=${pageSize}&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:90+t:2&fields=${fields}`;
        
        try {
            const data = await this.jsonp(url, '行业API');
            console.log('[行业API] 数据解析结果:', data);
            const parsed = this.parseSectorData(data);
            console.log('[行业API] 解析后行业数量:', parsed.length);
            return parsed;
        } catch (error) {
            console.error('[行业API] 获取行业列表失败:', error);
            throw error;
        }
    },
    
    /**
     * 获取概念板块涨幅榜
     * @param {number} pageSize - 每页数量
     * @returns {Promise} - 返回概念板块数据
     */
    async getConceptList(pageSize = 20) {
        const fields = 'f12,f13,f14,f2,f3,f4,f5,f6,f7,f8,f9,f10,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152';
        // fs=m:90+t:3 表示概念板块
        const url = `${this.baseUrl}?pn=1&pz=${pageSize}&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:90+t:3&fields=${fields}`;
        
        try {
            const data = await this.jsonp(url);
            return this.parseSectorData(data);
        } catch (error) {
            console.error('获取概念板块失败:', error);
            throw error;
        }
    },
    
    /**
     * 获取个股实时行情
     * @param {string} code - 股票代码
     * @param {string} market - 市场：1=沪市，0=深市
     * @returns {Promise} - 返回个股数据
     */
    async getStockQuote(code, market) {
        const secid = `${market}.${code}`;
        const fields = 'f43,f44,f45,f46,f47,f48,f57,f58,f60,f170,f169,f171,f50,f51,f52,f53,f54,f55,f56';
        const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=${fields}`;
        
        try {
            const data = await this.jsonp(url);
            return this.parseQuoteData(data);
        } catch (error) {
            console.error('获取个股行情失败:', error);
            throw error;
        }
    },
    
    /**
     * 解析股票列表数据
     * @param {Object} data - API返回数据
     * @returns {Array} - 解析后的股票数组
     */
    parseStockData(data) {
        if (!data || !data.data || !data.data.diff) {
            return [];
        }
        
        const stocks = [];
        const diff = data.data.diff;
        
        for (let key in diff) {
            const item = diff[key];
            // 过滤掉无效数据
            if (!item.f12 || item.f3 === '-' || item.f3 === null) continue;
            
            stocks.push({
                code: item.f12,          // 股票代码
                market: item.f13,        // 市场
                name: item.f14,          // 股票名称
                price: item.f2,          // 最新价
                changePercent: item.f3,  // 涨跌幅
                changeAmount: item.f4,   // 涨跌额
                volume: item.f5,         // 成交量
                turnover: item.f6,       // 成交额
                amplitude: item.f7,      // 振幅
                turnoverRate: item.f8,   // 换手率
                peRatio: item.f9,        // 市盈率
                volumeRatio: item.f10,   // 量比
                high: item.f15,          // 最高价
                low: item.f16,           // 最低价
                open: item.f17,          // 开盘价
                preClose: item.f18,      // 昨收
                totalValue: item.f20,    // 总市值
                floatValue: item.f21,    // 流通市值
                pbRatio: item.f23,       // 市净率
                riseSpeed: item.f22,     // 涨速
                mainForce: item.f62,     // 主力资金净流入
                leadingStock: item.f128, // 领涨股
                leadingChange: item.f136 // 领涨股涨幅
            });
        }
        
        return stocks;
    },
    
    /**
     * 解析行业/概念板块数据
     * @param {Object} data - API返回数据
     * @returns {Array} - 解析后的行业数组
     */
    parseSectorData(data) {
        if (!data || !data.data || !data.data.diff) {
            return [];
        }
        
        const sectors = [];
        const diff = data.data.diff;
        
        for (let key in diff) {
            const item = diff[key];
            // 过滤掉无效数据
            if (!item.f12 || item.f3 === '-' || item.f3 === null) continue;
            
            sectors.push({
                code: item.f12,          // 板块代码
                market: item.f13,        // 市场
                name: item.f14,          // 板块名称
                price: item.f2,          // 指数
                changePercent: item.f3,  // 涨跌幅
                changeAmount: item.f4,   // 涨跌额
                volume: item.f5,         // 成交量
                turnover: item.f6,       // 成交额
                amplitude: item.f7,      // 振幅
                turnoverRate: item.f8,   // 换手率
                peRatio: item.f9,        // 市盈率
                volumeRatio: item.f10,   // 量比
                preClose: item.f18,      // 昨收
                totalValue: item.f20,    // 总市值
                floatValue: item.f21,    // 流通市值
                mainForce: item.f62,     // 主力资金净流入
                leadingStock: item.f128, // 领涨股
                leadingStockChange: item.f136 // 领涨股涨幅
            });
        }
        
        return sectors;
    },
    
    /**
     * 解析个股行情数据
     * @param {Object} data - API返回数据
     * @returns {Object} - 解析后的个股数据
     */
    parseQuoteData(data) {
        if (!data || !data.data) {
            return null;
        }
        
        const item = data.data;
        return {
            code: item.f57,          // 股票代码
            name: item.f58,          // 股票名称
            price: item.f43,         // 最新价
            changePercent: item.f170, // 涨跌幅
            changeAmount: item.f169,  // 涨跌额
            volume: item.f47,         // 成交量
            turnover: item.f48,       // 成交额
            open: item.f46,           // 开盘价
            high: item.f44,           // 最高价
            low: item.f45,            // 最低价
            preClose: item.f60,       // 昨收
            bid1: item.f50,           // 买一价
            bid1Volume: item.f51,     // 买一量
            ask1: item.f52,           // 卖一价
            ask1Volume: item.f53,     // 卖一量
            bid2: item.f54,           // 买二价
            bid2Volume: item.f55,     // 买二量
            ask2: item.f56,           // 卖二价
            ask2Volume: item.f57      // 卖二量
        };
    }
};

// 导出API模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockAPI;
}
