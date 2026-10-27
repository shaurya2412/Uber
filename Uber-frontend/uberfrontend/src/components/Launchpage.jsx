import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  Suspense,
  lazy,
  memo,
} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import {
  ArrowUpRight,
  ArrowRight,
  ArrowUpDown,
  Car,
  ShieldCheck,
  Check,
  ChevronDown,
  Lock,
  PhoneCall,
  FileText,
  Share2,
  Crosshair,
  CheckCircle2,
  Star,
  MapPin,
} from 'lucide-react';

// Lazy-load the Leaflet Map chunk so the Hero text paints immediately
const LazyOSMMap = lazy(() => import('./Map'));

// Prefetch helpers for instant 0ms route transitions when hovering CTAs
const prefetchDashboard = () => {
  import('./Dashboard');
};
const prefetchCaptain = () => {
  import('./Captaindashboard');
};

// Clean minimal skeleton shown while the Leaflet Map chunk loads
const MapLoadingSkeleton = memo(() => (
  <div className="w-full h-full bg-[#0E0E11] flex flex-col items-center justify-center gap-2.5">
    <div className="w-4 h-4 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
    <span className="text-xs text-[#A1A1AA]">Loading map...</span>
  </div>
));
MapLoadingSkeleton.displayName = 'MapLoadingSkeleton';

// IntersectionObserver wrapper to defer mounting below-the-fold sections until scrolled near
const DeferredSection = memo(({ children, minHeight = '360px', id, className = '', ...rest }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '320px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={className}
      style={!isVisible ? { minHeight } : undefined}
      {...rest}
    >
      {isVisible ? children : null}
    </section>
  );
});
DeferredSection.displayName = 'DeferredSection';

const CITY_ROUTES = [
  {
    id: 'del',
    city: 'Delhi NCR',
    routeLabel: 'CP → IGI Airport T3',
    pickup: 'Connaught Place, Outer Circle',
    drop: 'IGI Airport, Terminal 3',
    pickupCoords: [28.6315, 77.2167],
    dropCoords: [28.5562, 77.1000],
    distance: '16.4 km',
    duration: '29 min',
    driverEta: '2 min away',
    driverName: 'Vikram Rathore',
    carModel: 'BYD e6 Electric',
    fares: { go: 280, ev: 345, exec: 490 },
  },
  {
    id: 'blr',
    city: 'Bengaluru',
    routeLabel: 'Indiranagar → UB City',
    pickup: '12th Main, Indiranagar',
    drop: 'UB City, Vittal Mallya Rd',
    pickupCoords: [12.9784, 77.6408],
    dropCoords: [12.9716, 77.5946],
    distance: '6.8 km',
    duration: '19 min',
    driverEta: '3 min away',
    driverName: 'Karthik Gowda',
    carModel: 'Honda City e:HEV',
    fares: { go: 145, ev: 185, exec: 270 },
  },
  {
    id: 'bom',
    city: 'Mumbai',
    routeLabel: 'One BKC → Nariman Point',
    pickup: 'Bandra Kurla Complex (One BKC)',
    drop: 'NCPA, Nariman Point',
    pickupCoords: [19.0653, 72.8682],
    dropCoords: [18.9256, 72.8242],
    distance: '21.2 km',
    duration: '34 min',
    driverEta: '2 min away',
    driverName: 'Sameer Sawant',
    carModel: 'Hyundai Ioniq 5',
    fares: { go: 350, ev: 425, exec: 595 },
  },
];

const LIVE_TICKER_TRIPS = [
  { route: 'Connaught Place → IGI Terminal 3', city: 'Delhi', fare: '₹345', tier: 'Comfort EV' },
  { route: 'Indiranagar → Kempegowda Airport', city: 'Bengaluru', fare: '₹620', tier: 'Executive' },
  { route: 'One BKC → Nariman Point', city: 'Mumbai', fare: '₹425', tier: 'Comfort EV' },
  { route: 'Hauz Khas → DLF CyberHub', city: 'Delhi', fare: '₹265', tier: 'Hatchback' },
  { route: 'Koramangala → Whitefield', city: 'Bengaluru', fare: '₹310', tier: 'Comfort EV' },
  { route: 'Worli Sea Face → Airport T2', city: 'Mumbai', fare: '₹390', tier: 'Innova XL' },
];

const WALKTHROUGH_STEPS = [
  {
    num: '1',
    label: 'Upfront price',
    title: 'Check your fare before you book',
    desc: 'Enter your pickup and destination. The price you see includes taxes and tolls, and stays locked for 10 minutes.',
    metric: '10 min lock',
  },
  {
    num: '2',
    label: 'Direct match',
    title: 'Matched with a driver going your way',
    desc: 'Nearby drivers see your drop-off area and full payout before accepting, so they only take trips they want to drive.',
    metric: '~14s match',
  },
  {
    num: '3',
    label: 'Boarding PIN',
    title: 'Share your 4-digit code when seated',
    desc: 'Every trip has a one-time boarding PIN. Your driver enters it once you are inside the car to start the trip.',
    metric: 'PIN verified',
  },
  {
    num: '4',
    label: 'Digital receipt',
    title: 'Hop out and get your invoice',
    desc: 'Pay automatically with UPI, card, or wallet. A downloadable GST invoice is ready in your trip history right away.',
    metric: 'PDF invoice',
  },
];

const FLEET_TIERS = [
  {
    id: 'go',
    name: 'City Hatchback',
    models: 'Maruti Swift · Grand i10 · Tiago EV',
    desc: 'Compact hatchbacks for everyday errands, metro drops, and quick commutes through busy streets.',
    baseNum: 50,
    perKmNum: 12,
    baseFare: '₹50',
    perKm: '₹12/km',
    waitTime: '2–3 min',
    seats: 4,
    bags: 2,
    highlights: ['Upfront fare', 'Air conditioned', '4 passengers'],
  },
  {
    id: 'ev',
    name: 'Comfort Electric',
    models: 'BYD e6 · Tata Tigor EV · MG ZS EV',
    desc: 'Quiet electric sedans with generous legroom, smooth suspension, and phone charging ports in the back.',
    baseNum: 65,
    perKmNum: 14,
    baseFare: '₹65',
    perKm: '₹14/km',
    waitTime: '3–4 min',
    seats: 4,
    bags: 3,
    highlights: ['Quiet electric ride', 'Rear USB-C ports', 'Fits 3 suitcases'],
  },
  {
    id: 'exec',
    name: 'Executive Sedan',
    models: 'Honda City Hybrid · Camry · Ioniq 5',
    desc: 'Spacious sedans driven by our most experienced partners. Ideal for airport transfers and business travel.',
    baseNum: 110,
    perKmNum: 19,
    baseFare: '₹110',
    perKm: '₹19/km',
    waitTime: '4–5 min',
    seats: 4,
    bags: 4,
    highlights: ['Top-rated drivers', 'Extra legroom', 'Large boot space'],
  },
  {
    id: 'xl',
    name: 'Innova XL',
    models: 'Innova Hycross · Innova Crysta · Carens',
    desc: 'Six-seater SUVs and MPVs when you are traveling with family or carrying extra check-in luggage.',
    baseNum: 140,
    perKmNum: 22,
    baseFare: '₹140',
    perKm: '₹22/km',
    waitTime: '5–6 min',
    seats: 6,
    bags: 5,
    highlights: ['6 passenger seats', 'Fits 5 suitcases', 'Outstation ready'],
  },
];

const FAQS = [
  {
    q: 'Why don’t drivers call and cancel after accepting?',
    a: 'We show drivers the drop-off neighborhood and total fare before they accept the request. Because they already know where the trip is going, there is no need to call and ask.',
  },
  {
    q: 'Does the price go up if there is traffic on the way?',
    a: 'No. Your fare is calculated upfront and locked before you book. Unless you change the destination mid-ride, you pay the exact amount shown.',
  },
  {
    q: 'How do refunds work if a ride is cancelled?',
    a: 'If you cancel before pickup or if no driver is matched within 60 seconds, any prepaid amount is refunded to your original payment method automatically.',
  },
  {
    q: 'Can I download invoices for work expenses?',
    a: 'Yes. Every completed trip in your account includes a one-click PDF tax receipt with the route, timestamps, vehicle plate, and fare breakdown.',
  },
];

const parseCoordString = (str) => {
  if (!str) return null;
  const parts = str.split(',').map((s) => parseFloat(s.trim()));
  if (
    parts.length === 2 &&
    !Number.isNaN(parts[0]) &&
    !Number.isNaN(parts[1]) &&
    parts[0] >= -90 &&
    parts[0] <= 90 &&
    parts[1] >= -180 &&
    parts[1] <= 180
  ) {
    return [Number(parts[0].toFixed(4)), Number(parts[1].toFixed(4))];
  }
  return null;
};

const LaunchPage = () => {
  const navigate = useNavigate();

  // Interactive Hero Route & Live Two-Coordinate Map State
  const [activeRouteIdx, setActiveRouteIdx] = useState(0);
  const [selectedCarTier, setSelectedCarTier] = useState('ev');
  const activeRoute = CITY_ROUTES[activeRouteIdx];

  // Two Coordinates State: Pickup [lat, lng] & Drop-off [lat, lng]
  const [coord1, setCoord1] = useState(CITY_ROUTES[0].pickupCoords);
  const [coord2, setCoord2] = useState(CITY_ROUTES[0].dropCoords);
  const [coord1Input, setCoord1Input] = useState(
    `${CITY_ROUTES[0].pickupCoords[0]}, ${CITY_ROUTES[0].pickupCoords[1]}`
  );
  const [coord2Input, setCoord2Input] = useState(
    `${CITY_ROUTES[0].dropCoords[0]}, ${CITY_ROUTES[0].dropCoords[1]}`
  );
  const [routeStats, setRouteStats] = useState({ distanceKm: 16.4, durationMin: 29 });

  // Debounce typed coordinate strings (200ms) so OSRM routing only runs after typing settles
  useEffect(() => {
    const timer = setTimeout(() => {
      const parsed1 = parseCoordString(coord1Input);
      if (parsed1 && (parsed1[0] !== coord1[0] || parsed1[1] !== coord1[1])) {
        setCoord1(parsed1);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [coord1Input, coord1]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const parsed2 = parseCoordString(coord2Input);
      if (parsed2 && (parsed2[0] !== coord2[0] || parsed2[1] !== coord2[1])) {
        setCoord2(parsed2);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [coord2Input, coord2]);

  // Interactive Distance Slider for Fleet Explorer
  const [sampleDistanceKm, setSampleDistanceKm] = useState(14);

  const handleSelectCityPreset = useCallback((idx) => {
    const preset = CITY_ROUTES[idx];
    setActiveRouteIdx(idx);
    setCoord1(preset.pickupCoords);
    setCoord2(preset.dropCoords);
    setCoord1Input(`${preset.pickupCoords[0]}, ${preset.pickupCoords[1]}`);
    setCoord2Input(`${preset.dropCoords[0]}, ${preset.dropCoords[1]}`);
  }, []);

  const handleMapPickupChange = useCallback((newCoords) => {
    setCoord1(newCoords);
    setCoord1Input(`${newCoords[0]}, ${newCoords[1]}`);
  }, []);

  const handleMapDestChange = useCallback((newCoords) => {
    setCoord2(newCoords);
    setCoord2Input(`${newCoords[0]}, ${newCoords[1]}`);
  }, []);

  const handleSwapCoordinates = useCallback(() => {
    setCoord1((prev1) => {
      setCoord2((prev2) => {
        setCoord1Input(`${prev2[0]}, ${prev2[1]}`);
        setCoord2Input(`${prev1[0]}, ${prev1[1]}`);
        return prev1;
      });
      return coord2;
    });
  }, [coord2]);

  const handleUseBrowserGPS = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next = [Number(pos.coords.latitude.toFixed(4)), Number(pos.coords.longitude.toFixed(4))];
          setCoord1(next);
          setCoord1Input(`${next[0]}, ${next[1]}`);
        },
        () => {}
      );
    }
  }, []);

  // Memoized Upfront Rupee Fares dynamically calculated from the live road distance
  const dynamicFares = useMemo(() => {
    const distKm = routeStats.distanceKm || 10;
    return {
      go: Math.max(60, Math.round(50 + distKm * 12)),
      ev: Math.max(80, Math.round(65 + distKm * 14)),
      exec: Math.max(120, Math.round(110 + distKm * 19)),
    };
  }, [routeStats.distanceKm]);

  const handleContinueToBooking = useCallback(() => {
    navigate('/dashboard', {
      state: {
        pickupCoords: { lat: coord1[0], lng: coord1[1] },
        destinationCoords: { lat: coord2[0], lng: coord2[1] },
        pickup: activeRoute.pickup || `${coord1[0]}, ${coord1[1]}`,
        destination: activeRoute.drop || `${coord2[0]}, ${coord2[1]}`,
        selectedTier: selectedCarTier === 'exec' ? 'premium' : selectedCarTier === 'go' ? 'shared' : 'economy',
      },
    });
  }, [navigate, coord1, coord2, activeRoute, selectedCarTier]);

  // Interactive 4-Step Walkthrough State (auto-advances unless paused)
  const [activeStep, setActiveStep] = useState(0);
  const [pauseSteps, setPauseSteps] = useState(false);

  useEffect(() => {
    if (pauseSteps) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % WALKTHROUGH_STEPS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [pauseSteps]);

  // Fleet Explorer Tab State
  const [activeFleetIdx, setActiveFleetIdx] = useState(1);
  const activeFleet = FLEET_TIERS[activeFleetIdx];

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen w-full bg-[#09090B] text-[#FAFAFA] selection:bg-[#FAFAFA] selection:text-[#09090B] font-sans overflow-x-hidden">
      {/* FULL-VIEWPORT HEADER BAR */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#09090B]/90 border-b border-white/[0.08]">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Mark + / Handle */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex items-center -space-x-1">
                <span className="w-3 h-4.5 rounded-full bg-[#FAFAFA] rotate-[24deg]" />
                <span className="w-3 h-4.5 rounded-full bg-[#FAFAFA]/75 rotate-[24deg] border border-[#09090B]" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-[#FAFAFA]">
                Nexus
              </span>
            </Link>
            <span className="hidden sm:inline-block text-xs text-[#71717A]">
              / rides@nexus.in
            </span>
          </div>

          {/* Center: Navigation Links Separated by Centered Dots */}
          <nav className="hidden md:flex items-center gap-5 text-[13px] font-medium text-[#D4D4D8]">
            <a href="#how-it-works" className="hover:text-[#FAFAFA] transition-colors">
              How it works
            </a>
            <span className="text-[#52525B] select-none">·</span>
            <a href="#fleet" className="hover:text-[#FAFAFA] transition-colors">
              Vehicles
            </a>
            <span className="text-[#52525B] select-none">·</span>
            <a href="#safety" className="hover:text-[#FAFAFA] transition-colors">
              Safety
            </a>
            <span className="text-[#52525B] select-none">·</span>
            <button
              type="button"
              onMouseEnter={prefetchCaptain}
              onClick={() => navigate('/capdashboard')}
              className="hover:text-[#FAFAFA] transition-colors cursor-pointer"
            >
              Drivers
            </button>
          </nav>

          {/* Right: Vertical Divider + Log in + Outlined Pill CTA */}
          <div className="flex items-center gap-5">
            <div className="hidden sm:block h-4 w-px bg-white/[0.14]" />
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-[13px] font-medium text-[#E4E4E7] hover:text-white transition-colors cursor-pointer"
            >
              Log in
            </button>
            <button
              type="button"
              onMouseEnter={prefetchDashboard}
              onClick={handleContinueToBooking}
              className="px-4 py-2 rounded-full border border-white/25 hover:border-white bg-white/[0.03] hover:bg-white/[0.08] text-xs transition-all cursor-pointer"
            >
              <span className="font-semibold text-[#FAFAFA]">Book Now</span>
              <span className="text-[#A1A1AA] font-normal"> — Upfront</span>
            </button>
          </div>
        </div>
      </header>

      {/* FULL-WIDTH HERO SECTION (NO OUTER BOX PADDING OR SIDE MARGINS) */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-8 border-b border-white/[0.08]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT COLUMN: EDITORIAL LOCKUP ("Ride+", Hairlines, Review Strip, Pill CTA) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 pt-2">
            {/* 1. Top Social Proof Lockup */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FAFAFA] text-[#09090B] flex items-center justify-center shrink-0">
                <div className="flex items-center -space-x-0.5">
                  <span className="w-2 h-3.5 rounded-full bg-[#09090B]" />
                  <span className="w-2 h-3.5 rounded-full bg-[#09090B] border border-[#FAFAFA]" />
                </div>
              </div>
              <div>
                <p className="text-base font-display-serif font-semibold text-[#FAFAFA] leading-tight">
                  1.4M+ Riders
                </p>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  Read Our{' '}
                  <a
                    href="#safety"
                    className="underline decoration-white/40 underline-offset-4 font-semibold text-[#FAFAFA] hover:text-white transition-colors"
                  >
                    Commuter Stories
                  </a>
                </p>
              </div>
            </div>

            {/* 2. Oversized Editorial Serif Display Title ("Ride+") */}
            <div>
              <h1 className="text-7xl sm:text-8xl lg:text-[116px] font-display-serif font-normal tracking-[-0.03em] text-[#FAFAFA] leading-[0.9] select-none">
                Ride
                <sup className="text-4xl sm:text-5xl lg:text-6xl font-sans font-light text-[#E4E4E7] ml-1 align-super">
                  +
                </sup>
              </h1>
            </div>

            {/* 3. Hairline Rule + Editorial Value Statement + City Route Selector */}
            <div className="pt-5 border-t border-white/[0.12] space-y-4">
              <p className="text-base sm:text-lg text-[#E4E4E7] leading-relaxed font-normal max-w-lg">
                Book city rides with locked upfront pricing, and match with verified drivers — up to 3× faster.
              </p>

              {/* City Corridor Presets */}
              <div className="flex flex-wrap items-center gap-2">
                {CITY_ROUTES.map((route, idx) => {
                  const isActive = activeRouteIdx === idx;
                  return (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => handleSelectCityPreset(idx)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                        isActive
                          ? 'bg-[#FAFAFA] text-[#09090B] border-[#FAFAFA] font-semibold'
                          : 'bg-[#121215] text-[#A1A1AA] border-white/[0.1] hover:border-white/30 hover:text-[#FAFAFA]'
                      }`}
                    >
                      {route.city} · {route.routeLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Rider Review & Rating Strip Between Two Hairlines */}
            <div className="py-4 border-y border-white/[0.12] flex items-center justify-between max-w-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#18181B] border border-white/15 flex items-center justify-center text-xs font-semibold text-[#FAFAFA]">
                  AS
                </div>
                <div className="text-xs leading-snug">
                  <p className="font-medium text-[#FAFAFA]">Loved the punctuality</p>
                  <p className="text-[#A1A1AA]">100% Upfront Fare</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold text-[#FAFAFA]">
                <span className="text-[#52525B]">/</span>
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#FAFAFA] text-[#FAFAFA]" />
                  <span>4.9</span>
                </span>
              </div>
            </div>

            {/* 5. Bottom CTA Pair (Solid Pill Button + Underlined Pricing Link) */}
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <button
                type="button"
                onMouseEnter={prefetchDashboard}
                onClick={handleContinueToBooking}
                className="px-7 py-3.5 rounded-full bg-[#FAFAFA] hover:bg-white text-[#09090B] text-xs tracking-tight cursor-pointer transition-colors"
              >
                <span className="font-bold">Book a Ride</span>
                <span className="text-[#52525B] font-normal"> — ₹{dynamicFares[selectedCarTier]}</span>
              </button>

              <a
                href="#fleet"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FAFAFA] underline decoration-white/40 underline-offset-4 hover:decoration-white transition-colors"
              >
                <span>Our Pricing</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: WIDE UNOBSTRUCTED TWO-COORDINATE MAP & ROUTE PANEL */}
          <div className="lg:col-span-7 w-full">
            <div className="w-full rounded-2xl bg-[#121215] border border-white/[0.1] p-3 sm:p-4 space-y-3">
              {/* Top Route Status Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span className="font-medium text-[#FAFAFA]">{activeRoute.city}</span>
                  <span className="text-[#52525B]">·</span>
                  <span className="text-[#A1A1AA]">{activeRoute.routeLabel}</span>
                </div>
                <div className="flex items-center gap-3 text-xs tabular-nums">
                  <span className="text-[#A1A1AA]">
                    Distance: <strong className="text-[#FAFAFA]">{routeStats.distanceKm || 16.4} km</strong>
                  </span>
                  <span className="text-[#52525B]">·</span>
                  <span className="text-[#A1A1AA]">
                    Est. time: <strong className="text-[#FAFAFA]">{routeStats.durationMin || 29} min</strong>
                  </span>
                </div>
              </div>

              {/* Large Unobstructed Interactive Map Canvas */}
              <div className="relative h-[340px] sm:h-[400px] w-full rounded-xl overflow-hidden border border-white/[0.08]">
                <Suspense fallback={<MapLoadingSkeleton />}>
                  <LazyOSMMap
                    center={coord1}
                    zoom={12}
                    userLocation={coord1}
                    destinationLocation={coord2}
                    onPickupChange={handleMapPickupChange}
                    onDestinationChange={handleMapDestChange}
                    onRouteCalculated={setRouteStats}
                    compact={true}
                  />
                </Suspense>
              </div>

              {/* Clean Non-Overlapping Two-Coordinate Inputs + Vehicle Tier Selector */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                {/* Coordinate Inputs (7 cols) */}
                <div className="md:col-span-7 p-3 rounded-xl bg-[#09090B] border border-white/[0.08] flex flex-col justify-between space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[#A1A1AA]">Pickup & drop-off coordinates</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleUseBrowserGPS}
                        className="text-[#E4E4E7] hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Crosshair className="w-3 h-3" /> My GPS
                      </button>
                      <button
                        type="button"
                        onClick={handleSwapCoordinates}
                        className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-[#FAFAFA] flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowUpDown className="w-2.5 h-2.5" /> Swap
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#71717A] block mb-1">Pickup (Lat, Lng)</label>
                      <input
                        type="text"
                        value={coord1Input}
                        onChange={(e) => setCoord1Input(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#121215] border border-white/10 font-mono text-xs text-[#FAFAFA] focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#71717A] block mb-1">Drop-off (Lat, Lng)</label>
                      <input
                        type="text"
                        value={coord2Input}
                        onChange={(e) => setCoord2Input(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#121215] border border-white/10 font-mono text-xs text-[#FAFAFA] focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Tier Selector (5 cols) */}
                <div className="md:col-span-5 p-3 rounded-xl bg-[#09090B] border border-white/[0.08] flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[#A1A1AA]">Select vehicle</span>
                    <span className="text-[#A1A1AA]">Upfront fare</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'go', label: 'Hatchback', fare: dynamicFares.go },
                      { id: 'ev', label: 'Comfort EV', fare: dynamicFares.ev },
                      { id: 'exec', label: 'Executive', fare: dynamicFares.exec },
                    ].map((tier) => {
                      const active = selectedCarTier === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setSelectedCarTier(tier.id)}
                          className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#FAFAFA] text-[#09090B] border-[#FAFAFA]'
                              : 'bg-[#121215] text-[#FAFAFA] border-white/[0.08] hover:border-white/25'
                          }`}
                        >
                          <p className={`text-[10px] font-medium truncate ${active ? 'text-[#09090B]' : 'text-[#A1A1AA]'}`}>
                            {tier.label}
                          </p>
                          <p className="text-xs font-bold tabular-nums mt-0.5">
                            ₹{tier.fare}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* POPULAR CITY HUBS BAR */}
        <div className="w-full pt-6 mt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
          {[
            { name: 'IGI Terminal 3', sub: 'DELHI NCR', idx: 0 },
            { name: 'Connaught Place', sub: 'NEW DELHI', idx: 0 },
            { name: 'Indiranagar 100ft', sub: 'BENGALURU', idx: 1 },
            { name: 'One BKC Hub', sub: 'MUMBAI', idx: 2 },
            { name: 'Nariman Point', sub: 'MUMBAI', idx: 2 },
          ].map((hub) => (
            <button
              key={hub.name}
              type="button"
              onClick={() => handleSelectCityPreset(hub.idx)}
              className="group flex items-center gap-2.5 text-left cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#71717A] group-hover:text-[#FAFAFA] transition-colors" />
              <div>
                <span className="text-sm font-semibold tracking-tight text-[#D4D4D8] group-hover:text-white transition-colors block leading-none">
                  {hub.name}
                </span>
                <span className="text-[10px] font-mono tracking-wider text-[#71717A]">
                  {hub.sub}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* LIVE ROUTES MARQUEE */}
      <div className="w-full border-b border-white/[0.08] bg-[#0D0D10] py-3 overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-3 w-max"
        >
          {[...LIVE_TICKER_TRIPS, ...LIVE_TICKER_TRIPS].map((trip, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#121215] border border-white/[0.08] text-xs shrink-0"
            >
              <span className="text-[11px] text-[#A1A1AA] font-medium">
                {trip.city}
              </span>
              <span className="font-medium text-[#FAFAFA]">{trip.route}</span>
              <span className="font-semibold text-[#FAFAFA] tabular-nums">{trip.fare}</span>
              <span className="text-xs text-[#71717A]">· {trip.tier}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* DEFERRED SECTION 1: HOW A TRIP WORKS */}
      <DeferredSection
        id="how-it-works"
        minHeight="460px"
        className="w-full px-4 sm:px-6 lg:px-8 py-16 border-b border-white/[0.08]"
        onMouseEnter={() => setPauseSteps(true)}
        onMouseLeave={() => setPauseSteps(false)}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-1.5">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#FAFAFA]">
              From pickup to{' '}
              <span className="font-serif-editorial italic font-normal text-[#E4E4E7]">
                drop-off.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[#A1A1AA]">
              Four simple steps every time you ride with Nexus.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Step Selector Tabs */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-2.5">
            {WALKTHROUGH_STEPS.map((step, idx) => {
              const isCurrent = activeStep === idx;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer relative overflow-hidden ${
                    isCurrent
                      ? 'bg-[#121215] border-white/30'
                      : 'bg-[#09090B] border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center ${
                          isCurrent
                            ? 'bg-[#FAFAFA] text-[#09090B]'
                            : 'bg-[#18181C] text-[#A1A1AA]'
                        }`}
                      >
                        {step.num}
                      </span>
                      <span className="text-xs font-medium text-[#A1A1AA]">
                        {step.label}
                      </span>
                    </div>
                    <span className="text-xs text-[#E4E4E7] font-medium">{step.metric}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[#FAFAFA]">{step.title}</h3>
                  {isCurrent && (
                    <p className="text-xs text-[#A1A1AA] leading-relaxed mt-1.5">
                      {step.desc}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: Stage Visualizer Canvas */}
          <div className="lg:col-span-7 rounded-2xl bg-[#121215] border border-white/[0.1] p-6 sm:p-8 flex flex-col justify-between min-h-[360px]">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <span className="text-xs font-medium text-[#E4E4E7]">
                Step {WALKTHROUGH_STEPS[activeStep].num} of 4 · {WALKTHROUGH_STEPS[activeStep].label}
              </span>
              <span className="text-xs text-[#71717A]">
                {pauseSteps ? 'Paused' : 'Auto-advancing'}
              </span>
            </div>

            <div className="my-auto py-6">
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  <motion.div
                    key="step-01"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="max-w-md mx-auto"
                  >
                    <div className="p-5 rounded-xl bg-[#09090B] border border-white/[0.1] space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#E4E4E7] font-medium">Connaught Place → IGI Airport T3</span>
                        <span className="text-[#A1A1AA]">16.4 km</span>
                      </div>

                      <div className="h-1.5 w-full bg-[#18181C] rounded-full overflow-hidden">
                        <div className="h-full w-full bg-[#FAFAFA]" />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <p className="text-xs text-[#A1A1AA]">Total fare (incl. taxes)</p>
                          <p className="text-2xl font-semibold text-[#FAFAFA] tabular-nums mt-0.5">
                            ₹345
                          </p>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/15 text-[#FAFAFA] text-xs font-medium flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Price locked</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 1 && (
                  <motion.div
                    key="step-02"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="max-w-md mx-auto"
                  >
                    <div className="p-5 rounded-xl bg-[#09090B] border border-white/[0.1] space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#18181C] border border-white/15 flex items-center justify-center font-semibold text-xs text-[#FAFAFA]">
                            VR
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#FAFAFA]">Vikram Rathore · 4.9 ★</p>
                            <p className="text-xs text-[#A1A1AA]">BYD e6 · DL 01 AX 9921</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-md bg-[#FAFAFA] text-[#09090B] text-xs font-semibold">
                          On the way
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#121215] border border-white/[0.08] text-xs text-[#E4E4E7] flex items-center justify-between">
                        <span>Driver confirmed your drop-off location</span>
                        <CheckCircle2 className="w-4 h-4 text-[#FAFAFA]" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  <motion.div
                    key="step-03"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="max-w-md mx-auto text-center space-y-4"
                  >
                    <p className="text-xs font-medium text-[#A1A1AA]">
                      Your 4-digit boarding code
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      {['4', '8', '2', '9'].map((digit, i) => (
                        <div
                          key={i}
                          className="w-12 h-14 rounded-xl bg-[#09090B] border border-white/20 flex items-center justify-center font-mono text-xl font-semibold text-[#FAFAFA]"
                        >
                          {digit}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-[#A1A1AA]">
                      Share this code with your driver once you’re inside the car
                    </p>
                  </motion.div>
                )}

                {activeStep === 3 && (
                  <motion.div
                    key="step-04"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="max-w-md mx-auto"
                  >
                    <div className="p-5 rounded-xl bg-[#09090B] border border-white/[0.1] space-y-3">
                      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#FAFAFA]" />
                          <span className="text-xs font-semibold text-[#FAFAFA]">Trip receipt #NEX-8841</span>
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/[0.08] text-[#FAFAFA]">
                          Paid via UPI
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-[#A1A1AA]">
                        <span>Trip fare (16.4 km)</span>
                        <span className="text-[#FAFAFA] tabular-nums">₹328.57</span>
                      </div>
                      <div className="flex justify-between text-xs text-[#A1A1AA]">
                        <span>Taxes & GST (5%)</span>
                        <span className="text-[#FAFAFA] tabular-nums">₹16.43</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-[#FAFAFA] pt-2 border-t border-white/[0.08]">
                        <span>Total paid</span>
                        <span className="tabular-nums">₹345.00</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs text-[#A1A1AA]">
              <span>Clear status updates on every trip</span>
              <button
                type="button"
                onMouseEnter={prefetchDashboard}
                onClick={handleContinueToBooking}
                className="font-semibold text-[#FAFAFA] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Book a ride</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </DeferredSection>

      {/* DEFERRED SECTION 2: VEHICLES & PRICING */}
      <DeferredSection
        id="fleet"
        minHeight="440px"
        className="w-full px-4 sm:px-6 lg:px-8 py-16 border-b border-white/[0.08]"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-1.5">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#FAFAFA]">
              Cars for{' '}
              <span className="font-serif-editorial italic font-normal text-[#E4E4E7]">
                every trip.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[#A1A1AA]">
              From quick daily errands to six-seater airport runs.
            </p>
          </div>

          {/* Vehicle Category Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-[#121215] p-1 rounded-xl border border-white/[0.08]">
            {FLEET_TIERS.map((tier, idx) => {
              const active = activeFleetIdx === idx;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setActiveFleetIdx(idx)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#FAFAFA] text-[#09090B]'
                      : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
                  }`}
                >
                  {tier.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-[#121215] border border-white/[0.1] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#09090B] border border-white/[0.08] text-xs text-[#E4E4E7]">
              <Car className="w-3.5 h-3.5 text-[#FAFAFA]" />
              <span>{activeFleet.models}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-[#FAFAFA]">
              {activeFleet.name}
            </h3>
            <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed max-w-2xl">
              {activeFleet.desc}
            </p>

            <div className="flex flex-wrap gap-2.5">
              {activeFleet.highlights.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#09090B] border border-white/[0.08] text-xs font-medium text-[#E4E4E7]"
                >
                  <Check className="w-3.5 h-3.5 text-[#FAFAFA]" />
                  {item}
                </span>
              ))}
            </div>

            {/* INTERACTIVE DISTANCE SLIDER */}
            <div className="p-4 rounded-xl bg-[#09090B] border border-white/[0.08] space-y-2.5 max-w-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#A1A1AA]">
                  Estimate fare by trip distance ({sampleDistanceKm} km)
                </span>
                <span className="font-semibold text-base text-[#FAFAFA] tabular-nums">
                  ₹{Math.round(activeFleet.baseNum + sampleDistanceKm * activeFleet.perKmNum)}
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={45}
                value={sampleDistanceKm}
                onChange={(e) => setSampleDistanceKm(Number(e.target.value))}
                className="w-full accent-[#FAFAFA] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#71717A]">
                <span>2 km</span>
                <span>20 km</span>
                <span>45 km</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-xl bg-[#09090B] border border-white/[0.1] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <span className="text-xs font-medium text-[#A1A1AA]">
                Standard rate card
              </span>
              <span className="text-xs font-medium text-[#FAFAFA]">Upfront pricing</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#121215] border border-white/[0.07]">
                <p className="text-xs text-[#A1A1AA]">Base fare</p>
                <p className="text-base font-semibold text-[#FAFAFA] mt-0.5 tabular-nums">
                  {activeFleet.baseFare}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#121215] border border-white/[0.07]">
                <p className="text-xs text-[#A1A1AA]">Per km rate</p>
                <p className="text-base font-semibold text-[#FAFAFA] mt-0.5 tabular-nums">
                  {activeFleet.perKm}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#121215] border border-white/[0.07]">
                <p className="text-xs text-[#A1A1AA]">Capacity</p>
                <p className="text-sm font-medium text-[#FAFAFA] mt-1">
                  {activeFleet.seats} seats · {activeFleet.bags} bags
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#121215] border border-white/[0.07]">
                <p className="text-xs text-[#A1A1AA]">Average pickup</p>
                <p className="text-sm font-medium text-[#FAFAFA] mt-1">
                  {activeFleet.waitTime}
                </p>
              </div>
            </div>

            <button
              type="button"
              onMouseEnter={prefetchDashboard}
              onClick={handleContinueToBooking}
              className="w-full py-3 rounded-lg bg-[#FAFAFA] hover:bg-white text-[#09090B] font-semibold text-xs transition-colors cursor-pointer"
            >
              Book {activeFleet.name} · ₹
              {Math.round(activeFleet.baseNum + sampleDistanceKm * activeFleet.perKmNum)}
            </button>
          </div>
        </div>
      </DeferredSection>

      {/* DEFERRED SECTION 3: SAFETY */}
      <DeferredSection
        id="safety"
        minHeight="360px"
        className="w-full px-4 sm:px-6 lg:px-8 py-16 border-b border-white/[0.08]"
      >
        <div className="max-w-2xl space-y-1.5 mb-10">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#FAFAFA]">
            Safety built into{' '}
            <span className="font-serif-editorial italic font-normal text-[#E4E4E7]">
              every trip.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[#A1A1AA]">
            Verified drivers, live trip sharing, and 24/7 phone support whenever you ride.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: ShieldCheck,
              title: 'Verified city drivers',
              desc: 'Every driver completes background checks, commercial license validation, and an in-person vehicle inspection before taking trips.',
              tag: 'Verified fleet',
            },
            {
              icon: Share2,
              title: 'Share your live trip',
              desc: 'Send a live tracking link on WhatsApp so family or colleagues can follow your car on the map and see your arrival time.',
              tag: 'Works in any browser',
            },
            {
              icon: PhoneCall,
              title: '24/7 phone support',
              desc: 'Reach our city operations team directly from the app whenever you need assistance during or after your ride.',
              tag: 'Direct phone line',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-2xl bg-[#121215] border border-white/[0.08] p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#09090B] border border-white/[0.1] flex items-center justify-center text-[#FAFAFA]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-semibold text-[#FAFAFA]">{card.title}</h3>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">{card.desc}</p>
                </div>

                <div className="pt-3.5 border-t border-white/[0.07] flex items-center justify-between">
                  <span className="text-xs font-medium text-[#E4E4E7]">{card.tag}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FAFAFA]" />
                </div>
              </div>
            );
          })}
        </div>
      </DeferredSection>

      {/* DEFERRED SECTION 4: FAQ ACCORDION */}
      <DeferredSection
        id="faq"
        minHeight="340px"
        className="w-full px-4 sm:px-6 lg:px-8 py-16 border-b border-white/[0.08]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-1.5">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#FAFAFA]">
              Frequently asked{' '}
              <span className="font-serif-editorial italic font-normal text-[#E4E4E7]">
                questions
              </span>
            </h2>
            <p className="text-sm text-[#A1A1AA]">
              Everything you need to know about upfront fares, driver matching, and receipts.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-2.5">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={item.q}
                  className={`rounded-xl border overflow-hidden transition-colors ${
                    isOpen
                      ? 'bg-[#121215] border-white/25'
                      : 'bg-[#121215] border-white/[0.08]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-medium text-[#FAFAFA]">{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#A1A1AA] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#FAFAFA]' : ''
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
                        className="px-5 pb-4 text-sm text-[#A1A1AA] leading-relaxed border-t border-white/[0.06] pt-3"
                      >
                        {item.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </DeferredSection>

      {/* FULL-WIDTH BOTTOM CTA BANNER */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full rounded-2xl bg-[#121215] border border-white/[0.1] px-6 py-10 sm:px-10 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[#FAFAFA]">
              Ready to{' '}
              <span className="font-serif-editorial italic font-normal text-[#E4E4E7]">
                head out?
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[#A1A1AA]">
              Check your route on the map and lock your fare in seconds.
            </p>
          </div>

          <button
            type="button"
            onMouseEnter={prefetchDashboard}
            onClick={handleContinueToBooking}
            className="px-7 py-3.5 rounded-full bg-[#FAFAFA] hover:bg-white text-[#09090B] font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>Book a Ride — Upfront</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* FULL-WIDTH FOOTER */}
      <footer className="w-full border-t border-white/[0.08] bg-[#09090B] py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-1">
              <span className="w-2.5 h-3.5 rounded-full bg-[#FAFAFA] rotate-[24deg]" />
              <span className="w-2.5 h-3.5 rounded-full bg-[#FAFAFA]/70 rotate-[24deg]" />
            </div>
            <span className="text-sm font-medium text-[#FAFAFA]">Nexus</span>
            <span className="text-xs text-[#71717A]">·</span>
            <span className="text-xs text-[#71717A]">Delhi NCR · Bengaluru · Mumbai</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#A1A1AA]">
            <Link to="/dashboard" onMouseEnter={prefetchDashboard} className="hover:text-[#FAFAFA] transition-colors">
              Book a ride
            </Link>
            <Link to="/capdashboard" onMouseEnter={prefetchCaptain} className="hover:text-[#FAFAFA] transition-colors">
              Drive with us
            </Link>
            <Link to="/admin" className="hover:text-[#FAFAFA] transition-colors">
              Operations
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LaunchPage;
