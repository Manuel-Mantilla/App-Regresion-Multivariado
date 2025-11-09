import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// FIX: Import Statistic for type safety
import { DescriptiveAnalysisResult, Statistic } from '../types';
import { ChartIcon } from './icons/ChartIcon';
import Loader from './Loader';

interface DescriptiveAnalysisProps {
  analysis: DescriptiveAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  fileName: string;
  rowCount: number;
  columnCount: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-2 border border-gray-600 rounded-md shadow-lg">
          <p className="label text-white">{`${label}`}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.color }} className="text-sm">{`${pld.name}: ${pld.value}`}</p>
          ))}
        </div>
      );
    }
  
    return null;
  };

const DescriptiveAnalysis: React.FC<DescriptiveAnalysisProps> = ({ analysis, isLoading, error, fileName, rowCount, columnCount }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 shadow-lg animate-slide-up">
      <div className="flex items-center mb-4">
        <ChartIcon className="w-8 h-8 mr-3 text-brand-secondary" />
        <h2 className="text-2xl font-bold text-white">Descriptive Analysis</h2>
      </div>
      
      <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-6 p-4 bg-gray-900/50 rounded-lg">
        <p><span className="font-semibold text-gray-200">File:</span> {fileName}</p>
        <p><span className="font-semibold text-gray-200">Rows:</span> {rowCount}</p>
        <p><span className="font-semibold text-gray-200">Columns:</span> {columnCount}</p>
      </div>

      {isLoading && <div className="flex justify-center p-8"><Loader /></div>}
      {error && <p className="text-red-400 bg-red-900/20 p-3 rounded-md">{error}</p>}
      
      {analysis && (
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-200">Key Statistics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left bg-gray-900/50 rounded-lg">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="p-3">Metric</th>
                    {Object.keys(analysis.statistics).map(key => <th key={key} className="p-3">{key}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'].map(metric => (
                    <tr key={metric} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                      <td className="p-3 font-semibold text-gray-300">{metric}</td>
                      {Object.values(analysis.statistics).map((stat, index) => {
                        // FIX: Use a type guard to ensure value is a number before calling toFixed. This resolves the 'never' type error.
                        const value = stat[metric as keyof Statistic];
                        return <td key={index} className="p-3">{typeof value === 'number' ? value.toFixed(2) : 'N/A'}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-200">Data Visualizations</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analysis.charts.map((chart, index) => (
                <div key={index} className="bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-center mb-4">{chart.title}</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chart.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                      <XAxis dataKey={chart.type === 'histogram' ? 'range' : 'name'} stroke="#a0aec0" />
                      <YAxis stroke="#a0aec0" />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(59, 130, 246, 0.2)'}} />
                      <Legend />
                      <Bar dataKey={chart.type === 'histogram' ? 'frequency' : 'count'} fill="#3b82f6" name={chart.yLabel} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DescriptiveAnalysis;