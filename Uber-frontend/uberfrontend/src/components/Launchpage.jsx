import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Zap,
  Shield,
  ArrowRight,
  Car,
  MapPin,
  Clock,
  Sparkles,
  Users,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import StatCard from './ui/StatCard';

const LaunchPage = () => {
  const navigate = useNavigate();

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Book Instantly',
      desc: 'Set pickup and destination. See guaranteed fares upfront with zero hidden charges.',
      icon: MapPin,
      color: '#7C3AED',
    },
    {
      step: '02',
      title: 'Real-Time Match',
      desc: 'Geospatial algorithms match you with the highest-rated driver within 5km in seconds.',
      icon: Zap,
      color: '#06B6D4',
    },
    {
      step: '03',
      title: 'Ride & Relax',
      desc: 'Live telemetry tracking, SOS safety mesh, and frictionless cryptographic or Razorpay checkout.',
      icon: Car,
      color: '#10B981',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] text-[#F8FAFC] overflow-x-hidden selection:bg-[#7C3AED] selection:text-white">
      {/* Dynamic Background SVG City Grid + Radial Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Animated perspective city grid (CSS SVG) */}
        <svg
          className="absolute w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="city-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgba(124, 58, 237, 0.25)"
                strokeWidth="0.8"
              />
              <circle cx="60" cy="0" r="1.5" fill="rgba(6, 182, 212, 0.4)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#city-grid)" />
        </svg>

        {/* Ambient Top Center Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#7C3AED]/20 via-[#06B6D4]/10 to-transparent blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-30 flex items-center justify-between px-6 py-6 lg:px-12 max-w-7xl mx-auto border-b border-[#1E1E2E]/60 backdrop-blur-md">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] flex items-center justify-center p-0.5 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
              <div className="w-full h-full bg-[#0A0A0F] rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-[#7C3AED] group-hover:rotate-45 transition-transform duration-300" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight text-[#F8FAFC]">
              Nexus<span className="text-[#06B6D4]">.</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#94A3B8]">
            <a href="#how-it-works" className="hover:text-[#F8FAFC] transition-colors">
              How It Works
            </a>
            <a href="#safety" className="hover:text-[#F8FAFC] transition-colors">
              Safety Mesh
            </a>
            <Link to="/admin" className="hover:text-[#06B6D4] transition-colors">
              Fleet Admin
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-semibold text-[#F8FAFC] hover:text-[#7C3AED] transition-colors"
          >
            Sign In
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all"
          >
            Launch App
          </motion.button>
        </div>
      </nav>

      {/* HERO SECTION (Full Viewport Height) */}
      <section className="relative z-10 flex flex-col justify-center min-h-[calc(100vh-90px)] max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">
                Autonomous 2026 Transit Network
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[64px] font-extrabold tracking-tight text-[#F8FAFC] leading-[1.08]">
              Your Ride. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#10B981]">
                Your Rules.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#94A3B8] max-w-xl font-normal leading-relaxed">
              Sub-second dispatch, precision telemetry, and cryptographic escrow fare protection. 
              The next evolution of urban mobility is here.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-base font-bold flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(124,58,237,0.35)] transition-all"
              >
                <span>Book a Ride</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/capdashboard')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent hover:bg-[#1A1A24] text-[#F8FAFC] text-base font-semibold border border-[#2D2D3F] hover:border-[#7C3AED] transition-all"
              >
                <span>Become a Driver</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Right Floating Visual Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-md glass-card-elevated rounded-3xl p-6 border border-[#2D2D3F] shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#10B981] animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
                    Live Telemetry Stream
                  </span>
                </div>
                <span className="text-xs font-mono text-[#94A3B8]">OSRM v5</span>
              </div>

              {/* Interactive Route Preview */}
              <div className="p-4 rounded-2xl bg-[#0A0A0F]/80 border border-[#1E1E2E] space-y-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#06B6D4] ring-4 ring-[#06B6D4]/20" />
                  <div className="flex-1">
                    <p className="text-[11px] uppercase tracking-wider text-[#94A3B8]">Pickup Location</p>
                    <p className="text-sm font-semibold text-[#F8FAFC] truncate">Connaught Place, Central Delhi</p>
                  </div>
                </div>

                <div className="ml-1.5 w-0.5 h-6 bg-dashed border-l-2 border-dashed border-[#2D2D3F]" />

                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#7C3AED] ring-4 ring-[#7C3AED]/20" />
                  <div className="flex-1">
                    <p className="text-[11px] uppercase tracking-wider text-[#94A3B8]">Destination</p>
                    <p className="text-sm font-semibold text-[#F8FAFC] truncate">Indira Gandhi Int'l Airport (T3)</p>
                  </div>
                </div>
              </div>

              {/* Ride Spec Chips */}
              <div className="grid grid-cols-3 gap-2.5 text-center mb-5">
                <div className="p-2.5 rounded-xl bg-[#1A1A24] border border-[#2D2D3F]">
                  <p className="text-[10px] uppercase text-[#94A3B8]">Fare</p>
                  <p className="text-base font-bold text-[#F8FAFC]">₹480</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#1A1A24] border border-[#2D2D3F]">
                  <p className="text-[10px] uppercase text-[#94A3B8]">ETA</p>
                  <p className="text-base font-bold text-[#06B6D4]">3 mins</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#1A1A24] border border-[#2D2D3F]">
                  <p className="text-[10px] uppercase text-[#94A3B8]">Escrow</p>
                  <p className="text-base font-bold text-[#10B981]">Active</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white text-sm font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all"
              >
                Confirm Express Match
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Floating Animated Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 pt-8 border-t border-[#1E1E2E]"
        >
          <StatCard
            icon={Users}
            label="Active Drivers"
            value={1420}
            suffix="+"
            trend={14}
            trendLabel="past 24 hrs"
            accentColor="#7C3AED"
          />
          <StatCard
            icon={Car}
            label="Rides Today"
            value={8940}
            trend={22}
            trendLabel="vs yesterday"
            accentColor="#06B6D4"
          />
          <StatCard
            icon={Compass}
            label="Cities Networked"
            value={24}
            suffix=" Metros"
            trend={5}
            trendLabel="active clusters"
            accentColor="#10B981"
          />
        </motion.div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24 border-t border-[#1E1E2E]">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/10 text-xs font-semibold text-[#06B6D4] uppercase tracking-wider">
            Seamless Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
            How Nexus Operates
          </h2>
          <p className="text-base text-[#94A3B8]">
            Built with 2026 state-machine precision. No ghost drivers, no surprise rate hikes.
          </p>
        </div>

        {/* 3 Step Connected Cards */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Animated Connecting Line on desktop */}
          <div className="hidden md:block absolute top-1/2 left-12 right-12 h-0.5 border-t-2 border-dashed border-[#2D2D3F] -translate-y-12 z-0" />

          {howItWorksSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="relative z-10 glass-card rounded-2xl p-6 border border-[#1E1E2E] hover:border-[#2D2D3F] transition-all group"
              >
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                    style={{ backgroundColor: `${step.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: step.color }} />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#475569] group-hover:text-[#F8FAFC] transition-colors">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">{step.title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[#1E1E2E] bg-[#0A0A0F] py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <p>© 2026 Nexus Mobility Protocol. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-[#F8FAFC] transition-colors">
              Rider Portal
            </Link>
            <Link to="/capdashboard" className="hover:text-[#F8FAFC] transition-colors">
              Driver Cockpit
            </Link>
            <Link to="/admin" className="hover:text-[#06B6D4] transition-colors">
              Fleet Operations
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LaunchPage;
