import { create } from 'zustand';
import type { FundCompany, FundIndustry, IndustryDistributionDTO } from '../types';

interface AppState {
  // 公司数据
  companies: FundCompany[];
  selectedCompany: FundCompany | null;
  setCompanies: (companies: FundCompany[]) => void;
  setSelectedCompany: (company: FundCompany | null) => void;
  
  // 行业数据
  industries: FundIndustry[];
  industryDistribution: IndustryDistributionDTO[];
  setIndustries: (industries: FundIndustry[]) => void;
  setIndustryDistribution: (distribution: IndustryDistributionDTO[]) => void;
  
  // 加载状态
  loading: boolean;
  setLoading: (loading: boolean) => void;
  
  // 刷新数据
  refreshData: () => void;
  lastRefresh: number;
}

export const useAppStore = create<AppState>((set) => ({
  companies: [],
  selectedCompany: null,
  setCompanies: (companies) => set({ companies }),
  setSelectedCompany: (company) => set({ selectedCompany: company }),
  
  industries: [],
  industryDistribution: [],
  setIndustries: (industries) => set({ industries }),
  setIndustryDistribution: (distribution) => set({ industryDistribution: distribution }),
  
  loading: false,
  setLoading: (loading) => set({ loading }),
  
  refreshData: () => set({ lastRefresh: Date.now() }),
  lastRefresh: Date.now(),
}));
