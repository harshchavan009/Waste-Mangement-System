import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ─── Animated Mini Sparkline Chart ────────────────────────────────────────────
function Sparkline({ color = '#10b981', values }) {
  const w = 120, h = 40;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const normalize = (v) => h - ((v - min) / (max - min)) * (h - 4) - 2;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${normalize(v)}`).join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg-${color})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Animated Count-up ────────────────────────────────────────────────────────
function CountUp({ to, suffix = '', prefix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = to / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 20);
    return () => clearInterval(timer);
  }, [to]);
  return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ─── Circular Progress Ring ────────────────────────────────────────────────────
function RingProgress({ percent, color, size = 52, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(percent), 200);
    return () => clearTimeout(t);
  }, [percent]);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - (progress / 100) * circ}
        style={{ transition: 'stroke-dashoffset 1.2s ease' }}
      />
    </svg>
  );
}

// ─── Mini Bar Chart ────────────────────────────────────────────────────────────
function MiniBar({ values, color }) {
  return (
    <div className="flex items-end gap-1 h-10">
      {values.map((v, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-sm"
          style={{ backgroundColor: color, opacity: 0.5 + (v / 100) * 0.5 }}
          initial={{ height: 0 }}
          animate={{ height: `${v}%` }}
          transition={{ delay: i * 0.06, duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ─── Blinking Dot ────────────────────────────────────────────────────────────
function LiveDot({ color = '#10b981' }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
    </span>
  );
}

// ─── Panel shell ──────────────────────────────────────────────────────────────
function Panel({ className = '', children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: 'easeOut' }}
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-sm p-4 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ─── CCTV tile ────────────────────────────────────────────────────────────────
function CctvTile({ id, label, status, color }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    let raf;
    const draw = () => {
      frame++;
      ctx.fillStyle = '#050a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Animated scan lines
      for (let y = 0; y < canvas.height; y += 3) {
        ctx.fillStyle = `rgba(255,255,255,${0.012 + Math.sin(y * 0.1 + frame * 0.05) * 0.008})`;
        ctx.fillRect(0, y, canvas.width, 1);
      }
      // Perspective ground grid
      ctx.strokeStyle = 'rgba(16,185,129,0.18)';
      ctx.lineWidth = 0.5;
      for (let i = 1; i <= 8; i++) {
        const y = canvas.height * 0.45 + i * (canvas.height * 0.07);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      const vx = canvas.width / 2, vy = canvas.height * 0.45;
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath(); ctx.moveTo(vx + i * 28, canvas.height);
        ctx.lineTo(vx, vy); ctx.stroke();
      }
      // Moving bounding box
      const bx = 20 + Math.sin(frame * 0.03) * 12;
      const by = 18 + Math.cos(frame * 0.025) * 4;
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, 34, 42);
      ctx.fillStyle = color; ctx.font = 'bold 7px monospace';
      ctx.fillText('OBJ', bx + 2, by - 2);
      // Timestamp
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '6px monospace';
      ctx.fillText(`CAM-${id}  ${new Date().toLocaleTimeString()}`, 4, canvas.height - 4);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [id, color]);
  return (
    <div className="relative rounded-lg overflow-hidden border border-white/10">
      <canvas ref={canvasRef} width={100} height={72} className="w-full h-auto" />
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
        <LiveDot color={color} />
        <span className="text-[7px] font-bold uppercase tracking-widest text-white/70">{status}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}

// ─── Route Map (Canvas) ───────────────────────────────────────────────────────
function RouteMap() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    let progress = 0;
    let raf;
    const nodes = [
      { x: 20, y: 30 }, { x: 55, y: 15 }, { x: 100, y: 25 },
      { x: 140, y: 18 }, { x: 170, y: 40 }, { x: 155, y: 65 },
      { x: 110, y: 70 }, { x: 70, y: 60 }, { x: 30, y: 70 },
    ];
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#04091a';
      ctx.fillRect(0, 0, W, H);
      // Draw faded street grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      // Draw route path
      ctx.beginPath(); ctx.moveTo(nodes[0].x, nodes[0].y);
      nodes.forEach(n => ctx.lineTo(n.x, n.y));
      ctx.closePath();
      ctx.strokeStyle = 'rgba(16,185,129,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
      // Animated truck progress
      const total = nodes.length;
      const idx = Math.floor(progress * (total - 1));
      const t = (progress * (total - 1)) - idx;
      const a = nodes[idx], b = nodes[(idx + 1) % total];
      const tx = a.x + (b.x - a.x) * t, ty = a.y + (b.y - a.y) * t;
      // Glow
      const grd = ctx.createRadialGradient(tx, ty, 0, tx, ty, 14);
      grd.addColorStop(0, 'rgba(16,185,129,0.5)'); grd.addColorStop(1, 'rgba(16,185,129,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(tx, ty, 14, 0, Math.PI * 2); ctx.fill();
      // Nodes
      nodes.forEach((n, i) => {
        ctx.beginPath(); ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = i <= idx ? '#10b981' : 'rgba(255,255,255,0.25)'; ctx.fill();
      });
      // Truck
      ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981'; ctx.fill();
      progress = (progress + 0.003) % 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} width={190} height={90} className="w-full h-auto rounded-lg" />;
}

// ─── Main Dashboard Preview Background ───────────────────────────────────────
export default function DashboardPreviewBg() {
  const wasteData = [42, 58, 47, 73, 65, 81, 76, 90, 84, 95, 88, 102];
  const carbonData = [30, 28, 25, 22, 19, 17, 15, 13, 12, 10, 9, 8];
  const binData   = [55, 78, 45, 90, 62, 71, 38, 85, 49, 67];

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none z-[1]"
      aria-hidden="true"
    >
      {/* ── the scattered panels ──────────────────────────────────── */}
      <div className="absolute inset-0 p-6 grid grid-cols-12 gap-3 content-start opacity-100">

        {/* ── 1. Waste Analytics ───────────── col 1-5 row 1 */}
        <Panel delay={0.1} className="col-span-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">📈 Waste Analytics</p>
              <p className="text-lg font-black text-white mt-0.5">
                <CountUp to={1247} suffix=" kg" />
              </p>
              <p className="text-[9px] text-emerald-400 font-semibold">↑ 12.4% this week</p>
            </div>
            <RingProgress percent={78} color="#10b981" size={46} />
          </div>
          <Sparkline values={wasteData} color="#10b981" />
        </Panel>

        {/* ── 2. Carbon Tracking ───────────── col 6-9 row 1 */}
        <Panel delay={0.15} className="col-span-4">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">🌱 Carbon Tracking</p>
          <div className="flex items-center gap-3">
            <RingProgress percent={62} color="#34d399" size={40} />
            <div>
              <p className="text-base font-black text-white"><CountUp to={850} suffix=" T" /></p>
              <p className="text-[9px] text-emerald-400">CO₂ saved</p>
            </div>
          </div>
          <Sparkline values={carbonData} color="#34d399" />
        </Panel>

        {/* ── 3. Stats cards ───────────────── col 10-12 row 1 */}
        <Panel delay={0.2} className="col-span-3 flex flex-col gap-2">
          {[
            { label: 'Active Bins', value: '5,430', color: '#10b981' },
            { label: 'Trucks Live', value: '24', color: '#3b82f6' },
            { label: 'Alerts', value: '3', color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="flex justify-between items-center">
              <span className="text-[8px] text-gray-400 font-semibold">{s.label}</span>
              <span className="text-xs font-black" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </Panel>

        {/* ── 4. Route Optimization ────────── col 1-6 row 2 */}
        <Panel delay={0.25} className="col-span-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">🗺 Route Optimization</p>
            <div className="flex items-center gap-1">
              <LiveDot color="#10b981" />
              <span className="text-[8px] text-emerald-400 font-bold">24 trucks active</span>
            </div>
          </div>
          <RouteMap />
          <div className="flex gap-3 mt-2">
            {[{ l: 'Distance', v: '284 km', c: '#10b981' }, { l: 'ETA', v: '2h 14m', c: '#3b82f6' }, { l: 'Fuel Saved', v: '18%', c: '#f59e0b' }].map(s => (
              <div key={s.l} className="flex-1 text-center">
                <p className="text-[7px] text-gray-500 uppercase">{s.l}</p>
                <p className="text-[10px] font-black" style={{ color: s.c }}>{s.v}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* ── 5. CCTV Monitoring ───────────── col 7-12 row 2 */}
        <Panel delay={0.3} className="col-span-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">📷 CCTV Monitoring</p>
            <span className="text-[8px] font-bold text-red-400 animate-pulse">● 4 Feeds Live</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <CctvTile id={1} label="Downtown" status="Active" color="#10b981" />
            <CctvTile id={2} label="Sector B" status="Alert" color="#f59e0b" />
            <CctvTile id={3} label="Harbor" status="Active" color="#10b981" />
            <CctvTile id={4} label="West Ave" status="Active" color="#3b82f6" />
          </div>
        </Panel>

        {/* ── 6. AI Classification ─────────── col 1-5 row 3 */}
        <Panel delay={0.35} className="col-span-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">🤖 AI Classification</p>
          {[
            { label: 'Plastic', pct: 84, color: '#3b82f6' },
            { label: 'Organic', pct: 67, color: '#10b981' },
            { label: 'Metal', pct: 92, color: '#f59e0b' },
            { label: 'Paper', pct: 55, color: '#8b5cf6' },
          ].map(c => (
            <div key={c.label} className="mb-1.5">
              <div className="flex justify-between mb-0.5">
                <span className="text-[8px] text-gray-400">{c.label}</span>
                <span className="text-[8px] font-bold" style={{ color: c.color }}>{c.pct}%</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: c.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${c.pct}%` }}
                  transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </Panel>

        {/* ── 7. Bin Fill Levels ───────────── col 6-9 row 3 */}
        <Panel delay={0.4} className="col-span-4">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">🗑 Bin Fill Levels</p>
          <MiniBar values={binData} color="#10b981" />
          <div className="flex justify-between mt-1">
            {['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10'].map(s => (
              <span key={s} className="text-[6px] text-gray-600">{s}</span>
            ))}
          </div>
        </Panel>

        {/* ── 8. Fleet status ──────────────── col 10-12 row 3 */}
        <Panel delay={0.45} className="col-span-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">🚛 Fleet</p>
          {[
            { id: 'T-04', status: 'En Route', color: '#10b981' },
            { id: 'T-07', status: 'Alert', color: '#f59e0b' },
            { id: 'D-02', status: 'Scanning', color: '#3b82f6' },
          ].map(t => (
            <div key={t.id} className="flex justify-between items-center mb-1.5">
              <span className="text-[8px] text-white font-bold">{t.id}</span>
              <div className="flex items-center gap-1">
                <LiveDot color={t.color} />
                <span className="text-[7px]" style={{ color: t.color }}>{t.status}</span>
              </div>
            </div>
          ))}
        </Panel>
      </div>

      {/* ── Progressive Blur gradient (weakest at sides, strongest in center behind card) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(
              ellipse 50% 70% at 50% 50%,
              rgba(2,6,23,0.82) 0%,
              rgba(2,6,23,0.62) 40%,
              rgba(2,6,23,0.25) 70%,
              rgba(2,6,23,0.08) 100%
            )
          `,
          backdropFilter: 'blur(2.5px)',
          WebkitBackdropFilter: 'blur(2.5px)',
        }}
      />

      {/* ── "Sign in to unlock" badge ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">🔒 Sign in to unlock full dashboard</span>
      </motion.div>
    </div>
  );
}
