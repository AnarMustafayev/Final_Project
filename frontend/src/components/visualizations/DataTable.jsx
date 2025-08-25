import React from 'react';
import { Table as TableIcon } from 'lucide-react';

const DataTable = ({ results }) => {
  const { data } = results;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <TableIcon className="h-5 w-5 text-blue-600" />
        Məlumat Cədvəli
      </h3>
      <div className="overflow-x-auto max-h-96">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {Object.keys(data[0] || {}).map((key) => (
                <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                {Object.values(row).map((value, i) => (
                  <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof value === 'number' 
                      ? value.toLocaleString('az-AZ', { 
                          minimumFractionDigits: 0, 
                          maximumFractionDigits: 2 
                        }) 
                      : value?.toString() || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;