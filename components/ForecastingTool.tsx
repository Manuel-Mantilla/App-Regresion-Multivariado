
import React, { useState, useEffect, useMemo } from 'react';
import { RegressionResult, DescriptiveAnalysisResult } from '../types';
import { WandIcon } from './icons/WandIcon';

interface ForecastingToolProps {
  regressionModel: RegressionResult | null;
  analysis: DescriptiveAnalysisResult | null;
}

const ForecastingTool: React.FC<ForecastingToolProps> = ({ regressionModel, analysis }) => {
  const [inputValues, setInputValues] = useState<{ [key: string]: number }>({});
  
  const independentVars = useMemo(() => {
    if (!regressionModel) return [];
    return Object.keys(regressionModel.coefficients).filter(key => key !== 'Intercept');
  }, [regressionModel]);

  useEffect(() => {
    if (analysis && independentVars.length > 0) {
      const initialValues: { [key: string]: number } = {};
      independentVars.forEach(varName => {
        const stats = analysis.statistics[varName];
        if (stats) {
          initialValues[varName] = stats['50%']; // Default to median
        } else {
          initialValues[varName] = 0;
        }
      });
      setInputValues(initialValues);
    }
  }, [analysis, independentVars]);

  const handleValueChange = (varName: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setInputValues(prev => ({ ...prev, [varName]: numValue }));
    } else {
      setInputValues(prev => ({...prev, [varName]: 0}));
    }
  };

  const predictedValue = useMemo(() => {
    if (!regressionModel) return null;
    
    let prediction = regressionModel.coefficients['Intercept'] || 0;
    
    for (const varName of independentVars) {
      prediction += (regressionModel.coefficients[varName] || 0) * (inputValues[varName] || 0);
    }
    
    return prediction;
  }, [regressionModel, inputValues, independentVars]);

  if (!regressionModel || !analysis) {
    return (
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 shadow-lg animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center mb-4">
                <WandIcon className="w-8 h-8 mr-3 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-500">Forecasting Tool</h2>
            </div>
            <p className="text-gray-400 text-center py-8">Generate a regression model to enable forecasting.</p>
        </div>
    );
  }

  const dependentVarName = regressionModel.formula.split(' ')[0];

  return (
    <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 shadow-lg animate-slide-up" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center mb-6">
        <WandIcon className="w-8 h-8 mr-3 text-brand-secondary" />
        <h2 className="text-2xl font-bold text-white">Forecasting Tool</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-300">Adjust Independent Variables</h3>
          {independentVars.map(varName => {
            const stats = analysis.statistics[varName];
            const min = stats ? stats.min : 0;
            const max = stats ? stats.max : 100;
            const step = stats ? (stats.max - stats.min) / 100 : 1;

            return (
              <div key={varName} className="grid grid-cols-5 gap-4 items-center">
                <label className="col-span-1 text-sm font-medium text-gray-300 truncate">{varName}</label>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={inputValues[varName] || 0}
                  onChange={(e) => handleValueChange(varName, e.target.value)}
                  className="col-span-3 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  value={inputValues[varName] || 0}
                  onChange={(e) => handleValueChange(varName, e.target.value)}
                  className="col-span-1 bg-gray-700 border border-gray-600 rounded-md p-1 text-white text-sm w-full"
                />
              </div>
            );
          })}
        </div>
        <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded-xl p-6 text-center">
          <p className="text-lg font-semibold text-gray-300">Predicted {dependentVarName}</p>
          <p className="text-4xl lg:text-5xl font-bold text-brand-secondary my-2">
            {predictedValue !== null ? predictedValue.toFixed(2) : 'N/A'}
          </p>
          <p className="text-sm text-gray-500">Based on your inputs</p>
        </div>
      </div>
    </div>
  );
};

export default ForecastingTool;
