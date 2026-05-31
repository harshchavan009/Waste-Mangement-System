import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Camera, BarChart2, AlertTriangle, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function BottomNavbar() {
  const location = useLocation();
  const activePath = location.pathname;
  const { user } = useContext(AuthContext);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/classify', label: 'Scan', icon: Camera },
    user && { path: '/dashboard', label: 'Dashboard', icon: BarChart2 },
    { path: '/report', label: 'Complaints', icon: AlertTriangle },
    { path: '/auth', label: 'Profile', icon: User }
  ].filter(Boolean);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden bg-slate-900/90 dark:bg-black/95 backdrop-blur-lg border border-white/10 rounded-2xl p-2 px-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.path;

          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className="relative py-2 px-2 flex flex-col items-center justify-center min-w-[60px] min-h-[48px] rounded-xl transition-all"
            >
              {/* Active Glowing Neon Highlight Capsule */}
              {isActive && (
                <motion.div 
                  layoutId="bottomNavGlow"
                  className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-xl border border-emerald-500/30"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon & Label with interactive scaling & active glow */}
              <motion.div 
                whileTap={{ scale: 0.85 }}
                className="relative z-10 flex flex-col items-center justify-center"
              >
                <Icon 
                  className={`h-5 w-5 transition-colors duration-300 ${
                    isActive 
                      ? 'text-[#10b981] filter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`} 
                />
                
                {/* Subtle text label for clear mobile navigation */}
                <span className={`text-[10px] mt-1 font-extrabold tracking-wide transition-colors duration-300 ${
                  isActive ? 'text-[#10b981]' : 'text-gray-400'
                }`}>
                  {item.label}
                </span>

                {/* Micro active indicator dot */}
                {isActive && (
                  <motion.span 
                    layoutId="activeDot"
                    className="h-1 w-1 bg-[#10b981] rounded-full mt-0.5"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
