import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function Classification() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
      setResult(null); // reset result on new image
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    
    // Mock API call to backend
    setTimeout(() => {
      const categories = ['Plastic', 'Metal', 'Glass', 'Organic', 'Paper', 'E-Waste'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomConfidence = (Math.random() * 20 + 80).toFixed(1); // 80-100%
      
      setResult({
        category: randomCategory,
        confidence: randomConfidence,
        instructions: `Please ensure this item is clean and place it in the ${randomCategory} recycling bin.`
      });
      setLoading(false);
    }, 2000);
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">AI Waste Classification</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">Upload an image of waste to instantly identify its category and recycling instructions.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="flex flex-col gap-4">
          <div 
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:border-primary/50'} glassmorphism h-[400px] flex flex-col items-center justify-center relative`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="relative w-full h-full rounded-2xl overflow-hidden group">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={clearImage} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition shadow-lg">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Drag & Drop Image</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">or click to browse from your device</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileInput}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-800 rounded-full font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                >
                  Browse Files
                </button>
              </>
            )}
          </div>
          
          <button 
            onClick={handleAnalyze}
            disabled={!file || loading}
            className={`py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${!file ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-primary hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:-translate-y-1'}`}
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImageIcon className="h-6 w-6" />}
            {loading ? 'Analyzing with AI...' : 'Analyze Waste'}
          </button>
        </div>

        {/* Results Section */}
        <div className="glassmorphism rounded-3xl p-8 h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-gray-500"
              >
                <div className="bg-gray-100 dark:bg-gray-800/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-10 w-10 text-gray-400" />
                </div>
                <p>Upload an image and click analyze to see results</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                </div>
                <p className="text-lg font-medium text-primary animate-pulse">Running CNN Inference...</p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full mb-6">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-3xl font-black mb-2">{result.category}</h2>
                <div className="inline-block px-4 py-1 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                  <span className="text-sm font-semibold">Confidence: <span className="text-primary">{result.confidence}%</span></span>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 w-full text-left">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-secondary" />
                    Instructions
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{result.instructions}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
