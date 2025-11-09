import React, { useState } from 'react';
import { RegressionResult } from '../types';
import { EquationIcon } from './icons/EquationIcon';
import Loader from './Loader';

interface RegressionModelProps {
  headers: string[];
  onGenerateModel: (dependentVar: string, independentVars: string[]) => void;
  result: RegressionResult | null;
  isLoading: boolean;
  error: string | null;
}

const RegressionModel: React.FC<RegressionModelProps> = ({ headers, onGenerateModel, result, isLoading, error }) => {
  const [dependentVar, setDependentVar] = useState<string>('');
  const [independentVars, setIndependentVars] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  
  const numericHeaders = headers.filter(h => !isNaN(parseFloat(h))); // A simple check for numeric headers, Gemini will handle types.

  const handleCheckboxChange = (header: string) => {
    setIndependentVars(prev =>
      prev.includes(header)
        ? prev.filter(h => h !== header)
        : [...prev, header]
    );
  };

  const handleSubmit = () => {
    if (!dependentVar) {
        setFormError('Please select a dependent variable.');
        return;
    }
    if (independentVars.length === 0) {
        setFormError('Please select at least one independent variable.');
        return;
    }
    setFormError(null);
    onGenerateModel(dependentVar, independentVars);
  };
  
  const availableIndependentVars = headers.filter(h => h !== dependentVar);

  return (
    <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 shadow-lg animate-slide-up" style={{ animationDelay: '150ms' }}>
      <div className="flex items-center mb-4">
        <EquationIcon className="w-8 h-8 mr-3 text-brand-secondary" />
        <h2 className="text-2xl font-bold text-white">Multivariate Regression Model</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label htmlFor="dependent-var" className="block text-sm font-medium text-gray-300 mb-2">1. Select Dependent Variable (Y)</label>
          <select
            id="dependent-var"
            value={dependentVar}
            onChange={(e) => {
                setDependentVar(e.target.value);
                setIndependentVars(ivs => ivs.filter(iv => iv !== e.target.value)); // unselect if it was an independent var
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-secondary focus:border-brand-secondary"
          >
            <option value="">Choose one...</option>
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">2. Select Independent Variables (X)</label>
          <div className="max-h-32 overflow-y-auto bg-gray-900/50 p-3 rounded-md border border-gray-600 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {availableIndependentVars.map(h => (
              <label key={h} className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={independentVars.includes(h)}
                  onChange={() => handleCheckboxChange(h)}
                  className="rounded bg-gray-600 border-gray-500 text-brand-secondary focus:ring-brand-secondary"
                />
                <span>{h}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-brand-secondary hover:bg-brand-dark text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? 'Generating...' : 'Generate Model'}
        </button>
        {formError && <p className="text-yellow-400 mt-2 text-sm">{formError}</p>}
      </div>
      
      {isLoading && <div className="flex justify-center p-8"><Loader /></div>}
      {error && <p className="text-red-400 bg-red-900/20 p-3 rounded-md mt-4">{error}</p>}
      
      {result && (
        <div className="mt-8 space-y-6 animate-fade-in">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-200">Model Quality</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400">R-Squared</p>
                <p className="text-2xl font-bold text-brand-secondary">{result.modelQuality.rSquared.toFixed(4)}</p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Adj. R-Squared</p>
                <p className="text-2xl font-bold text-brand-secondary">{result.modelQuality.adjustedRSquared.toFixed(4)}</p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400">F-Statistic</p>
                <p className="text-2xl font-bold text-brand-secondary">{result.modelQuality.fStatistic.toFixed(2)}</p>
              </div>
               <div className="bg-gray-900/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400">P-Value (F-Stat)</p>
                <p className="text-2xl font-bold text-brand-secondary">{result.modelQuality.p_value_f_statistic.toExponential(2)}</p>
              </div>
            </div>
            <p className="mt-4 text-gray-300 bg-gray-900/50 p-4 rounded-lg">{result.modelQuality.summary}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-200">Coefficients</h3>
                <ul className="space-y-2">
                {Object.entries(result.coefficients).map(([key, value]) => (
                    <li key={key} className="flex justify-between bg-gray-900/50 p-2 rounded-md">
                    <span className="font-mono text-gray-300">{key}</span>
                    {/* FIX: Check if value is a number before calling toFixed to handle 'unknown' type. */}
                    <span className="font-mono font-bold text-brand-light">{typeof value === 'number' ? value.toFixed(4) : 'N/A'}</span>
                    </li>
                ))}
                </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-200">Regression Formula</h3>
              <div className="bg-gray-900/50 p-4 rounded-lg font-mono text-sm text-brand-light overflow-x-auto">
                {result.formula}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegressionModel;