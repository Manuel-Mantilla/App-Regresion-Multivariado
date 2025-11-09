
import React, { useState, useCallback } from 'react';
import { read, utils } from 'xlsx';
import Papa from 'papaparse';

import { DescriptiveAnalysisResult, RegressionResult, DataSet } from './types';
import { generateDescriptiveAnalysis, generateRegressionModel } from './services/geminiService';

import FileUpload from './components/FileUpload';
import DescriptiveAnalysis from './components/DescriptiveAnalysis';
import RegressionModel from './components/RegressionModel';
import ForecastingTool from './components/ForecastingTool';
import { WandIcon } from './components/icons/WandIcon';

// To run this app, you need to install xlsx and papaparse:
// npm install xlsx papaparse
// npm install --save-dev @types/papaparse

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [dataset, setDataset] = useState<DataSet>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [csvString, setCsvString] = useState<string>('');
  
  const [analysis, setAnalysis] = useState<DescriptiveAnalysisResult | null>(null);
  const [regression, setRegression] = useState<RegressionResult | null>(null);
  
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({
    file: false,
    analysis: false,
    regression: false,
  });
  const [error, setError] = useState<{ [key: string]: string | null }>({
    file: null,
    analysis: null,
    regression: null,
  });

  const resetState = () => {
    setFile(null);
    setDataset([]);
    setHeaders([]);
    setCsvString('');
    setAnalysis(null);
    setRegression(null);
    setError({ file: null, analysis: null, regression: null });
  };

  const handleFileUpload = useCallback(async (selectedFile: File) => {
    if (!selectedFile) return;

    setIsLoading(prev => ({ ...prev, file: true }));
    setError(prev => ({ ...prev, file: null }));
    resetState();
    setFile(selectedFile);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          let parsedCsvString: string;

          if (selectedFile.name.endsWith('.xlsx')) {
            const workbook = read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            parsedCsvString = utils.sheet_to_csv(worksheet);
          } else {
            parsedCsvString = data as string;
          }

          setCsvString(parsedCsvString);
          
          Papa.parse(parsedCsvString, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
              if (results.errors.length) {
                  throw new Error(`Error parsing file: ${results.errors[0].message}`);
              }
              setHeaders(results.meta.fields || []);
              setDataset(results.data as DataSet);
              handleDescriptiveAnalysis(parsedCsvString);
            },
            error: (err) => {
              throw err;
            }
          });

        } catch (err) {
          setError(prev => ({ ...prev, file: `Error processing file: ${err instanceof Error ? err.message : String(err)}` }));
          resetState();
        } finally {
          setIsLoading(prev => ({...prev, file: false}));
        }
      };
      
      if (selectedFile.name.endsWith('.xlsx')) {
          reader.readAsBinaryString(selectedFile);
      } else {
          reader.readAsText(selectedFile);
      }
    } catch (err) {
        setError(prev => ({ ...prev, file: `Error reading file: ${err instanceof Error ? err.message : String(err)}` }));
        setIsLoading(prev => ({ ...prev, file: false }));
        resetState();
    }
  }, []);

  const handleDescriptiveAnalysis = useCallback(async (csvData: string) => {
    setIsLoading(prev => ({ ...prev, analysis: true }));
    setError(prev => ({ ...prev, analysis: null }));
    try {
      const result = await generateDescriptiveAnalysis(csvData);
      setAnalysis(result);
    } catch (err) {
      setError(prev => ({ ...prev, analysis: `Failed to generate descriptive analysis: ${err instanceof Error ? err.message : String(err)}` }));
      setAnalysis(null);
    } finally {
      setIsLoading(prev => ({ ...prev, analysis: false }));
    }
  }, []);

  const handleRegression = useCallback(async (dependentVar: string, independentVars: string[]) => {
    setIsLoading(prev => ({ ...prev, regression: true }));
    setError(prev => ({ ...prev, regression: null }));
    setRegression(null);
    try {
      const result = await generateRegressionModel(csvString, dependentVar, independentVars);
      setRegression(result);
    } catch (err) {
      setError(prev => ({ ...prev, regression: `Failed to generate regression model: ${err instanceof Error ? err.message : String(err)}` }));
      setRegression(null);
    } finally {
      setIsLoading(prev => ({ ...prev, regression: false }));
    }
  }, [csvString]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <WandIcon className="w-8 h-8 text-brand-secondary" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              AI Data Analysis & Regression
            </h1>
          </div>
          {file && (
             <button
                onClick={() => handleFileUpload(file)}
                className="bg-brand-secondary hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-sm"
              >
                Reload & Re-analyze
              </button>
          )}
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {!file ? (
          <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading.file} error={error.file} />
        ) : (
          <div className="space-y-8 animate-fade-in">
            <DescriptiveAnalysis 
              analysis={analysis} 
              isLoading={isLoading.analysis}
              error={error.analysis}
              fileName={file.name}
              rowCount={dataset.length}
              columnCount={headers.length}
            />
            <RegressionModel 
              headers={headers} 
              onGenerateModel={handleRegression}
              result={regression}
              isLoading={isLoading.regression}
              error={error.regression}
            />
            <ForecastingTool 
              regressionModel={regression} 
              analysis={analysis} 
            />
          </div>
        )}
      </main>
    </div>
  );
}
