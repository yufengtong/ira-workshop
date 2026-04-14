/**
 * Mock数据服务 - 从Tushare API获取的真实数据
 * 用于在没有Java后端的情况下演示前端功能
 */

import type { 
  FundCompany, 
  FundIndustry, 
  IndustryDistributionDTO,
  CompanyProductDTO,
  StrategyAnalysisDTO,
  MarketGapDTO,
  BestPracticeDTO 
} from '../types';

// 从Tushare API获取的真实基金公司数据（前30家）
export const mockCompanies: FundCompany[] = [
  { id: 1, companyCode: '584419680', companyName: '北京广能投资基金管理有限公司', shortName: '广能基金', establishDate: '20111031', totalAsset: 0, productCount: 0, strategyType: 'balanced', strategyDesc: '北京广能投资基金管理有限公司战略布局' },
  { id: 2, companyCode: '228593068', companyName: '宏源证券股份有限公司', shortName: '宏源证券', establishDate: '19930525', totalAsset: 0, productCount: 0, strategyType: 'focused', strategyDesc: '宏源证券股份有限公司战略布局' },
  { id: 3, companyCode: '731686376', companyName: '国元证券股份有限公司', shortName: '国元证券', establishDate: '19970606', totalAsset: 0, productCount: 0, strategyType: 'aggressive', strategyDesc: '国元证券股份有限公司战略布局' },
  { id: 4, companyCode: '126335439', companyName: '广发证券股份有限公司', shortName: '广发证券', establishDate: '19940121', totalAsset: 0, productCount: 0, strategyType: 'conservative', strategyDesc: '广发证券股份有限公司战略布局' },
  { id: 5, companyCode: '700821272', companyName: '长江证券股份有限公司', shortName: '长江证券', establishDate: '19970724', totalAsset: 0, productCount: 0, strategyType: 'balanced', strategyDesc: '长江证券股份有限公司战略布局' },
  { id: 6, companyCode: '13221158X', companyName: '上海浦东发展银行股份有限公司', shortName: '浦发银行', establishDate: '19921019', totalAsset: 0, productCount: 0, strategyType: 'focused', strategyDesc: '上海浦东发展银行股份有限公司战略布局' },
  { id: 7, companyCode: '707099649', companyName: '东方金钰股份有限公司', shortName: '东方金钰', establishDate: '19930713', totalAsset: 0, productCount: 0, strategyType: 'aggressive', strategyDesc: '东方金钰股份有限公司战略布局' },
  { id: 8, companyCode: '201961940', companyName: '国金证券股份有限公司', shortName: '国金证券', establishDate: '19961220', totalAsset: 0, productCount: 0, strategyType: 'conservative', strategyDesc: '国金证券股份有限公司战略布局' },
  { id: 9, companyCode: '631137003', companyName: '绿地控股集团股份有限公司', shortName: '绿地控股', establishDate: '19920708', totalAsset: 0, productCount: 0, strategyType: 'balanced', strategyDesc: '绿地控股集团股份有限公司战略布局' },
  { id: 10, companyCode: '13220921X', companyName: '海通证券股份有限公司', shortName: '海通证券', establishDate: '19930202', totalAsset: 0, productCount: 0, strategyType: 'focused', strategyDesc: '海通证券股份有限公司战略布局' },
  { id: 11, companyCode: '100018988', companyName: '中国民生银行股份有限公司', shortName: '民生银行', establishDate: '19960207', totalAsset: 0, productCount: 0, strategyType: 'aggressive', strategyDesc: '中国民生银行股份有限公司战略布局' },
  { id: 12, companyCode: '279434913', companyName: '华泰联合证券有限责任公司', shortName: '华泰联合证券', establishDate: '19970905', totalAsset: 0, productCount: 0, strategyType: 'conservative', strategyDesc: '华泰联合证券有限责任公司战略布局' },
  { id: 13, companyCode: '192278444', companyName: '国信证券股份有限公司', shortName: '国信证券', establishDate: '19940630', totalAsset: 0, productCount: 0, strategyType: 'balanced', strategyDesc: '国信证券股份有限公司战略布局' },
  { id: 14, companyCode: '704041011', companyName: '华泰证券股份有限公司', shortName: '华泰证券', establishDate: '19910409', totalAsset: 0, productCount: 0, strategyType: 'focused', strategyDesc: '华泰证券股份有限公司战略布局' },
  { id: 15, companyCode: '192431912', companyName: '长城证券有限责任公司', shortName: '长城证券', establishDate: '19960502', totalAsset: 0, productCount: 0, strategyType: 'aggressive', strategyDesc: '长城证券有限责任公司战略布局' },
];

// 行业数据
export const mockIndustries: FundIndustry[] = [
  { id: 1, industryCode: 'I01', industryName: '股票型', parentCode: '', level: 1, description: '主要投资于股票市场', sortOrder: 0 },
  { id: 2, industryCode: 'I02', industryName: '债券型', parentCode: '', level: 1, description: '主要投资于债券市场', sortOrder: 0 },
  { id: 3, industryCode: 'I03', industryName: '混合型', parentCode: '', level: 1, description: '股票和债券混合投资', sortOrder: 0 },
  { id: 4, industryCode: 'I04', industryName: '货币型', parentCode: '', level: 1, description: '投资于货币市场工具', sortOrder: 0 },
  { id: 5, industryCode: 'I05', industryName: '指数型', parentCode: '', level: 1, description: '跟踪特定指数表现', sortOrder: 0 },
  { id: 6, industryCode: 'I06', industryName: 'QDII', parentCode: '', level: 1, description: '投资境外市场', sortOrder: 0 },
  { id: 7, industryCode: 'I07', industryName: 'FOF', parentCode: '', level: 1, description: '投资基金的基金', sortOrder: 0 },
  { id: 8, industryCode: 'I08', industryName: 'REITs', parentCode: '', level: 1, description: '不动产投资信托', sortOrder: 0 },
  { id: 9, industryCode: 'I09', industryName: '商品型', parentCode: '', level: 1, description: '投资大宗商品', sortOrder: 0 },
  { id: 10, industryCode: 'I10', industryName: '养老目标', parentCode: '', level: 1, description: '养老目标基金', sortOrder: 0 },
];

// 从Tushare API获取的真实基金产品数据（前50只）
export const mockProducts = [
  { tsCode: '520790.SH', name: '港股通互联网ETF兴业', companyName: '兴业基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '159160.SZ', name: '电池ETF东财', companyName: '东财基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '520680.SH', name: 'N港股通汽车ETF南方', companyName: '南方基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '159190.SZ', name: '创业板新能源ETF天弘', companyName: '天弘基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '159191.SZ', name: '港股通科技ETF易方达', companyName: '易方达基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '159183.SZ', name: '新能源车ETF招商', companyName: '招商基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '560210.SH', name: '农牧渔ETF景顺', companyName: '景顺长城基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '159170.SZ', name: '港股通互联网ETF永赢', companyName: '永赢基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '159172.SZ', name: '养殖ETF汇添富', companyName: '汇添富基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '159166.SZ', name: '现金流ETF长城', companyName: '长城基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '520720.SH', name: '科创芯片ETF南方', companyName: '南方基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '159179.SZ', name: '创业板人工智能ETF华宝', companyName: '华宝基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '520550.SH', name: '科创200ETF华泰柏瑞', companyName: '华泰柏瑞基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '159178.SZ', name: '创业板新能源ETF华夏', companyName: '华夏基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '520560.SH', name: '科创100ETF南方', companyName: '南方基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '560360.SH', name: '半导体设备ETF博时', companyName: '博时基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '159182.SZ', name: '创业板50ETF富国', companyName: '富国基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '159177.SZ', name: '创业板人工智能ETF易方达', companyName: '易方达基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '159176.SZ', name: '创业板人工智能ETF华夏', companyName: '华夏基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
  { tsCode: '520580.SH', name: '科创综指ETF天弘', companyName: '天弘基金', fundType: '股票型', industryCode: 'I01', industryName: '股票型', status: '运作中', asset: 0, establishDate: '20260319' },
];

// 计算行业分布
export function getIndustryDistribution(): IndustryDistributionDTO[] {
  const distribution: IndustryDistributionDTO[] = [];
  
  for (const industry of mockIndustries) {
    const products = mockProducts.filter(p => p.industryCode === industry.industryCode);
    const companies = new Set(products.map(p => p.companyName));
    
    distribution.push({
      industryCode: industry.industryCode,
      industryName: industry.industryName,
      productCount: products.length,
      totalAsset: products.reduce((sum, p) => sum + (p.asset || 0), 0),
      companyCount: companies.size,
      marketShare: 0
    });
  }
  
  // 计算市场份额
  const total = distribution.reduce((sum, d) => sum + d.productCount, 0);
  if (total > 0) {
    distribution.forEach(d => {
      d.marketShare = Math.round((d.productCount / total) * 100 * 100) / 100;
    });
  }
  
  return distribution.sort((a, b) => b.productCount - a.productCount);
}

// 获取公司产品
export function getCompanyProducts(companyCode: string): CompanyProductDTO | null {
  const company = mockCompanies.find(c => c.companyCode === companyCode);
  if (!company) return null;
  
  const products = mockProducts.filter(p => p.companyName === company.companyName);
  const operating = products.filter(p => p.status === '运作中').length;
  const pending = products.filter(p => p.status === '待发售').length;
  const reporting = products.filter(p => p.status === '上报中').length;
  
  // 行业分布
  const industryDist: Record<string, number> = {};
  products.forEach(p => {
    industryDist[p.industryName] = (industryDist[p.industryName] || 0) + 1;
  });
  
  return {
    companyCode: company.companyCode,
    companyName: company.companyName,
    totalProducts: products.length,
    operatingCount: operating,
    pendingCount: pending,
    reportingCount: reporting,
    totalAsset: company.totalAsset,
    strategyType: company.strategyType,
    strategyDesc: company.strategyDesc,
    products: products.map(p => ({
      tsCode: p.tsCode,
      name: p.name,
      fundType: p.fundType,
      industryName: p.industryName,
      status: p.status,
      statusDesc: p.status,
      asset: p.asset,
      establishDate: p.establishDate
    })),
    industryDistribution: industryDist
  };
}

// 获取公司战略
export function getCompanyStrategy(companyCode: string): StrategyAnalysisDTO | null {
  const company = mockCompanies.find(c => c.companyCode === companyCode);
  if (!company) return null;
  
  const strategyNames: Record<string, string> = {
    balanced: '均衡型',
    focused: '聚焦型',
    aggressive: '激进型',
    conservative: '保守型'
  };
  
  return {
    companyCode: company.companyCode,
    companyName: company.companyName,
    strategyType: company.strategyType,
    strategyName: strategyNames[company.strategyType] || '均衡型',
    concentrationScore: 65.5,
    diversificationScore: 70.0,
    innovationScore: 68.0,
    analysisDesc: `${company.companyName}采用${strategyNames[company.strategyType] || '均衡型'}战略，在市场中具有独特的竞争优势。`,
    strengthIndustries: ['股票型', '混合型'],
    weaknessIndustries: ['QDII', 'FOF'],
    opportunities: ['养老目标', 'REITs']
  };
}

// 获取市场空白点
export function getMarketGaps(): MarketGapDTO[] {
  const gaps: MarketGapDTO[] = [];
  
  for (const industry of mockIndustries) {
    const products = mockProducts.filter(p => p.industryCode === industry.industryCode);
    const current = products.length;
    const potential = Math.max(0, 20 - current);
    const score = Math.min(100, potential * 10);
    
    if (score > 30) {
      gaps.push({
        industryCode: industry.industryCode,
        industryName: industry.industryName,
        currentProducts: current,
        potentialDemand: potential,
        opportunityScore: Math.round(score * 100) / 100,
        recommendation: score > 70 ? '高机会领域，建议重点布局' : 
                       score > 50 ? '中等机会，可关注' : '机会有限，谨慎进入'
      });
    }
  }
  
  return gaps.sort((a, b) => b.opportunityScore - a.opportunityScore);
}

// 获取优秀案例
export function getBestPractices(): BestPracticeDTO[] {
  const practices: BestPracticeDTO[] = [];
  
  for (let i = 0; i < Math.min(10, mockCompanies.length); i++) {
    const company = mockCompanies[i];
    const highlights: Record<string, string> = {
      balanced: '产品线完整，覆盖主流领域',
      focused: '深耕细分领域，形成差异化优势',
      aggressive: '积极扩张，快速布局新兴领域',
      conservative: '稳健经营，注重风险控制'
    };
    
    practices.push({
      companyCode: company.companyCode,
      companyName: company.companyName,
      strategyType: company.strategyType,
      highlight: highlights[company.strategyType] || '稳健发展',
      performanceScore: Math.round((80 - i * 3) * 100) / 100,
      keyStrengths: ['股票型', '混合型', '债券型'].slice(0, 3 - i % 3) || ['股票型'],
      learnings: `${company.companyName}在战略布局上值得借鉴，其${highlights[company.strategyType]}的策略形成了独特的竞争优势。`
    });
  }
  
  return practices.sort((a, b) => b.performanceScore - a.performanceScore);
}
