// 基金公司
export interface FundCompany {
  id: number;
  companyCode: string;
  companyName: string;
  shortName: string;
  establishDate: string;
  totalAsset: number;
  productCount: number;
  strategyType: string;
  strategyDesc: string;
}

// 基金产品
export interface FundProduct {
  id: number;
  tsCode: string;
  name: string;
  shortName: string;
  companyCode: string;
  companyName: string;
  fundType: string;
  investType: string;
  industryCode: string;
  industryName: string;
  status: string;
  asset: number;
  establishDate: string;
}

// 行业分类
export interface FundIndustry {
  id: number;
  industryCode: string;
  industryName: string;
  parentCode: string;
  level: number;
  description: string;
  sortOrder: number;
}

// 行业分布DTO
export interface IndustryDistributionDTO {
  industryCode: string;
  industryName: string;
  productCount: number;
  totalAsset: number;
  companyCount: number;
  marketShare: number;
}

// 产品详情DTO
export interface ProductDetailDTO {
  tsCode: string;
  name: string;
  fundType: string;
  industryName: string;
  status: string;
  statusDesc: string;
  asset: number;
  establishDate: string;
}

// 公司产品DTO
export interface CompanyProductDTO {
  companyCode: string;
  companyName: string;
  totalProducts: number;
  operatingCount: number;
  pendingCount: number;
  reportingCount: number;
  totalAsset: number;
  strategyType: string;
  strategyDesc: string;
  products: ProductDetailDTO[];
  industryDistribution: Record<string, number>;
}

// 战略分析DTO
export interface StrategyAnalysisDTO {
  companyCode: string;
  companyName: string;
  strategyType: string;
  strategyName: string;
  concentrationScore: number;
  diversificationScore: number;
  innovationScore: number;
  analysisDesc: string;
  strengthIndustries: string[];
  weaknessIndustries: string[];
  opportunities: string[];
}

// 市场空白点DTO
export interface MarketGapDTO {
  industryCode: string;
  industryName: string;
  currentProducts: number;
  potentialDemand: number;
  opportunityScore: number;
  recommendation: string;
}

// 最佳实践DTO
export interface BestPracticeDTO {
  companyCode: string;
  companyName: string;
  strategyType: string;
  highlight: string;
  performanceScore: number;
  keyStrengths: string[];
  learnings: string;
}

// API响应
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
