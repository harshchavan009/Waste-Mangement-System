import { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AiBackground from '../components/AiBackground';
import DashboardPreviewBg from '../components/DashboardPreviewBg';

// ─── Password Strength Analyzer ───────────────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Very Weak', color: 'bg-red-500', glow: 'rgba(239,68,68,0.4)' };
  if (score === 2) return { score, label: 'Weak', color: 'bg-orange-500', glow: 'rgba(249,115,22,0.4)' };
  if (score === 3) return { score, label: 'Fair', color: 'bg-yellow-500', glow: 'rgba(234,179,8,0.4)' };
  if (score === 4) return { score, label: 'Strong', color: 'bg-emerald-400', glow: 'rgba(52,211,153,0.4)' };
  return { score, label: 'Very Strong', color: 'bg-emerald-500', glow: 'rgba(16,185,129,0.5)' };
}

// ─── Animated Input Wrapper ────────────────────────────────────────────────────
function AnimatedInput({ icon: Icon, className, inputRef, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      className="relative"
      animate={focused ? { scale: 1.015 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Animated glow border on focus */}
      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-[2px] rounded-[14px] pointer-events-none z-0"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.5), rgba(59,130,246,0.3))',
              filter: 'blur(4px)',
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10">
        <motion.div
          animate={focused ? { color: '#10b981' } : { color: '#9ca3af' }}
          transition={{ duration: 0.2 }}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <Icon className="h-4 w-4" />
        </motion.div>
        <input
          {...props}
          ref={inputRef}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-white/40 dark:bg-dark/40 border backdrop-blur-md rounded-xl py-3 pl-10 pr-4 focus:outline-none transition-all text-sm ${
            focused
              ? 'border-primary/60 bg-white/60 dark:bg-dark/60'
              : 'border-white/20 dark:border-gray-700/40'
          } ${className || ''}`}
        />
      </div>
    </motion.div>
  );
}

// ─── Animated Submit Button ────────────────────────────────────────────────────
function GlowButton({ loading, isLogin }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={loading ? {} : {
        scale: 1.02,
        boxShadow: '0 0 28px 6px rgba(16,185,129,0.45), 0 4px 16px rgba(16,185,129,0.3)',
      }}
      whileTap={loading ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-60 mt-2 relative overflow-hidden"
    >
      {/* Shimmer sweep on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '150%', opacity: 0.15 }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        style={{
          background: 'linear-gradient(90deg, transparent, white, transparent)',
          transform: 'skewX(-15deg)',
        }}
      />
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <ArrowRight className="h-4 w-4" />
          </motion.div>
        </>
      )}
    </motion.button>
  );
}

// ─── Animated Social Button ────────────────────────────────────────────────────
function SocialButton({ icon, label, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{
        scale: 1.04,
        boxShadow: '0 0 18px 3px rgba(16,185,129,0.2)',
        borderColor: 'rgba(16,185,129,0.5)',
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className="flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-white/20 dark:border-gray-700/50 bg-white/30 dark:bg-dark/30 backdrop-blur-md text-sm font-semibold text-gray-700 dark:text-gray-200"
    >
      <span className="h-5 w-5 flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </motion.button>
  );
}

// ─── Google & GitHub Icons ─────────────────────────────────────────────────────
const GoogleIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

// ─── Forgot Password Modal ─────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="glass-login-card rounded-2xl p-7 w-full max-w-sm relative"
      >
        {step === 'email' ? (
          <>
            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4"
              >
                <Mail className="h-7 w-7 text-primary" />
              </motion.div>
              <h3 className="text-xl font-bold">Forgot Password?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your email and we'll send a reset link.</p>
            </div>
            <form onSubmit={e => { e.preventDefault(); setStep('sent'); }} className="space-y-4">
              <AnimatedInput icon={Mail} type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, boxShadow: '0 0 22px 5px rgba(16,185,129,0.4)' }}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-primary/20"
              >
                Send Reset Link
              </motion.button>
              <button type="button" onClick={onClose} className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors py-1">
                Cancel
              </button>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-center py-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.1 }}
            >
              <CheckCircle2 className="h-14 w-14 text-primary mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">Check your inbox!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Reset link sent to <span className="text-primary font-semibold">{email}</span>.
            </p>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02, boxShadow: '0 0 22px 5px rgba(16,185,129,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl text-sm"
            >
              Back to Login
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Logo with Pulse & Orbit ───────────────────────────────────────────────────
function LogoPulse() {
  return (
    <div className="relative inline-flex items-center justify-center mb-5">
      {/* Outer orbit ring */}
      <motion.div
        className="absolute w-20 h-20 rounded-full border border-primary/20"
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      />
      {/* Mid orbit ring */}
      <motion.div
        className="absolute w-16 h-16 rounded-full border border-primary/30"
        animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ repeat: Infinity, duration: 2.5, delay: 0.4, ease: 'easeInOut' }}
      />
      {/* Core icon badge */}
      <motion.div
        animate={{
          boxShadow: [
            '0 0 0px 0px rgba(16,185,129,0)',
            '0 0 20px 8px rgba(16,185,129,0.35)',
            '0 0 0px 0px rgba(16,185,129,0)',
          ],
        }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="relative w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center shadow-lg"
      >
        <motion.span
          className="text-2xl"
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          style={{ display: 'inline-block' }}
        >
          ♻
        </motion.span>
      </motion.div>
    </div>
  );
}

// ─── Floating Card wrapper ─────────────────────────────────────────────────────
const floatVariants = {
  float: {
    y: [0, -8, 0],
    transition: {
      y: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
    },
  },
};

// ─── Main Auth Component ───────────────────────────────────────────────────────
export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showForgot, setShowForgot] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const strength = getPasswordStrength(password);

  // Mouse-tilt parallax for the card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-200, 200], [6, -6]), { stiffness: 200, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-200, 200], [-6, 6]), { stiffness: 200, damping: 30 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  useEffect(() => {
    const saved = localStorage.getItem('ecovision_remembered_email');
    if (saved) { setEmail(saved); setRememberMe(true); }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    if (rememberMe) {
      localStorage.setItem('ecovision_remembered_email', email);
    } else {
      localStorage.removeItem('ecovision_remembered_email');
    }
    const payload = isLogin ? { email, password } : { name, email, password };
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Authentication failed');
      }
      const data = await response.json();
      login({ name: isLogin ? data.user.name : name, email, role: isLogin ? data.user.role : 'user', token: isLogin ? data.access_token : 'mock-jwt-token' });
      setLoading(false);
      navigate('/');
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('Backend offline — simulated auth.', err);
      setTimeout(() => {
        login({ name: isLogin ? (email.split('@')[0] || 'EcoVision User') : name, email, role: 'user', token: 'mock-jwt-token-simulated' });
        setLoading(false);
        navigate('/');
      }, 500);
    }
  };

  const handleSocialLogin = (provider) => {
    setLoading(true);
    setTimeout(() => {
      login({ name: `${provider} User`, email: `user@${provider.toLowerCase()}.com`, role: 'user', token: `mock-${provider.toLowerCase()}-token` });
      setLoading(false);
      navigate('/');
    }, 800);
  };

  const switchMode = () => { setIsLogin(!isLogin); setErrorMsg(null); setPassword(''); };

  // Stagger animation for form fields
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };
  const fieldVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 24 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#020617]">
      {/* Layer 0: AI particle canvas */}
      <AiBackground />

      {/* Layer 1: Enterprise dashboard preview (blurred behind card) */}
      <DashboardPreviewBg />

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
      </AnimatePresence>

      {/* Card — entry + float + mouse-tilt */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
        variants={floatVariants}
        animate="float"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md glass-login-card rounded-3xl p-8 relative z-20 cursor-default"
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="text-center mb-6">
          <LogoPulse />
          <AnimatePresence mode="wait">
            <motion.h2
              key={isLogin ? 'login-title' : 'signup-title'}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="text-3xl font-bold mb-1"
            >
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </motion.h2>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={isLogin ? 'login-sub' : 'signup-sub'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-500 dark:text-gray-400 text-sm"
            >
              {isLogin ? 'Sign in to access your EcoVision dashboard' : 'Join the smart waste management revolution'}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ── Error Banner ────────────────────────────────────────── */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl text-center overflow-hidden"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Social Buttons ──────────────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex gap-3 mb-5"
        >
          <motion.div variants={fieldVariants} className="flex-1">
            <SocialButton icon={GoogleIcon} label="Google" onClick={() => handleSocialLogin('Google')} />
          </motion.div>
          <motion.div variants={fieldVariants} className="flex-1">
            <SocialButton icon={<span className="text-gray-800 dark:text-white">{GitHubIcon}</span>} label="GitHub" onClick={() => handleSocialLogin('GitHub')} />
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-white/10 dark:bg-gray-700/40" />
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">or continue with email</span>
          <div className="flex-1 h-px bg-white/10 dark:bg-gray-700/40" />
        </div>

        {/* ── Form ────────────────────────────────────────────────── */}
        <form className="space-y-4" onSubmit={handleAuth}>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">

            {/* Name field (Sign Up) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                >
                  <AnimatedInput icon={User} type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <motion.div variants={fieldVariants}>
              <AnimatedInput icon={Mail} type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
            </motion.div>

            {/* Password */}
            <motion.div variants={fieldVariants} className="space-y-2">
              <div className="relative">
                <AnimatedInput
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.2, color: '#10b981' }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-gray-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </motion.button>
              </div>

              {/* Password Strength Meter */}
              <AnimatePresence>
                {!isLogin && password && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-1.5"
                  >
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <motion.div
                          key={i}
                          animate={{
                            backgroundColor: i <= strength.score
                              ? (strength.score >= 4 ? '#10b981' : strength.score === 3 ? '#eab308' : '#f97316')
                              : undefined,
                            boxShadow: i <= strength.score ? `0 0 6px 1px ${strength.glow}` : 'none',
                          }}
                          transition={{ duration: 0.3 }}
                          className={`h-1 flex-1 rounded-full ${i <= strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-700'}`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-semibold ${strength.score <= 2 ? 'text-red-500' : strength.score === 3 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                      Password strength: {strength.label}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Remember Me + Forgot Password */}
            {isLogin && (
              <motion.div variants={fieldVariants} className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <motion.div
                    onClick={() => setRememberMe(!rememberMe)}
                    animate={rememberMe ? { backgroundColor: '#10b981', borderColor: '#10b981' } : { backgroundColor: 'transparent', borderColor: '#9ca3af' }}
                    transition={{ duration: 0.2 }}
                    className="w-4 h-4 rounded border-2 flex items-center justify-center"
                    whileHover={{ scale: 1.15, borderColor: '#10b981' }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <AnimatePresence>
                      {rememberMe && (
                        <motion.svg
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          viewBox="0 0 10 8"
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 select-none">Remember me</span>
                </label>

                <motion.button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  whileHover={{ scale: 1.05, color: '#10b981' }}
                  whileTap={{ scale: 0.95 }}
                  className="text-xs text-primary font-semibold hover:underline transition-colors"
                >
                  Forgot password?
                </motion.button>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div variants={fieldVariants}>
              <GlowButton loading={loading} isLogin={isLogin} />
            </motion.div>
          </motion.div>
        </form>

        {/* ── Switch Mode ─────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <motion.button
            onClick={switchMode}
            whileHover={{ scale: 1.05, color: '#10b981' }}
            whileTap={{ scale: 0.95 }}
            className="text-primary font-semibold hover:underline transition-colors"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </motion.button>
        </motion.p>

        <p className="mt-3 text-center text-[10px] text-gray-400/50">
          By continuing, you agree to EcoVision AI's Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
