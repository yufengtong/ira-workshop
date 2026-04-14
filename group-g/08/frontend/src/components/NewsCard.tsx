import { News } from '../types/news';

interface NewsCardProps {
  news: News;
}

export function NewsCard({ news }: NewsCardProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('zh-CN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.category}>{news.category}</span>
        <span style={styles.impactLevel}>{news.impactLevel}</span>
      </div>
      <h3 style={styles.title}>{news.title}</h3>
      <p style={styles.summary}>{news.summary}</p>
      <div style={styles.footer}>
        <span style={styles.source}>
          来源: 
          {news.sourceUrl ? (
            <a href={news.sourceUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
              {news.providerName}
            </a>
          ) : (
            news.providerName
          )}
        </span>
        <span style={styles.time}>{formatDate(news.publishedAt)}</span>
      </div>
      {news.relatedStocks && news.relatedStocks.length > 0 && (
        <div style={styles.tags}>
          {news.relatedStocks.map(stock => (
            <span key={stock} style={styles.tag}>{stock}</span>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  category: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  impactLevel: {
    backgroundColor: '#fff3e0',
    color: '#f57c00',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    color: '#333',
  },
  summary: {
    margin: '0 0 12px 0',
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#999',
  },
  source: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  link: {
    color: '#1976d2',
    textDecoration: 'none',
  },
  time: {},
  tags: {
    marginTop: '8px',
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap' as const,
  },
  tag: {
    backgroundColor: '#f5f5f5',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    color: '#666',
  },
};
