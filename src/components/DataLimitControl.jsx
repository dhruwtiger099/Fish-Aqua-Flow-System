import React from 'react';
import { useFarm } from '../context/FarmContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataLimitControl({ total = 0 }) {
  const { dataLimit, updateDataLimit, dataPage, updateDataPage } = useFarm();
  const pageCount = dataLimit >= 999999 ? 1 : Math.max(1, Math.ceil(total / dataLimit));
  const page = Math.min(dataPage, pageCount);
  const from = total === 0 ? 0 : (page - 1) * dataLimit + 1;
  const to = dataLimit >= 999999 ? total : Math.min(page * dataLimit, total);
  return (
    <div className="data-limit-control" title="Select rows per page">
      <button
        type="button"
        onClick={() => updateDataPage(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>
      <span>Page</span>
      <input
        type="number"
        min="1"
        max={pageCount}
        value={page}
        onChange={(e) =>
          updateDataPage(Math.min(pageCount, Math.max(1, Number(e.target.value) || 1)))
        }
        aria-label="Current page"
      />
      <span>of {pageCount}</span>
      <button
        type="button"
        onClick={() => updateDataPage(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
      <select
        value={dataLimit}
        onChange={(e) => updateDataLimit(e.target.value)}
        aria-label="Rows per page"
      >
        <option value="10">10 rows</option>
        <option value="25">25 rows</option>
        <option value="50">50 rows</option>
        <option value="100">100 rows</option>
        <option value="250">250 rows</option>
        <option value="999999">All rows</option>
      </select>
      <span>{total === 1 ? '1 record' : `${from}-${to} of ${total} records`}</span>
    </div>
  );
}
