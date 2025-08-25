import React from 'react';
import { TrendingUp } from 'lucide-react';

const RankingTable = ({ results }) => {
  const { data } = results;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Reytinq Cədvəli
        </h3>
      </div>
      <div className="overflow-x-auto max-h-96">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reytinq
              </th>
              {Object.keys(data[0] || {}).filter(key => key !== 'rank').map((key) => (
                <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.slice(0, 50).map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    index < 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    #{row.rank || index + 1}
                  </div>
                </td>
                {Object.entries(row).filter(([key]) => key !== 'rank').map(([key, value], i) => (
                  <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof value === 'number' 
                      ? value.toLocaleString('az-AZ', { 
                          minimumFractionDigits: 0, 
                          maximumFractionDigits: 2 
                        }) 
                      : value}
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

export default RankingTable;