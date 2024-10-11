// src/App.js
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Card from './Card';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileUpload, FaListOl, FaEdit } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';

function App() {
  const [excelFile, setExcelFile] = useState(null);
  const [numRows, setNumRows] = useState(10);
  const [customPrompt, setCustomPrompt] = useState('');
  const [syntheticData, setSyntheticData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [darkMode, setDarkMode] = useState(false);
  const [fileError, setFileError] = useState(null);

  const onDrop = (acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      setFileError('Invalid file type. Please upload an Excel or CSV file.');
      return;
    }
    setExcelFile(acceptedFiles[0]);
    setFileError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    multiple: false,
    onDrop,
  });

  // Load dark mode preference from localStorage
  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(storedDarkMode);
  }, []);

  // Apply dark mode class to the root element
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleNumRowsChange = (e) => {
    setNumRows(e.target.value);
  };

  const handleCustomPromptChange = (e) => {
    setCustomPrompt(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!excelFile) {
      alert('Please upload an Excel file.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', excelFile);
    formData.append('numRows', numRows);
    formData.append('customPrompt', customPrompt);

    try {
      const response = await fetch('http://localhost:5000/generate_synthetic_data', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error + ': ' + errorData.details);
        setSyntheticData(null);
      } else {
        const data = await response.json();
        setSyntheticData(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while communicating with the server.');
      setSyntheticData(null);
    }

    setLoading(false);
  };

  const handleDownload = () => {
    const csvContent = convertToCSV(syntheticData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'synthetic_data.csv';
    link.click();
  };

  // Helper function to convert JSON data to CSV format
  const convertToCSV = (data) => {
    if (!data || data.length === 0) {
      return '';
    }
    const keys = Object.keys(data[0]);
    const csvRows = [keys.join(',')];

    data.forEach((row) => {
      const values = keys.map((key) => {
        const val = row[key];
        // Escape commas and quotes
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          return `"${val.replace(/"/g, '""')}"`;
        } else {
          return val;
        }
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="container mx-auto p-4 flex-grow">
        <Card>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-800 dark:text-white">
                Upload Excel or CSV File:
              </label>
              <div
                {...getRootProps()}
                className={`border-dashed border-2 rounded-md p-4 text-center cursor-pointer ${
                  isDragActive
                    ? 'border-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center">
                  <FaFileUpload className="text-gray-600 dark:text-gray-300 mb-2" size={40} />
                  <p className="text-gray-600 dark:text-gray-300">
                    {excelFile
                      ? `Selected file: ${excelFile.name}`
                      : 'Drag and drop an Excel or CSV file here, or click to select a file'}
                  </p>
                </div>
              </div>
              {fileError && <p className="text-red-500 mt-2">{fileError}</p>}
            </div>


            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-800 dark:text-white">
                Number of Rows to Generate:
              </label>
              <div className="flex items-center">
                <FaListOl className="text-gray-600 dark:text-gray-300 mr-2" size={20} />
                <input
                  type="number"
                  value={numRows}
                  onChange={handleNumRowsChange}
                  className="border p-2 w-full"
                  min="1"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-800 dark:text-white">
                Optional Custom Prompt:
              </label>
              <div className="flex items-start">
                <FaEdit className="text-gray-600 dark:text-gray-300 mr-2 mt-2" size={20} />
                <textarea
                  value={customPrompt}
                  onChange={handleCustomPromptChange}
                  className="border p-2 w-full"
                  rows="4"
                  placeholder="Enter custom prompt to influence data generation (optional)"
                ></textarea>
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Synthetic Data'}
            </button>
          </form>
        </Card>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {syntheticData && syntheticData.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
              Synthetic Data:
            </h2>
            <div className="overflow-auto max-h-96 mb-4">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead>
                  <tr>
                    {Object.keys(syntheticData[0]).map((key) => (
                      <th
                        key={key}
                        className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-sm font-semibold text-gray-800 dark:text-white"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {syntheticData.map((row, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layout
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {Object.keys(syntheticData[0]).map((key) => (
                          <td
                            key={key}
                            className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-white"
                          >
                            {row[key]}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            <button
              onClick={handleDownload}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Download Data
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default App;
