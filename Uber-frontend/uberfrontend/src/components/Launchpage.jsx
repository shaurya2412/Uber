import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaMapMarkerAlt, FaHeadset } from "react-icons/fa";
import { motion } from "framer-motion";
import uber_india from "../assets/uber_india.png";

const LaunchPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-white to-gray-50 text-gray-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gray-900" aria-hidden="true"></div>
            <span className="text-xl font-bold tracking-tight">Ride</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/Welcome")}
              className="inline-flex items-center justify-center rounded-full bg-black text-white px-5 py-2 text-sm font-medium shadow-sm transition-all hover:scale-105 focus-visible:outline-none"
            >
              Book a Ride
            </button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main>
        <section className="relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left column */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="order-2 lg:order-1"
            >
              <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                <span className="text-base">✅</span>
                Trusted by 10M+ users
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mt-6">
                Your daily commute
                <br />
                <span className="text-indigo-600">Simplified.</span>
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                Safe, reliable, and affordable rides at your fingertips. Join millions who trust us for their daily commute.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={() => navigate("/Welcome")}
                  className="w-full md:w-auto inline-flex items-center justify-center rounded-lg bg-black text-white px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:scale-105"
                >
                  Login as User
                </button>
                <button
                  onClick={() => navigate("/captainregister")}
                  className="w-full md:w-auto inline-flex items-center justify-center rounded-lg bg-white text-gray-900 border border-gray-300 px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:scale-105"
                >
                  Become a Driver
                </button>
              </div>
            </motion.div>

            {/* Right column - phone image */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="order-1 lg:order-2 flex justify-center"
            >
              <div className="relative">
                <div className="w-[300px] sm:w-[360px] md:w-[420px] overflow-hidden rounded-3xl shadow-2xl rotate-[-3deg] bg-white">
                  <img
                    src={uber_india}
                    alt="App preview showing map and route"
                    className="w-full h-[620px] object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>
          </div>
          {/* subtle curved divider */}
          <div className="pointer-events-none" aria-hidden="true">
            <svg className="w-full" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0C240 80 480 120 720 120C960 120 1200 80 1440 0V120H0V0Z" fill="#ffffff"/>
            </svg>
          </div>
        </section>

        {/* Why Choose Us / Safety */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">Committed to Your Safety</h2>
              <p className="mt-3 text-gray-500">We build with care so every ride feels secure, transparent, and supported.</p>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  Icon: FaShieldAlt,
                  title: "Verified Drivers",
                  desc: "Background checks and vehicle inspections for peace of mind.",
                },
                {
                  Icon: FaMapMarkerAlt,
                  title: "Live Tracking",
                  desc: "Share your trip and track routes in real time.",
                },
                {
                  Icon: FaHeadset,
                  title: "24/7 Support",
                  desc: "Get help anytime from our responsive team.",
                },
              ].map(({ Icon, title, desc }, idx) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="rounded-2xl border border-gray-100 bg-white p-8 shadow-md hover:shadow-lg transition-all hover:scale-105"
                >
                  <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Icon aria-hidden className="text-xl" />
                  </div>
                  <h3 className="mt-6 font-semibold text-lg">{title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA strip */}
        <section className="relative isolate overflow-hidden">
          <div className="bg-indigo-600 text-white">
            <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold">Ready to ride smarter? Join now.</h3>
                <p className="text-white/90 mt-1">Seamless pickups, transparent pricing, and live tracking.</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/Welcome")}
                  className="w-full md:w-auto inline-flex items-center justify-center rounded-lg bg-white text-gray-900 px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:scale-105"
                >
                  Login as User
                </button>
                <button
                  onClick={() => navigate("/captainregister")}
                  className="w-full md:w-auto inline-flex items-center justify-center rounded-lg border border-white/30 bg-indigo-600 text-white px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:scale-105"
                >
                  Become a Driver
                </button>
              </div>
            </div>
          </div>
          {/* animated gradient/lines backdrop */}
          <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden>
            <div className="[background:radial-gradient(600px_circle_at_0%_0%,white,transparent_35%),radial-gradient(600px_circle_at_100%_0%,white,transparent_35%)] w-full h-full" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white" aria-hidden="true"></div>
              <span className="text-lg font-semibold">Ride</span>
            </div>
            <p className="mt-3 text-sm text-gray-400">Building safer, smarter city travel.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a className="hover:text-white" href="#">About</a></li>
              <li><a className="hover:text-white" href="#">Safety</a></li>
              <li><a className="hover:text-white" href="#">Help</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a className="hover:text-white" href="mailto:support@example.com">support@example.com</a></li>
              <li><a className="hover:text-white" href="#">Twitter</a></li>
              <li><a className="hover:text-white" href="#">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-gray-400">
            <span>© {new Date().getFullYear()} Ride. All rights reserved.</span>
            <span>Made with 💜</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LaunchPage;