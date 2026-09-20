import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  Car,
  MapPin,
  Clock,
  Users,
  ChevronDown,
  CheckCircle2,
  Shield,
  Star,
  Sparkles,
  Smartphone,
  Lock,
  PhoneCall,
  HelpCircle,
} from 'lucide-react';

const LaunchPage = () => {
  const navigate = useNavigate();

  // Fleet Tiers
  const [selectedFleet, setSelectedFleet] = useState(0);
  const fleetTiers = [
    {
      id: 'pulse',
      name: 'Nexus Comfort',
      type: 'Electric Sedan',
      tagline: 'Quiet, clean, and quick for everyday city trips.',
      rate: '₹18 / km',
      eta: '3 mins avg',
      seats: '4 seats',
      luggage: '2 bags',
      features: ['Silent Electric Ride', 'Clean AC Interior', 'Complimentary Phone Charger'],
      color: '#06B6D4',
      badge: 'Popular',
    },
    {
      id: 'black',
      name: 'Nexus Black',
      type: 'Executive Luxury',
      tagline: 'First-class travel for airport transfers and client meetings.',
      rate: '₹28 / km',
      eta: '4 mins avg',
      seats: '3 VIP seats',
      luggage: '3 bags',
      features: ['Acoustic Soundproofing', 'Chilled Water & Mints', 'Top 1% Rated Drivers'],
      color: '#7C3AED',
      badge: 'Premium',
    },
    {
      id: 'horizon',
      name: 'Nexus XL',
      type: 'Spacious Group SUV',
      tagline: 'Plenty of legroom for families, luggage, and team dinners.',
      rate: '₹24 / km',
      eta: '5 mins avg',
      seats: '6 seats',
      luggage: '5 bags',
      features: ['Extra Legroom', 'Reclining Captain Seats', 'Spacious Boot Space'],
      color: '#10B981',
      badge: 'Groups',
    },
  ];

  // How it works steps
  const howItWorks = [
    {
      num: '01',
      title: 'Set your destination',
      desc: 'See the exact locked fare upfront. No surge surprises halfway through your ride.',
    },
    {
      num: '02',
      title: 'Get matched in seconds',
      desc: 'A nearby verified driver accepts immediately. Watch their real-time approach on the map.',
    },
    {
      num: '03',
      title: 'Hop in & verify PIN',
      desc: 'Share your 4-digit code so you know you are in the right car. Arrive and step out seamlessly.',
    },
  ];

  // Safety Pillars
  const safetyPillars = [
    {
      icon: Lock,
      title: '4-Digit Ride PIN',
      desc: 'Your ride cannot start until you share your unique PIN with the driver. Never get into the wrong car.',
    },
    {
      icon: Shield,
      title: '100% Verified Drivers',
      desc: 'Comprehensive criminal background checks, license verification, and routine vehicle inspections.',
    },
    {
      icon: PhoneCall,
      title: 'Private Number Masking',
      desc: 'Your personal phone number is never shown to the driver. All calls and chats remain anonymized.',
    },
    {
      icon: Clock,
      title: '24/7 Live Support',
      desc: 'Real human support team reachable instantly in the app at any hour of the night.',
    },
  ];

  // Testimonials
  const reviews = [
    {
      quote:
        'Finally a ride app where drivers actually accept trips to the airport without asking for cash upfront or cancelling five times.',
      author: 'Rohan Sen',
      city: 'Delhi',
      role: 'Product Lead',
      rating: 5,
    },
    {
      quote:
        'The 4-digit PIN gives me so much peace of mind when booking cabs after late nights at work. Clean car, polite driver, zero drama.',
      author: 'Pooja Iyer',
      city: 'Bangalore',
      role: 'Brand Consultant',
      rating: 5,
    },
    {
      quote:
        'Fair pay, respectful riders, and zero commission nonsense. Driving with Nexus has been the best decision for my monthly income.',
      author: 'Sukhwinder Singh',
      city: 'Gurgaon',
      role: 'Nexus Partner Driver',
      rating: 5,
    },
  ];

  // FAQ state
  const [openFaq, setOpenFaq] = useState(0);
  const faqs = [
    {
      q: 'How does the locked fare work?',
      a: 'The price you see when booking is the exact amount you pay upon arrival. Even if you hit traffic or take an alternate route recommended by GPS, the fare never increases.',
    },
    {
      q: 'What payment options do you support?',
      a: 'You can pay using UPI (Google Pay, PhonePe, Paytm), credit/debit cards, net banking, or secure digital wallets. Corporate billing accounts are also supported.',
    },
    {
      q: 'How do drivers get verified?',
      a: 'Every driver partner must pass physical police background verification, valid commercial driving license checks, and continuous vehicle fitness inspections before joining.',
    },
    {
      q: 'How do I start driving with Nexus?',
      a: 'Click "Start Driving" in the top bar to create your driver profile, upload your documents, and get approved within 24 hours.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] text-[#F8FAFC] overflow-x-hidden selection:bg-[#7C3AED] selection:text-white font-sans">
      {/* Perspective City Grid Background (Subtle perspective lines receding into distance) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg
          className="absolute w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hero-perspective-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="0.75"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-perspective-grid)" />
        </svg>

        {/* Asymmetric human glow (Subtle, single accent off-center) */}
        <div className="absolute top-10 left-[15%] w-[500px] h-[350px] bg-[#7C3AED]/12 blur-[140px] rounded-full pointer-events-none" />
      </div>

      {/* CLEAN, UN-CROWDED STICKY HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0A0A0F]/90 border-b border-[#1E1E2E] transition-all">
        <div className="flex items-center justify-between px-6 lg:px-12 max-w-7xl mx-auto h-20">
          {/* Brand Mark */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.35)]">
              <Compass className="w-4 h-4 text-white group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#F8FAFC]">
              Nexus<span className="text-[#06B6D4]">.</span>
            </span>
          </Link>

          {/* Center Nav - 5 clean single-word links, whitespace-nowrap */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#94A3B8]">
            <a href="#fleet" className="hover:text-white transition-colors whitespace-nowrap">
              Fleet
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors whitespace-nowrap">
              How it Works
            </a>
            <a href="#safety" className="hover:text-white transition-colors whitespace-nowrap">
              Safety
            </a>
            <a href="#reviews" className="hover:text-white transition-colors whitespace-nowrap">
              Reviews
            </a>
            <a href="#faq" className="hover:text-white transition-colors whitespace-nowrap">
              FAQ
            </a>
          </nav>

          {/* Right Action Cluster - Clean, spaced, zero crowding */}
          <div className="flex items-center gap-5 shrink-0">
            <button
              onClick={() => navigate('/capdashboard')}
              className="text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors whitespace-nowrap hidden sm:inline"
            >
              Start Driving
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all whitespace-nowrap"
            >
              Book a Ride
            </motion.button>
          </div>
        </div>
      </header>

      {/* HERO SECTION: HUMAN, BOLD, AND REAL */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-20 min-h-[calc(100vh-80px)] flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Bold Asymmetric Headline */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Imperfection: Slightly rotated city badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#2D2D3F] bg-[#111118] text-xs font-medium text-[#94A3B8] -rotate-1 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Delhi • Mumbai • Bangalore</span>
            </div>

            {/* Punchy, Real Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-[76px] font-black tracking-tight text-[#F8FAFC] leading-[1.03]">
              Rides that <br />
              <span className="text-[#7C3AED]">actually</span> show up.
            </h1>

            {/* Conversational, single-line max subtext */}
            <p className="text-lg sm:text-xl text-[#94A3B8] font-normal leading-relaxed max-w-xl">
              Book in 10 seconds. Driver in 3 minutes. Fare locked upfront.
            </p>

            {/* Flat Solid CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-base font-bold flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(124,58,237,0.3)] transition-all"
              >
                <span>Book a Ride</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/capdashboard')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#111118] hover:bg-[#1A1A24] text-[#F8FAFC] text-base font-semibold border border-[#2D2D3F] hover:border-[#7C3AED] flex items-center justify-center gap-2 transition-all"
              >
                <span>Start Driving</span>
              </motion.button>
            </div>
          </div>

          {/* Right Column: Realistic Phone Mockup (CSS only, booking UI inside) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="w-full max-w-[340px] rounded-[44px] border-[5px] border-[#262636] bg-[#0E0E14] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_40px_rgba(124,58,237,0.12)] relative"
            >
              {/* Dynamic Island Notch */}
              <div className="w-24 h-4 bg-[#1C1C28] rounded-full mx-auto mb-4 flex items-center justify-end px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              </div>

              {/* In-app Content Container */}
              <div className="space-y-4">
                {/* Minimal Map Placeholder with route graphic */}
                <div className="w-full h-40 rounded-2xl bg-[#14141E] border border-[#1E1E2E] relative overflow-hidden flex items-center justify-center">
                  {/* Subtle map road grid */}
                  <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                    <line x1="20" y1="0" x2="20" y2="160" stroke="#475569" strokeWidth="1" />
                    <line x1="80" y1="0" x2="80" y2="160" stroke="#475569" strokeWidth="1" />
                    <line x1="180" y1="0" x2="180" y2="160" stroke="#475569" strokeWidth="1" />
                    <line x1="260" y1="0" x2="260" y2="160" stroke="#475569" strokeWidth="1" />
                    <line x1="0" y1="40" x2="320" y2="40" stroke="#475569" strokeWidth="1" />
                    <line x1="0" y1="100" x2="320" y2="100" stroke="#475569" strokeWidth="1" />
                  </svg>

                  {/* Route Line SVG */}
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M 50 110 Q 140 40 260 50"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Pickup Marker */}
                  <div className="absolute left-[44px] top-[104px] w-4 h-4 rounded-full bg-[#06B6D4] ring-4 ring-[#06B6D4]/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  {/* Dropoff Marker */}
                  <div className="absolute right-[54px] top-[44px] w-4 h-4 rounded-full bg-[#7C3AED] ring-4 ring-[#7C3AED]/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  {/* Real-time floating arrival badge */}
                  <div className="absolute bottom-2.5 left-3 px-2.5 py-1 rounded-lg bg-[#0A0A0F]/90 border border-[#1E1E2E] text-[10px] font-semibold text-[#10B981] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                    Driver 3 mins away
                  </div>
                </div>

                {/* Pickup Field */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#14141E] border border-[#1E1E2E]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-semibold text-[#64748B]">Pickup</p>
                    <p className="text-xs font-semibold text-[#F8FAFC] truncate">Connaught Place, Inner Circle</p>
                  </div>
                </div>

                {/* Destination Field */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#14141E] border border-[#1E1E2E]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-semibold text-[#64748B]">Destination</p>
                    <p className="text-xs font-semibold text-[#F8FAFC] truncate">Indira Gandhi Int'l Airport (T3)</p>
                  </div>
                </div>

                {/* Fare and Vehicle Info Pill */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#14141E]/60 text-xs">
                  <span className="text-[#94A3B8]">Nexus Sedan</span>
                  <span className="font-bold text-[#F8FAFC]">₹480 (Locked)</span>
                </div>

                {/* Single Simple Booking Action */}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all"
                >
                  Confirm Booking
                </button>
              </div>

              {/* Home indicator bar at bottom of phone */}
              <div className="w-32 h-1 bg-[#2D2D3F] rounded-full mx-auto mt-4" />
            </motion.div>
          </div>
        </div>

        {/* BOTTOM TRUST BAR (Exact human copy) */}
        <div className="mt-16 pt-8 border-t border-[#1E1E2E] flex items-center justify-center">
          <p className="text-sm sm:text-base font-medium text-[#94A3B8] tracking-wide text-center">
            <span className="text-[#F8FAFC] font-semibold">10,000+</span> rides completed &nbsp;•&nbsp;{' '}
            <span className="text-[#10B981] font-semibold">₹0</span> surge surprises &nbsp;•&nbsp;{' '}
            <span className="text-[#F8FAFC] font-semibold">4.9★</span> average rating
          </p>
        </div>
      </section>

      {/* THE FLEET SHOWCASE */}
      <section id="fleet" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-20 border-t border-[#1E1E2E]">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Cars you actually want to sit in.
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8]">
            Clean electric sedans, executive luxury, and group SUVs. No smelly cabs or broken air conditioning.
          </p>
        </div>

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fleetTiers.map((tier, idx) => (
            <div
              key={tier.id}
              className={`rounded-2xl p-7 border transition-all flex flex-col justify-between ${
                selectedFleet === idx
                  ? 'bg-[#111118] border-[#7C3AED] shadow-[0_0_25px_rgba(124,58,237,0.15)]'
                  : 'bg-[#0E0E14] border-[#1E1E2E] hover:border-[#2D2D3F]'
              }`}
              onClick={() => setSelectedFleet(idx)}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{
                      color: tier.color,
                      backgroundColor: `${tier.color}15`,
                      border: `1px solid ${tier.color}30`,
                    }}
                  >
                    {tier.badge}
                  </span>
                  <span className="text-xs text-[#94A3B8] font-mono">{tier.eta}</span>
                </div>

                <h3 className="text-2xl font-bold text-[#F8FAFC] mb-1">{tier.name}</h3>
                <p className="text-xs text-[#64748B] mb-3">{tier.type}</p>
                <p className="text-sm text-[#94A3B8] mb-6 leading-relaxed">{tier.tagline}</p>

                <div className="space-y-2.5 pt-4 border-t border-[#1E1E2E]">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#E2E8F0]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#1E1E2E] flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#64748B]">Estimated Rate</p>
                  <p className="text-base font-bold text-[#F8FAFC]">{tier.rate}</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 rounded-lg bg-[#1E1E2E] hover:bg-[#7C3AED] text-white text-xs font-semibold transition-colors"
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-20 border-t border-[#1E1E2E]">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            How Nexus Works
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8]">
            Three straightforward steps. Zero hidden charges or cancellation games.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {howItWorks.map((step, idx) => (
            <div
              key={step.num}
              className="p-7 rounded-2xl bg-[#0E0E14] border border-[#1E1E2E] hover:border-[#2D2D3F] transition-all"
            >
              <span className="font-mono text-xs font-black text-[#7C3AED] block mb-3">
                STEP {step.num}
              </span>
              <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">{step.title}</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SAFETY PILLARS */}
      <section id="safety" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-20 border-t border-[#1E1E2E]">
        <div className="max-w-xl mb-12 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Built for safety, especially at night.
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8]">
            Every measure in place so you always know you are getting home safely.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {safetyPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0E0E14] border border-[#1E1E2E] hover:border-[#2D2D3F] transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/15 flex items-center justify-center text-[#7C3AED]">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC]">{pillar.title}</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="reviews" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-20 border-t border-[#1E1E2E]">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            What real riders say
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8]">
            From daily office commuters to late-night travelers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="p-7 rounded-2xl bg-[#0E0E14] border border-[#1E1E2E] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 mb-4 text-[#F59E0B]">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-sm text-[#E2E8F0] leading-relaxed italic mb-6">
                  "{rev.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#1E1E2E]">
                <p className="text-sm font-bold text-[#F8FAFC]">{rev.author}</p>
                <p className="text-xs text-[#64748B]">{rev.role} • {rev.city}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 py-20 border-t border-[#1E1E2E]">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Questions & Answers
          </h2>
          <p className="text-sm text-[#94A3B8]">
            Simple facts about how Nexus operates.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#0E0E14] border border-[#1E1E2E] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="text-sm sm:text-base font-semibold text-[#F8FAFC]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#7C3AED]' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5 text-xs sm:text-sm text-[#94A3B8] leading-relaxed border-t border-[#1E1E2E]/60 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CALL-TO-ACTION */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 py-20">
        <div className="rounded-3xl p-8 sm:p-12 border border-[#2D2D3F] bg-[#111118] text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight">
            Ready for a ride with zero nonsense?
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8] max-w-lg mx-auto">
            Try your first ride today. No surprise surges, no multiple cancellations, just a clean car at your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <span>Book a Ride</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/capdashboard')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0A0A0F] hover:bg-[#1A1A24] text-[#F8FAFC] text-sm font-semibold border border-[#2D2D3F] hover:border-[#7C3AED] transition-all"
            >
              Start Driving
            </button>
          </div>
        </div>
      </section>

      {/* CLEAN FOOTER */}
      <footer className="relative z-10 border-t border-[#1E1E2E] bg-[#0A0A0F] py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#F8FAFC]">Nexus</span>
            <span>• Rides that actually show up.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="hover:text-white transition-colors">
              Rider App
            </Link>
            <Link to="/capdashboard" className="hover:text-white transition-colors">
              Driver Portal
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/admin" className="hover:text-[#06B6D4] transition-colors">
              Admin
            </Link>
          </div>

          <p className="text-[#64748B]">© 2026 Nexus Mobility Inc.</p>
        </div>
      </footer>
    </div>
  );
};

export default LaunchPage;
