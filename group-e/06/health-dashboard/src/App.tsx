import { useState, useEffect, useCallback } from 'react';
import { JourneyHealth, StepHealth } from './types';
import { JourneyFlow } from './components/JourneyFlow';
import { OverallStatus } from './components/OverallStatus';
import {
  businessSteps,
  healthThresholds,
  generateMockMetrics,
  calculateStepStatus,
  detectBrokenStep,
  calculateOverallStatus,
} from './data/mockData';

function App() {
  const [journeyHealth, setJourneyHealth] = useState<JourneyHealth | null>(null);

  const updateHealthData = useCallback(() => {
    // 为每个步骤生成指标数据
    const stepsHealth: StepHealth[] = businessSteps.map((step) => {
      const metrics = generateMockMetrics(step.id);
      const status = calculateStepStatus(metrics, healthThresholds);
      return {
        step,
        metrics,
        status,
        isBroken: false, // 临时值，后面会更新
      };
    });

    // 检测链路断裂
    const brokenStepId = detectBrokenStep(stepsHealth);

    // 更新 isBroken 标记
    const updatedStepsHealth = stepsHealth.map((stepHealth) => ({
      ...stepHealth,
      isBroken: stepHealth.step.id === brokenStepId,
    }));

    // 计算整体状态
    const overallStatus = calculateOverallStatus(
      updatedStepsHealth.map((s) => s.status)
    );

    setJourneyHealth({
      steps: updatedStepsHealth,
      overallStatus,
      brokenStepId,
      lastUpdated: new Date(),
    });
  }, []);

  // 初始加载和定时刷新
  useEffect(() => {
    updateHealthData();
    const interval = setInterval(updateHealthData, 5000); // 每5秒刷新一次
    return () => clearInterval(interval);
  }, [updateHealthData]);

  if (!journeyHealth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            业务场景健康度监控看板
          </h1>
          <p className="text-gray-400">
            实时监控用户关键业务流程的健康状态
          </p>
        </div>

        {/* 整体状态 */}
        <OverallStatus journeyHealth={journeyHealth} />

        {/* 用户旅程流程 */}
        <div className="bg-gray-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            用户旅程流程
          </h3>
          <JourneyFlow journeyHealth={journeyHealth} />
        </div>

        {/* 图例说明 */}
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>健康 (通过率≥90%, 响应时间≤500ms)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>警告 (通过率70-90%, 响应时间500-1000ms)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>严重 (通过率&lt;70%, 响应时间&gt;1000ms)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
