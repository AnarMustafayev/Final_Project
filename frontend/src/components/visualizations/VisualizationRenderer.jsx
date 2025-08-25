import React from 'react';
import TimeSeriesChart from './TimeSeriesChart';
import PieChartView from './PieChartView';
import BarChartView from './BarChartView';
import ScatterChartView from './ScatterChartView';
import RankingTable from './RankingTable';
import DataTable from './DataTable';
import EmptyState from './EmptyState';

export const VisualizationRenderer = ({ results }) => {
  if (!results) return null;

  const { type } = results;

  switch (type) {
    case 'timeseries':
      return <TimeSeriesChart results={results} />;
    case 'pie':
      return <PieChartView results={results} />;
    case 'bar':
      return <BarChartView results={results} />;
    case 'scatter':
      return <ScatterChartView results={results} />;
    case 'ranking':
      return <RankingTable results={results} />;
    case 'empty':
      return <EmptyState results={results} />;
    default:
      return <DataTable results={results} />;
  }
};