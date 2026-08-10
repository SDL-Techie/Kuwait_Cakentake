import React from 'react';
import './components.css';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  id?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  emptyMessage = 'No matching entries found.',
  onRowClick,
  id
}: DataTableProps<T>) {
  return (
    <div id={id} className="sage-table-card">
      <div className="sage-table-container">
        <table className="sage-data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{ 
                    textAlign: col.align || 'left',
                    width: col.width || 'auto' 
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row) => (
                <tr 
                  key={row.id} 
                  className={onRowClick ? 'clickable-row' : ''}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, cIdx) => {
                    const cellContent = typeof col.accessor === 'function' 
                      ? col.accessor(row) 
                      : (row[col.accessor] as React.ReactNode);

                    return (
                      <td 
                        key={cIdx} 
                        style={{ textAlign: col.align || 'left' }}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="empty-table-cell">
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
