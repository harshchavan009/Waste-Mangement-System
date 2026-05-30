import React, { useState, useEffect } from 'react';
import { Trophy, Star, Medal, Leaf, Award, ArrowUp, RefreshCw, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// High-fidelity Green Energy Burst Particle effect
const ParticleBurst = () => {
  const particles = Array.from({ length: 24 });
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
      {particles.map((_, i) => {
        const angle = (i * 360) / 24;
        const radian = (angle * Math.PI) / 180;
        const x = Math.cos(radian) * 135;
        const y = Math.sin(radian) * 135;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1.2, opacity: 1 }}
            animate={{ x, y, scale: 0.1, opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="absolute w-3.5 h-3.5 bg-emerald-400 rounded-full shadow-[0_0_12px_#34d399]"
          />
        );
      })}
    </div>
  );
};

export default function Rewards() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // States to trigger gamified point animations
  const [showTrophy, setShowTrophy] = useState(false);
  const [showEnergyBurst, setShowEnergyBurst] = useState(false);
  const [showBadgePopup, setShowBadgePopup] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState(null);

  const fetchLeaderboard = () => {
    fetch('/api/leaderboard')
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

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Claim Daily points eco bonus and trigger active micro-animations
  const claimDailyBonus = async () => {
    try {
      const res = await fetch('/api/rewards/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: 150 })
      });
      if (res.ok) {
        const json = await res.json();

        // 1. Trigger live Green Energy Burst particle bloom centered inside the container
        setShowEnergyBurst(true);
        // 2. Trigger high-impact golden Trophy float modal
        setShowTrophy(true);

        // 3. Increment stats inside local React state
        setData(prev => ({
          ...prev,
          user_profile: {
            ...prev.user_profile,
            points: json.new_balance
          }
        }));

        // 4. Trigger High-Fidelity Eco Badge Popup after 1.3 seconds
        setTimeout(() => {
          setUnlockedBadge({
            name: "Zero Waste Hero",
            icon: "🌍",
            description: "Awarded for outstanding green contributions and claim active eco-points."
          });
          setShowBadgePopup(true);

          // Force local badge icon status to unlocked in array
          setData(prev => {
            const updatedBadges = prev.user_profile.badges.map(b => 
              b.id === 3 ? { ...b, earned: true } : b
            );
            return {
              ...prev,
              user_profile: {
                ...prev.user_profile,
                badges: updatedBadges
              }
            };
          });
        }, 1300);

        // Clear active visual states
        setTimeout(() => setShowEnergyBurst(false), 1600);
        setTimeout(() => setShowTrophy(false), 2600);
      }
    } catch (err) {
      console.error("Failed to claim daily bonus:", err);
    }
  };

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-500 flex flex-col items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p>Loading Eco Rewards...</p>
      </div>
    );
  }

  const { user_profile, leaderboard } = data;
  const progressPercent = Math.min(100, (user_profile.points / user_profile.next_level_points) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Eco Rewards & Gamification
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Earn Green Points and unlock badges by recycling smartly.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* User Profile & Badges */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Progress Card */}
          <div className="glassmorphism rounded-3xl p-8 border border-gray-200 dark:border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Star className="h-32 w-32" />
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
              <div>
                <h2 className="text-2xl font-black mb-1">{user_profile.name}</h2>
                <div className="inline-block bg-primary/20 text-primary font-bold px-3 py-1 rounded-full text-sm">
                  Rank: {user_profile.level}
                </div>
              </div>
              
              {/* Tally Points Container with absolute Green Energy Burst mount point */}
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Total Green Points</div>
                <div className="text-5xl font-black text-emerald-500 flex items-center gap-2 relative bg-emerald-500/5 px-6 py-3.5 rounded-2xl border border-emerald-500/10">
                  <Leaf className="h-10 w-10 text-emerald-400" />
                  {user_profile.points}
                  {showEnergyBurst && <ParticleBurst />}
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-gray-500">Progress to Next Rank</span>
                <span className="text-primary">{user_profile.points} / {user_profile.next_level_points}</span>
              </div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-6">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-primary"
                ></motion.div>
              </div>

              {/* CLAIM BONUS BUTTON FOR PRESENTATIONS */}
              <button
                onClick={claimDailyBonus}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-[#10b981] hover:scale-[1.02] active:scale-[0.98] font-black text-xs text-white rounded-2xl shadow-lg shadow-emerald-500/25 transition-all uppercase tracking-wider flex items-center gap-2"
              >
                <Leaf className="h-4 w-4 animate-bounce" />
                Claim Daily Eco-Bonus (+150 PTS)
              </button>
            </div>
          </div>

          {/* AI Insight Card */}
          {user_profile.ai_insight && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6"
            >
              <h3 className="text-emerald-700 dark:text-emerald-400 font-bold mb-3 flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Behavioral Analysis
              </h3>
              <p className="text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed">
                {user_profile.ai_insight}
              </p>
            </motion.div>
          )}

          {/* Eco Badges */}
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Medal className="h-6 w-6 text-primary" />
              Your Eco Badges
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {user_profile.badges.map((badge, idx) => (
                <motion.div 
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex flex-col items-center p-4 rounded-2xl border text-center relative transition-all ${
                    badge.earned 
                      ? 'bg-white dark:bg-gray-800 border-emerald-500 shadow-lg shadow-emerald-500/10' 
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-50 grayscale'
                  }`}
                >
                  <div className="text-4xl mb-3 filter drop-shadow-md">{badge.icon}</div>
                  <div className="text-xs font-bold leading-tight">{badge.name}</div>
                  {badge.earned && <CheckBadge />}
                </motion.div>
              ))}
            </div>
          </div>

        </div>

        {/* City Leaderboard */}
        <div className="glassmorphism rounded-3xl p-6 border border-gray-200 dark:border-gray-800 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-500" />
              City Leaderboard
            </h3>
          </div>
          
          <div className="space-y-4">
            {leaderboard.map((user, idx) => {
              // Update score dynamically locally for leaderboard synching
              const currentPoints = user.name === user_profile.name ? user_profile.points : user.points;
              return (
                <motion.div 
                  key={user.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-2xl ${
                    user.name === user_profile.name 
                      ? 'bg-primary/10 border border-primary' 
                      : 'bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                      idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                      idx === 1 ? 'bg-gray-300 text-gray-800' :
                      idx === 2 ? 'bg-orange-300 text-orange-900' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}>
                      {user.rank}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{user.avatar}</span>
                      <span className={`font-bold ${user.name === user_profile.name ? 'text-primary' : ''}`}>
                        {user.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-black text-emerald-500">
                    {currentPoints}
                    {idx < 3 && <ArrowUp className="h-3 w-3 text-emerald-500" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 1. Large Screen-Centered Bouncy Trophy Animation */}
      <AnimatePresence>
        {showTrophy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.2, rotate: -180 }}
              animate={{ scale: 1.3, rotate: 0 }}
              exit={{ scale: 0.2, rotate: 180 }}
              transition={{ type: "spring", stiffness: 280, damping: 14 }}
              className="text-center p-8 bg-slate-900/95 rounded-3xl border border-yellow-500/30 flex flex-col items-center justify-center gap-4 shadow-2xl shadow-yellow-500/10"
            >
              <div className="text-8xl filter drop-shadow-[0_0_25px_rgba(234,179,8,0.6)] animate-bounce">🏆</div>
              <div className="text-lg font-black text-yellow-400 font-mono tracking-widest uppercase">ECO POINTS EARNED!</div>
              <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">+150 GREENTOKENS ADDED</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Interactive Glowing Eco Badge Popup Modal */}
      <AnimatePresence>
        {showBadgePopup && unlockedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.85, y: 60, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="bg-slate-900 border-2 border-emerald-500/30 p-8 rounded-3xl w-80 shadow-2xl shadow-emerald-500/15 text-center space-y-6"
            >
              <div className="text-6xl animate-bounce filter drop-shadow-[0_0_20px_rgba(16,185,129,0.45)]">
                {unlockedBadge.icon}
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-emerald-400 uppercase tracking-widest">ECO BADGE UNLOCKED!</h4>
                <p className="text-[9px] font-mono font-bold text-gray-500 tracking-widest uppercase">MILestone accomplished</p>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-semibold">
                You unlocked the <span className="text-white font-bold">"{unlockedBadge.name}"</span> badge for claiming eco-points!
              </p>
              <button 
                onClick={() => setShowBadgePopup(false)}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-[#10b981] hover:from-[#10b981] hover:to-emerald-600 font-black text-white rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20"
              >
                CLAIM ECO-CREDITS
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function CheckBadge() {
  return (
    <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-0.5 z-10 shadow">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
  )
}
