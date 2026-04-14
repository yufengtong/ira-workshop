/**
 * 基金对比组件
 * 展示多只基金的详细对比信息
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Shield } from 'lucide-react';
import type { FundDetail } from '../api/fundApi';

interface FundComparisonProps {
  funds: FundDetail[];
}

// 颜色配置
const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

export const FundComparison: React.FC<FundComparisonProps> = ({ funds }) => {
  if (funds.length < 2) {
    return (
      <div className="text-center py-12 text-gray-500">
        请至少选择 2 只基金进行对比
      </div>
    );
  }

  // 准备历史净值对比数据
  const prepareHistoryData = () => {
    if (funds.length === 0 || funds[0].history.length === 0) return [];

    // 取最近 30 天的数据
    const days = 30;
    const data = [];
    const fund0History = funds[0].history.slice(-days);

    for (let i = 0; i < fund0History.length; i++) {
      const point: any = {
        date: fund0History[i].date.slice(5), // 只显示月-日
      };

      funds.forEach((fund, index) => {
        const fundHistory = fund.history.slice(-days);
        if (fundHistory[i]) {
          // 归一化处理，以第一天为基准
          const baseValue = fundHistory[0].nav;
          point[`fund${index}`] = Number(
            ((fundHistory[i].nav / baseValue - 1) * 100).toFixed(2)
          );
        }
      });

      data.push(point);
    }

    return data;
  };

  // 准备业绩对比数据
  const preparePerformanceData = () => {
    return [
      { name: '近1月', ...funds.reduce((acc, fund, i) => ({ ...acc, [`fund${i}`]: fund.performance.return_1m }), {}) },
      { name: '近3月', ...funds.reduce((acc, fund, i) => ({ ...acc, [`fund${i}`]: fund.performance.return_3m }), {}) },
      { name: '近6月', ...funds.reduce((acc, fund, i) => ({ ...acc, [`fund${i}`]: fund.performance.return_6m }), {}) },
      { name: '近1年', ...funds.reduce((acc, fund, i) => ({ ...acc, [`fund${i}`]: fund.performance.return_1y }), {}) },
      { name: '近3年', ...funds.reduce((acc, fund, i) => ({ ...acc, [`fund${i}`]: fund.performance.return_3y }), {}) },
    ];
  };

  // 准备风险雷达图数据
  const prepareRiskData = () => {
    return funds.map((fund, index) => ({
      subject: fund.info.name.slice(0, 8),
      A: Math.abs(fund.performance.volatility),
      B: Math.abs(fund.risk.beta) * 10,
      C: Math.abs(fund.risk.standard_deviation),
      D: Math.abs(fund.performance.max_drawdown),
      E: fund.performance.sharpe_ratio * 10,
      fullMark: 100,
    }));
  };

  const historyData = prepareHistoryData();
  const performanceData = preparePerformanceData();

  // 格式化百分比
  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // 获取颜色类
  const getColorClass = (value: number) => {
    return value >= 0 ? 'text-red-500' : 'text-green-500';
  };

  return (
    <div className="space-y-8">
      {/* 基金基本信息对比表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">基本信息对比</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">对比项</th>
                {funds.map((fund, index) => (
                  <th
                    key={fund.info.code}
                    className="px-6 py-3 text-left text-sm font-medium"
                    style={{ color: COLORS[index] }}
                  >
                    {fund.info.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-600">基金代码</td>
                {funds.map((fund) => (
                  <td key={fund.info.code} className="px-6 py-4 text-sm font-medium">
                    {fund.info.code}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-600">基金类型</td>
                {funds.map((fund) => (
                  <td key={fund.info.code} className="px-6 py-4 text-sm">
                    {fund.info.type}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-600">基金经理</td>
                {funds.map((fund) => (
                  <td key={fund.info.code} className="px-6 py-4 text-sm">
                    {fund.info.manager}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-600">基金公司</td>
                {funds.map((fund) => (
                  <td key={fund.info.code} className="px-6 py-4 text-sm">
                    {fund.info.company}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-600">成立日期</td>
                {funds.map((fund) => (
                  <td key={fund.info.code} className="px-6 py-4 text-sm">
                    {fund.info.establishment_date}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-600">最新净值</td>
                {funds.map((fund) => (
                  <td key={fund.info.code} className="px-6 py-4 text-sm font-semibold">
                    {fund.info.net_value.toFixed(4)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-600">资产规模(亿)</td>
                {funds.map((fund) => (
                  <td key={fund.info.code} className="px-6 py-4 text-sm">
                    {fund.info.total_assets.toFixed(2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 业绩表现对比 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp size={20} />
            业绩表现对比
          </h3>
        </div>
        <div className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                <Legend />
                {funds.map((fund, index) => (
                  <Bar
                    key={fund.info.code}
                    dataKey={`fund${index}`}
                    name={fund.info.name.slice(0, 10)}
                    fill={COLORS[index]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">收益率</th>
                {funds.map((fund, index) => (
                  <th
                    key={fund.info.code}
                    className="px-6 py-3 text-left text-sm font-medium"
                    style={{ color: COLORS[index] }}
                  >
                    {fund.info.name.slice(0, 10)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { label: '近1月', key: 'return_1m' },
                { label: '近3月', key: 'return_3m' },
                { label: '近6月', key: 'return_6m' },
                { label: '近1年', key: 'return_1y' },
                { label: '近3年', key: 'return_3y' },
                { label: '成立以来', key: 'return_since_inception' },
                { label: '年化收益', key: 'annualized_return' },
              ].map((item) => (
                <tr key={item.key}>
                  <td className="px-6 py-3 text-sm text-gray-600">{item.label}</td>
                  {funds.map((fund) => {
                    const value = fund.performance[item.key as keyof typeof fund.performance] as number;
                    return (
                      <td
                        key={fund.info.code}
                        className={`px-6 py-3 text-sm font-medium ${getColorClass(value)}`}
                      >
                        {formatPercent(value)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 历史净值走势 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Activity size={20} />
            近30天净值走势对比
          </h3>
        </div>
        <div className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                <Legend />
                {funds.map((fund, index) => (
                  <Line
                    key={fund.info.code}
                    type="monotone"
                    dataKey={`fund${index}`}
                    name={fund.info.name.slice(0, 10)}
                    stroke={COLORS[index]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 风险指标对比 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Shield size={20} />
            风险指标对比
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">风险指标</th>
                {funds.map((fund, index) => (
                  <th
                    key={fund.info.code}
                    className="px-6 py-3 text-left text-sm font-medium"
                    style={{ color: COLORS[index] }}
                  >
                    {fund.info.name.slice(0, 10)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-600">风险等级</td>
                {funds.map((fund) => (
                  <td key={fund.info.code} className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        fund.risk.risk_level.includes('低')
                          ? 'bg-green-100 text-green-700'
                          : fund.risk.risk_level.includes('中')
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {fund.risk.risk_level}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-600">最大回撤</td>
                {funds.map((fund) => (
                  <td
                    key={fund.info.code}
                    className="px-6 py-4 text-sm text-green-600 font-medium"
                  >
                    {fund.performance.max_drawdown.toFixed(2)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-600">夏普比率</td>
                {funds.map((fund) => (
                  <td key={fund.info.code} className="px-6 py-4 text-sm">
                    {fund.performance.sharpe_ratio.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-600">波动率</td>
                {funds.map((fund) => (
                  <td key={fund.info.code} className="px-6 py-4 text-sm">
                    {fund.performance.volatility.toFixed(2)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-600">Alpha</td>
                {funds.map((fund) => (
                  <td key={fund.info.code} className="px-6 py-4 text-sm">
                    {fund.risk.alpha.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-600">Beta</td>
                {funds.map((fund) => (
                  <td key={fund.info.code} className="px-6 py-4 text-sm">
                    {fund.risk.beta.toFixed(2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
