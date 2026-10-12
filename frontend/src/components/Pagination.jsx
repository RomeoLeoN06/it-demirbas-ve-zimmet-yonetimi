import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange, onLimitChange }) {
  if (!pagination || pagination.totalPages <= 1) {
    if (!pagination || pagination.total === 0) return null;
  }

  const { page, totalPages, total, limit } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="pagination-wrapper">
      <div>
        Toplam <strong>{total}</strong> kayıttan{' '}
        <strong>{Math.min((page - 1) * limit + 1, total)}</strong> -{' '}
        <strong>{Math.min(page * limit, total)}</strong> arası gösteriliyor
      </div>

      <div className="pagination-controls">
        {onLimitChange && (
          <div style={{ marginRight: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.8rem' }}>Sayfa başına:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="form-select"
              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.82rem' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}

        <button
          className="page-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          title="Önceki Sayfa"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((p) => (
          <button
            key={p}
            className={`page-btn ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        <button
          className="page-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          title="Sonraki Sayfa"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
