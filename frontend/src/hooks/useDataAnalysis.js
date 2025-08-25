export const useDataAnalysis = () => {
  const analyzeAndProcessData = (apiData) => {
    const { data, generated_sql, column_info, row_count } = apiData;
    
    if (!data || data.length === 0) {
      return {
        type: 'empty',
        data: [],
        generated_sql,
        message: 'Sorğunuz nəticə qaytarmadı',
        column_info,
        row_count: 0
      };
    }

    // Analyze column types and data patterns
    const columns = Object.keys(data[0]);
    const numericColumns = [];
    const dateColumns = [];
    const textColumns = [];
    const categoryColumns = [];

    // Analyze each column
    columns.forEach(col => {
      const sampleValues = data.slice(0, 10).map(row => row[col]).filter(val => val !== null && val !== undefined);
      
      if (sampleValues.length === 0) return;

      // Check if numeric
      if (sampleValues.every(val => !isNaN(val) && isFinite(val))) {
        numericColumns.push(col);
      }
      // Check if date
      else if (sampleValues.some(val => !isNaN(Date.parse(val)))) {
        dateColumns.push(col);
      }
      // Check if categorical (limited unique values)
      else if (new Set(sampleValues).size <= Math.min(10, sampleValues.length * 0.8)) {
        categoryColumns.push(col);
      }
      // Otherwise it's text
      else {
        textColumns.push(col);
      }
    });

    // Determine visualization type based on data structure
    let visualizationType = 'table';
    let chartData = data;

    // Time series detection
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      visualizationType = 'timeseries';
      chartData = data.map(row => ({
        ...row,
        date: dateColumns.length > 0 ? new Date(row[dateColumns[0]]).toLocaleDateString('az-AZ') : row[dateColumns[0]]
      }));
    }
    // Categorical comparison with numeric values
    else if (categoryColumns.length > 0 && numericColumns.length > 0 && data.length <= 20) {
      if (categoryColumns.length === 1 && data.length <= 8) {
        visualizationType = 'pie';
      } else {
        visualizationType = 'bar';
      }
      
      chartData = data.map(row => ({
        category: row[categoryColumns[0]] || 'Unknown',
        value: parseFloat(row[numericColumns[0]]) || 0,
        ...row
      }));
    }
    // Large dataset with multiple numeric columns
    else if (numericColumns.length >= 2 && data.length > 20) {
      visualizationType = 'scatter';
    }
    // Ranking/leaderboard data
    else if (data.length <= 50 && numericColumns.length > 0) {
      visualizationType = 'ranking';
      chartData = data
        .sort((a, b) => (parseFloat(b[numericColumns[0]]) || 0) - (parseFloat(a[numericColumns[0]]) || 0))
        .map((row, index) => ({ ...row, rank: index + 1 }));
    }

    // Calculate statistics
    const statistics = calculateStatistics(data, numericColumns, categoryColumns);

    return {
      type: visualizationType,
      data: chartData,
      originalData: data,
      generated_sql,
      column_info: {
        numeric: numericColumns,
        date: dateColumns,
        text: textColumns,
        category: categoryColumns,
        total: columns.length
      },
      row_count,
      statistics,
      primaryNumericColumn: numericColumns[0],
      primaryCategoryColumn: categoryColumns[0],
      primaryDateColumn: dateColumns[0]
    };
  };

  const calculateStatistics = (data, numericColumns, categoryColumns) => {
    const stats = {
      totalRows: data.length,
      numericStats: {},
      categoryStats: {}
    };

    // Calculate numeric statistics
    numericColumns.forEach(col => {
      const values = data.map(row => parseFloat(row[col])).filter(val => !isNaN(val));
      if (values.length > 0) {
        stats.numericStats[col] = {
          sum: values.reduce((a, b) => a + b, 0),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
    });

    // Calculate category statistics
    categoryColumns.forEach(col => {
      const values = data.map(row => row[col]).filter(val => val !== null && val !== undefined);
      const counts = {};
      values.forEach(val => {
        counts[val] = (counts[val] || 0) + 1;
      });
      stats.categoryStats[col] = {
        uniqueCount: Object.keys(counts).length,
        topValues: Object.entries(counts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([value, count]) => ({ value, count }))
      };
    });

    return stats;
  };

  return { analyzeAndProcessData };
};