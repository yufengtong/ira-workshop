export interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  providerName: string;
  sourceUrl: string;
  category: string;
  impactLevel: string;
  relatedStocks: string[];
  relatedSectors: string[];
  publishedAt: string;
}
