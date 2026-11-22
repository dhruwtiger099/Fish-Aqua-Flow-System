import React from 'react';
import { useFarm } from '../context/FarmContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PremiumSelect from './PremiumSelect';

const ROW_OPTIONS = [
  { value: '10', label: '10 rows' },
  { value: '25', label: '25 rows' },
  { value: '50', label: '50 rows' },
  { value: '100', label: '100 rows' },
  { value: '250', label: '250 rows' },
  { value: '999999', label: 'All rows' },
];

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
      <PremiumSelect
        variant="compact"
        ariaLabel="Rows per page"
        value={String(dataLimit)}
        onChange={(e) => updateDataLimit(e.target.value)}
        options={ROW_OPTIONS}
      />
      <span>{total === 1 ? '1 record' : `${from}-${to} of ${total} records`}</span>
    </div>
  );
}
