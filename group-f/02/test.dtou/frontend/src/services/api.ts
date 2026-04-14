import type { 
  FundCompany, 
  FundIndustry, 
  IndustryDistributionDTO,
  CompanyProductDTO,
  StrategyAnalysisDTO,
  MarketGapDTO,
  BestPracticeDTO 
} from '../types';
import { 
  mockCompanies, 
  mockIndustries,
  getIndustryDistribution,
  getCompanyProducts,
  getCompanyStrategy,
  getMarketGaps,
  getBestPractices
} from './mockData';

// 模拟API响应
const mockResponse = <T>(data: T): Promise<{ data: T }> => 
  Promise.resolve({ data });

// 行业相关API
export const industryApi = {
  getAll: (level?: number) => 
    mockResponse(mockIndustries),
  
  getById: (id: number) => 
    mockResponse(mockIndustries.find(i => i.id === id)!),
  
  getDistribution: () => 
    mockResponse(getIndustryDistribution()),
};

// 公司相关API
export const companyApi = {
  getAll: () => 
    mockResponse(mockCompanies),
  
  getByCode: (code: string) => 
    mockResponse(mockCompanies.find(c => c.companyCode === code)!),
  
  getProducts: (code: string) => 
    mockResponse(getCompanyProducts(code)!),
  
  getStrategy: (code: string) => 
    mockResponse(getCompanyStrategy(code)!),
};

// 分析相关API
export const analysisApi = {
  getMarketGaps: () => 
    mockResponse(getMarketGaps()),
  
  getBestPractices: () => 
    mockResponse(getBestPractices()),
  
  analyzeCompany: (code: string) => 
    mockResponse({ success: true }),
};

// 同步相关API
export const syncApi = {
  syncAll: () => 
    mockResponse({ success: true, message: '同步完成' }),
  
  syncCompanies: () => 
    mockResponse({ success: true, message: '公司数据同步完成' }),
  
  syncProducts: () => 
    mockResponse({ success: true, message: '产品数据同步完成' }),
};

export default {};
