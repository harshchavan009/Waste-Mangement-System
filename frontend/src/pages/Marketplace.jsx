import { useState, useEffect } from 'react';
import { ShoppingCart, Leaf, Wallet, CreditCard, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Marketplace() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMarketplace();
  }, []);

  const fetchMarketplace = () => {
    fetch('/api/marketplace')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleRedeem = async (reward) => {
    setPurchasing(reward.id);
    setError(null);
    
    try {
      const response = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reward_id: reward.id })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setReceipt(result.receipt);
        // Update local balance
        setData(prev => ({ ...prev, balance: result.new_balance }));
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Transaction failed. Network error.");
    } finally {
      setPurchasing(null);
    }
  };

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-500 flex flex-col items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin mb-4 text-emerald-500" />
        <p>Syncing Web3 Wallet...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-emerald-500" />
            Eco Marketplace
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Convert your Green Points into real-world rewards via EcoTokens.</p>
        </div>
        
        {/* Wallet Balance */}
        <div className="glassmorphism rounded-2xl px-6 py-3 border border-emerald-500/20 flex items-center gap-4 bg-emerald-500/5">
          <Wallet className="h-6 w-6 text-emerald-500" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Wallet Balance</div>
            <div className="text-2xl font-black text-emerald-500 flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              {data.balance} <span className="text-sm font-bold text-gray-500">{data.currency}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Catalog Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.catalog.map((item) => (
            <motion.div 
              key={item.id}
              whileHover={{ y: -5 }}
              className="glassmorphism rounded-3xl p-6 border border-gray-200 dark:border-gray-800 flex flex-col relative overflow-hidden group transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="text-5xl mb-4 filter drop-shadow-md">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex-1 mb-6">{item.description}</p>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="font-black text-xl flex items-center gap-1 text-emerald-500">
                  {item.cost} <span className="text-xs text-gray-500 font-bold">{data.currency}</span>
                </div>
                
                <button
                  onClick={() => handleRedeem(item)}
                  disabled={purchasing === item.id || data.balance < item.cost}
                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    data.balance < item.cost 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  }`}
                >
                  {purchasing === item.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  {data.balance < item.cost ? 'Locked' : 'Purchase'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Purchase Receipt Modal */}
      <AnimatePresence>
        {receipt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full border border-gray-200 dark:border-gray-800 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
              
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4 text-emerald-500">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-black">Transaction Verified</h2>
                <p className="text-sm text-gray-500 mt-1">Smart Contract Executed</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Item Redeemed</div>
                  <div className="font-bold">{receipt.item}</div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-bold text-emerald-500">-{receipt.cost} ECT</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="font-mono text-xs">{receipt.timestamp}</span>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">TxHash</div>
                  <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-emerald-600 dark:text-emerald-400 break-all">
                    {receipt.tx_hash}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setReceipt(null)}
                className="w-full bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Close Receipt
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
