/**
 * 基金选择器组件
 * 用于搜索和选择要对比的基金
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Plus, TrendingUp } from 'lucide-react';
import { fundApi, type FundInfo } from '../api/fundApi';

interface FundSelectorProps {
  selectedFunds: FundInfo[];
  onSelectFund: (fund: FundInfo) => void;
  onRemoveFund: (fundCode: string) => void;
  maxFunds?: number;
}

export const FundSelector: React.FC<FundSelectorProps> = ({
  selectedFunds,
  onSelectFund,
  onRemoveFund,
  maxFunds = 2,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<FundInfo[]>([]);
  const [popularFunds, setPopularFunds] = useState<FundInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // 加载热门基金
  useEffect(() => {
    const loadPopularFunds = async () => {
      try {
        const funds = await fundApi.getPopularFunds();
        setPopularFunds(funds.slice(0, 6));
      } catch (error) {
        console.error('加载热门基金失败:', error);
      }
    };
    loadPopularFunds();
  }, []);

  // 搜索基金
  const handleSearch = useCallback(async () => {
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await fundApi.searchFunds(searchKeyword);
      // 过滤已选择的基金
      const filtered = results.filter(
        (f) => !selectedFunds.some((sf) => sf.code === f.code)
      );
      setSearchResults(filtered);
      setShowResults(true);
    } catch (error) {
      console.error('搜索基金失败:', error);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, selectedFunds]);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchKeyword, handleSearch]);

  const handleSelectFund = (fund: FundInfo) => {
    if (selectedFunds.length >= maxFunds) {
      alert(`最多只能选择 ${maxFunds} 只基金进行对比`);
      return;
    }
    onSelectFund(fund);
    setSearchKeyword('');
    setSearchResults([]);
    setShowResults(false);
  };

  // 获取风险等级颜色
  const getRiskColor = (riskLevel: string) => {
    if (riskLevel.includes('低')) return 'text-green-600 bg-green-50';
    if (riskLevel.includes('中')) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="w-full">
      {/* 已选择的基金 */}
      {selectedFunds.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            已选择基金 ({selectedFunds.length}/{maxFunds})
          </h3>
          <div className="flex flex-wrap gap-3">
            {selectedFunds.map((fund) => (
              <div
                key={fund.code}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-blue-900">{fund.name}</span>
                  <span className="text-xs text-blue-600">{fund.code}</span>
                </div>
                <button
                  onClick={() => onRemoveFund(fund.code)}
                  className="ml-2 p-1 hover:bg-blue-100 rounded-full transition-colors"
                >
                  <X size={16} className="text-blue-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 搜索框 */}
      {selectedFunds.length < maxFunds && (
        <div className="relative mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索基金代码或名称..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* 搜索结果下拉框 */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {searchResults.map((fund) => (
                <button
                  key={fund.code}
                  onClick={() => handleSelectFund(fund)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-gray-900">{fund.name}</div>
                    <div className="text-sm text-gray-500">
                      {fund.code} · {fund.type} · {fund.company}
                    </div>
                  </div>
                  <Plus size={20} className="text-blue-500" />
                </button>
              ))}
            </div>
          )}

          {showResults && searchKeyword && searchResults.length === 0 && !loading && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
              未找到相关基金
            </div>
          )}
        </div>
      )}

      {/* 热门基金推荐 */}
      {selectedFunds.length < maxFunds && popularFunds.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp size={16} />
            热门基金推荐
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {popularFunds
              .filter((f) => !selectedFunds.some((sf) => sf.code === f.code))
              .map((fund) => (
                <button
                  key={fund.code}
                  onClick={() => handleSelectFund(fund)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all text-left"
                >
                  <div className="font-medium text-gray-900 mb-1">{fund.name}</div>
                  <div className="text-sm text-gray-500 mb-2">
                    {fund.code} · {fund.type}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{fund.company}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getRiskColor(
                        ''
                      )}`}
                    >
                      净值: {fund.net_value.toFixed(4)}
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
