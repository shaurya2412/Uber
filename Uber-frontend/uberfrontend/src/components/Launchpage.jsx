// src/pages/LaunchPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import uber_india from "../assets/uber_india.png";
import nexuslogo from "../assets/nexuslogo.png";
import nexus from "../assets/nexus.png";



const LaunchPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-white text-gray-900 font-sans antialiased overflow-x-hidden">
      
      {/* PREMIUM NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/95 backdrop-blur-xl shadow-sm">
        <nav className="max-w-7xl mx-auto px-3 md:px-12 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <img 
              src={nexuslogo} 
              alt="Nexus Ride Logo" 
              className="h-10 w-auto object-contain"
            />
            <h1 className="text-xl font-light text-gray-900 tracking-tight">
              Nexus
            </h1>
          </motion.div>

          {/* <ul className="hidden lg:flex items-center gap-12 text-sm font-medium text-gray-700">
            {["Home", "About", "Features", "How It Works", "Testimonials", "Contact"].map((item, idx) => (
              <motion.li 
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:text-gray-900 transition-all duration-300 cursor-pointer relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
              </motion.li>
            ))}
          </ul> */}

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-light text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/Welcome")}
              className="px-6 py-2.5 bg-gray-950 text-white rounded-xl text-sm font-semibold border border-gray-800 shadow-[0_14px_35px_rgba(15,23,42,0.55)] hover:shadow-[0_18px_45px_rgba(15,23,42,0.75)] hover:border-gray-600 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </motion.div>
        </nav>
      </header>

      {/* PREMIUM HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-12 pt-4 pb-24 md:pt-16 md:pb-32">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-12 right-20 w-96 h-96 bg-gradient-to-br from-gray-100/50 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-gray-100/50 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          
          {/* LEFT CONTENT */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200/60 text-xs uppercase tracking-[0.3em] text-gray-600 px-5 py-2.5 rounded-full shadow-sm"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Premium Ride Experience
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Your journey,<br className="hidden md:block" />
              </span>
              <span className="bg-gradient-to-r from-gray-700 to-gray-500 bg-clip-text text-transparent">
                elevated.
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-xl font-light">
              Experience luxury transportation reimagined. Book premium rides with vetted drivers, enjoy seamless booking, and travel in comfort with our executive fleet.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-gray-950 text-white rounded-xl font-semibold border border-gray-800 shadow-[0_18px_45px_rgba(15,23,42,0.7)] hover:shadow-[0_22px_55px_rgba(15,23,42,0.85)] hover:border-gray-600 transition-all duration-300 text-base"
              >
                Book Your Ride
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/Welcome")}
                className="px-8 py-4 bg-neutral-950 text-gray-100 border border-gray-700/80 rounded-xl font-medium shadow-[0_14px_35px_rgba(15,23,42,0.65)] hover:border-gray-500 hover:shadow-[0_18px_45px_rgba(15,23,42,0.85)] transition-all duration-300 text-base"
              >
                Sign up
              </motion.button>
            </div>

            {/* App Store Badges */}
            <div className="flex flex-wrap gap-4 pt-4">
              {/* <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm-.96-3.66l2.27-2.27L21.95 2.66l-8.49 8.49z"/>
                  </svg>
                </div>
               
              </motion.button> */}
{/* 
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-900 rounded-xl shadow-lg hover:shadow-xl hover:border-gray-300 transition-all duration-300"
              >
                <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.96-3.24-.96-1.24 0-2.06.46-3.27.98-1.31.56-2.68.88-4.19.88-3.41 0-5.77-2.11-5.77-5.55 0-3.02 2.05-5.86 5.17-5.86 1.1 0 2.05.39 2.81 1.07.91.83 1.21 1.31 1.87 1.31.63 0 1.02-.52 1.82-1.28 1.18-1.14 2.76-1.84 4.22-1.84 2.88 0 4.93 1.88 4.93 5.02 0 1.74-.63 3.78-1.62 5.08zm-1.82-12.89c.06-.71.12-1.65-.23-2.39-.42-1.02-1.28-1.84-2.79-2.38-1.2-.41-2.78-.49-4.09-.07-1.05.34-1.91 1.05-2.5 1.94-.84 1.25-.98 2.64-.93 4.07 1.33.08 2.69.32 3.81.82 1.76.77 2.96 2.04 3.35 3.68.06-.62.11-1.24.11-1.86.01-1.68-.18-3.2-.53-4.16z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-widest text-gray-600">Download on the</p>
                  <p className="text-sm font-bold">App Store</p>
                </div>
              </motion.button> */}
            </div>

            {/* Scroll indicator */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-gray-400 uppercase tracking-[0.2em] pt-6 flex items-center gap-2"
            >
              <span>Scroll to explore</span>
              <motion.span
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="inline-block"
              >
                ↓
              </motion.span>
            </motion.p>
          </motion.div>

          {/* RIGHT - PHONE MOCKUP */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center items-center lg:justify-end perspective-[1600px]"
          >
            {/* Background layers for depth */}
            <div className="absolute w-[420px] h-[580px] bg-gradient-to-br from-slate-900/80 via-slate-800/40 to-slate-900/0 rounded-[56px] -right-10 top-10 shadow-[0_40px_90px_rgba(15,23,42,0.8)] blur-3xl"></div>
            <div className="absolute w-[420px] h-[580px] bg-gradient-to-br from-slate-900/70 via-slate-800/40 to-slate-700/0 rounded-[56px] -right-6 top-6 border border-slate-700/40"></div>
            
            {/* Main angled phone */}
            <motion.div
              whileHover={{ rotateY: -6, rotateX: 4, y: -6 }}
              className="relative w-[420px] h-[620px] rounded-[56px] overflow-hidden border border-slate-700/70 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-[0_28px_70px_rgba(15,23,42,0.95)] origin-bottom-right transform rotate-[10deg]"
            >
              <div className="absolute top-0 left-0 right-0 h-12 bg-black/60 backdrop-blur-md rounded-t-[48px] flex items-center justify-center">
                <div className="w-28 h-1.5 bg-slate-600/80 rounded-full"></div>
              </div>
              <img
                src={nexus}
                className="w-full h-full object-cover mt-10 opacity-[0.98]"
                alt="Nexus app preview"
              />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* PREMIUM STATS SECTION */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {[
            { value: "10k+", label: "Expert Drivers", icon: "👨‍✈️" },
            { value: "100k+", label: "Happy Riders", icon: "😊" },
            { value: "24/7", label: "Support", icon: "💬" },
            { value: "4.9", label: "Rating", icon: "⭐" },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-800/80 shadow-[0_18px_45px_rgba(15,23,42,0.9)] hover:shadow-[0_22px_55px_rgba(15,23,42,1)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl mb-3">{stat.icon}</div>
              <p className="text-4xl font-semibold text-white mb-2">{stat.value}</p>
              <p className="text-sm text-gray-400 font-light">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PREMIUM ABOUT SECTION */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200/50 to-gray-100/30 rounded-3xl blur-2xl"></div>
            <div className="relative w-full h-96 rounded-3xl bg-gradient-to-br from-gray-100 to-white border border-gray-200/60 shadow-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.03),transparent_70%)]"></div>
              <div className="text-center space-y-4">
                <div className="w-80 h-80 mx-auto bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center shadow-xl">
                  <img src={nexuslogo}/>
                </div>
                <p className="text-sm uppercase tracking-[0.3em] text-gray-500 font-semibold">Since 2024</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-block bg-gray-100 px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em] text-gray-600 font-semibold">
              About Us
            </div>
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 leading-tight tracking-tight">
              Premium transportation,<br />redefined.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Nexus brings together precision engineering, vetted professional drivers, and an intuitive interface designed for modern urban commuters. We prioritize safety, comfort, and seamless experiences in every journey.
            </p>
            <div className="flex gap-6 pt-2">
              <div>
                <p className="text-3xl font-semibold text-gray-900">58+</p>
                <p className="text-sm text-gray-600 mt-1 uppercase tracking-wider font-light">Cities</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-gray-900">3min</p>
                <p className="text-sm text-gray-600 mt-1 uppercase tracking-wider font-light">Avg Wait</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PREMIUM FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-block bg-gray-100 px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em] text-gray-600 font-semibold mb-6">
            Why Choose Us
          </div>
          <h2 className="text-5xl font-extralight text-gray-900 mb-6 tracking-tight">
            Experience the difference
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every detail crafted for your comfort and convenience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">
          {[
            {
              title: "Transparent Pricing",
              desc: "No hidden fees. See your fare upfront with complete transparency.",
              icon: "💰"
            },
            {
              title: "Verified Safety",
              desc: "All drivers undergo rigorous background checks and continuous monitoring.",
              icon: "🛡️"
            },
            {
              title: "Luxury Fleet",
              desc: "Premium vehicles with immaculate interiors and modern amenities.",
              icon: "🚗"
            },
            {
              title: "24/7 Support",
              desc: "Round-the-clock concierge service for all your travel needs.",
              icon: "📞"
            },
          ].map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-8 border border-slate-800/80 shadow-[0_18px_45px_rgba(15,23,42,0.85)] hover:shadow-[0_22px_55px_rgba(15,23,42,1)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-light text-white mb-3 tracking-wide">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PREMIUM HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-block bg-gray-100 px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em] text-gray-600 font-semibold mb-6">
            Simple Process
          </div>
          <h2 className="text-5xl font-extralight text-gray-900 mb-6 tracking-tight">
            Three steps to your destination
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7">
          {[
            {
              step: "01",
              title: "Book",
              desc: "Select your pickup location, destination, and preferred vehicle type in seconds."
            },
            {
              step: "02",
              title: "Match",
              desc: "Get instantly paired with a verified driver and track their arrival in real-time."
            },
            {
              step: "03",
              title: "Ride",
              desc: "Enjoy a comfortable journey with premium amenities and professional service."
            },
          ].map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="relative bg-white rounded-3xl p-8 md:p-10 border border-gray-200/60 shadow-xl"
            >
              <div className="absolute top-6 right-6 text-7xl font-black text-gray-100">{item.step}</div>
              <h3 className="text-3xl font-light text-gray-900 mb-4 relative z-10 tracking-wide">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed relative z-10">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PREMIUM TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-block bg-gray-100 px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em] text-gray-600 font-semibold mb-6">
            Testimonials
          </div>
          <h2 className="text-5xl font-extralight text-gray-900 mb-6 tracking-tight">
            Loved by thousands
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7">
          {[
            {
              quote: "Nexus transformed my daily commute. The app is intuitive and every driver is professional.",
              author: "Sarah Chen",
              role: "Product Manager"
            },
            {
              quote: "Best ride service I've used. Premium vehicles and always on time. Highly recommend!",
              author: "Michael Park",
              role: "Tech Executive"
            },
            {
              quote: "The booking process is seamless and the service quality is consistently excellent.",
              author: "Emily Johnson",
              role: "Design Director"
            },
          ].map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-7 border border-slate-800/80 shadow-[0_18px_45px_rgba(15,23,42,0.85)] hover:shadow-[0_22px_55px_rgba(15,23,42,1)] transition-all duration-300"
            >
              <div className="text-yellow-400 text-xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-200 leading-relaxed mb-6 text-lg">"{testimonial.quote}"</p>
              <div>
                <p className="font-light text-white tracking-wide">{testimonial.author}</p>
                <p className="text-sm text-gray-400">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PREMIUM CTA */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-black via-slate-950 to-slate-900 rounded-3xl p-10 md:p-14 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <h3 className="text-4xl md:text-5xl font-extralight mb-4 tracking-tight">Ready to drive with us?</h3>
              <p className="text-xl text-gray-300 max-w-2xl">
                Join our network of premium drivers and start earning with Nexus today.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/captainRegister")}
              className="px-10 py-5 bg-white text-gray-900 rounded-xl font-semibold text-lg border border-white/60 shadow-[0_22px_55px_rgba(15,23,42,0.95)] hover:shadow-[0_26px_65px_rgba(15,23,42,1)] transition-all duration-300"
            >
              Become a Driver
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* PREMIUM FOOTER */}
      <footer className="bg-gradient-to-br from-black via-slate-950 to-slate-900 border-t border-gray-800/80 py-12 md:py-14 mt-12 text-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-400 flex items-center justify-center shadow-[0_14px_35px_rgba(15,23,42,0.9)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="black">
                    <rect x="2" y="8" width="20" height="8" rx="2" />
                  </svg>
                </div>
                <span className="text-xl font-light text-white tracking-tight">Nexus</span>
              </div>
              <p className="text-gray-400">Premium transportation redefined for modern cities.</p>
            </div>

            <div>
              <h4 className="font-light text-white mb-4 tracking-wide">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-light text-white mb-4 tracking-wide">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-light text-white mb-4 tracking-wide">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© 2025 Nexus. All rights reserved.</p>
            <div className="flex gap-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Facebook</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LaunchPage;
