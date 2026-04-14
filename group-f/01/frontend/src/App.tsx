import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { FundSelector } from './components/FundSelector'
import { FundComparison } from './components/FundComparison'
import type { FundInfo, FundDetail } from './api/fundApi'
import { fundApi } from './api/fundApi'
import './App.css'

function App() {
  const [selectedFunds, setSelectedFunds] = useState<FundInfo[]>([])
  const [fundDetails, setFundDetails] = useState<FundDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelectFund = (fund: FundInfo) => {
    if (selectedFunds.length >= 2) {
      alert('最多只能选择 2 只基金进行对比')
      return
    }
    setSelectedFunds([...selectedFunds, fund])
    setFundDetails([]) // 清空之前的对比结果
  }

  const handleRemoveFund = (fundCode: string) => {
    setSelectedFunds(selectedFunds.filter((f) => f.code !== fundCode))
    setFundDetails([])
  }

  const handleCompare = async () => {
    if (selectedFunds.length < 2) {
      alert('请至少选择 2 只基金进行对比')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const fundCodes = selectedFunds.map((f) => f.code)
      const response = await fundApi.compareFunds(fundCodes)
      setFundDetails(response.funds)
    } catch (err) {
      setError('获取基金对比数据失败，请稍后重试')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <BarChart3 size={32} className="text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">基金对比工具</h1>
              <p className="text-sm text-gray-500">选择基金进行多维度对比分析</p>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 基金选择区域 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">选择要对比的基金</h2>
          <FundSelector
            selectedFunds={selectedFunds}
            onSelectFund={handleSelectFund}
            onRemoveFund={handleRemoveFund}
            maxFunds={2}
          />

          {/* 对比按钮 */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleCompare}
              disabled={selectedFunds.length < 2 || loading}
              className={`px-8 py-3 rounded-lg font-medium transition-all ${
                selectedFunds.length >= 2 && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  加载中...
                </span>
              ) : (
                '开始对比'
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
              {error}
            </div>
          )}
        </div>

        {/* 对比结果区域 */}
        {fundDetails.length > 0 && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">对比结果</h2>
              <span className="text-sm text-gray-500">
                对比时间: {new Date().toLocaleString()}
              </span>
            </div>
            <FundComparison funds={fundDetails} />
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            基金对比工具 © 2026 | 数据仅供参考，投资有风险
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
