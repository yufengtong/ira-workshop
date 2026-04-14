import axios from 'axios';
import { News } from '../types/news';

const API_BASE_URL = '/api';

export const newsApi = {
  getLatestNews: async (): Promise<News[]> => {
    const response = await axios.get(`${API_BASE_URL}/news`);
    return response.data;
  },

  getHighImpactNews: async (): Promise<News[]> => {
    const response = await axios.get(`${API_BASE_URL}/news/high-impact`);
    return response.data;
  },

  getNewsBySource: async (providerName: string): Promise<News[]> => {
    const response = await axios.get(`${API_BASE_URL}/news/source/${providerName}`);
    return response.data;
  }
};
