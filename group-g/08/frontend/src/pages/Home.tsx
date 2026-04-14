import { useState, useEffect } from 'react';
import { News } from '../types/news';
import { NewsCard } from '../components/NewsCard';
import { newsApi } from '../services/api';

export function Home() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high-impact'>('all');

  useEffect(() => {
    loadNews();
  }, [filter]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = filter === 'high-impact' 
        ? await newsApi.getHighImpactNews()
        : await newsApi.getLatestNews();
      setNewsList(data);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>股市资讯推送系统</h1>
        <p style={styles.subtitle}>获取对股市最有影响力的最新资讯</p>
      </header>

      <div style={styles.filters}>
        <button 
          style={filter === 'all' ? styles.filterBtnActive : styles.filterBtn}
          onClick={() => setFilter('all')}
        >
          全部资讯
        </button>
        <button 
          style={filter === 'high-impact' ? styles.filterBtnActive : styles.filterBtn}
          onClick={() => setFilter('high-impact')}
        >
          高影响资讯
        </button>
      </div>

      <main style={styles.main}>
        {loading ? (
          <div style={styles.loading}>加载中...</div>
        ) : newsList.length === 0 ? (
          <div style={styles.empty}>暂无资讯</div>
        ) : (
          newsList.map(news => <NewsCard key={news.id} news={news} />)
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    color: '#333',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    justifyContent: 'center' as const,
  },
  filterBtn: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  },
  filterBtnActive: {
    padding: '8px 16px',
    border: '1px solid #1976d2',
    borderRadius: '20px',
    backgroundColor: '#1976d2',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  },
  main: {
    minHeight: '400px',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#666',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#999',
  },
};
