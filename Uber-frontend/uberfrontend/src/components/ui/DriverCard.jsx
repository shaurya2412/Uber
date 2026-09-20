import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, Star, ShieldCheck, Car } from 'lucide-react';

const DriverCard = ({
  driver,
  eta,
  onCall,
  onChat,
  className = '',
}) => {
  const firstname = driver?.fullname?.firstname || driver?.name || 'Marcus';
  const lastname = driver?.fullname?.lastname || 'L.';
  const rating = driver?.rating ? Number(driver.rating).toFixed(1) : '4.9';
  const vehicleModel = driver?.vehicle?.vehiclemodel || driver?.vehicle?.model || 'Tesla Model 3';
  const vehicleColor = driver?.vehicle?.color || 'Midnight Silver';
  const plate = driver?.vehicle?.plate || 'DL 01 AX 9921';
  const avatar = driver?.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`glass-card-elevated rounded-2xl p-4 border border-[#2D2D3F] shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${className}`}
    >
      {/* Top row: Avatar, Info, ETA badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={avatar}
              alt={firstname}
              className="w-13 h-13 rounded-full object-cover border-2 border-[#7C3AED]"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#10B981] p-0.5 rounded-full text-[#0A0A0F]">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-semibold text-base text-[#F8FAFC]">
                {firstname} {lastname}
              </h4>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#94A3B8] mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-[#F8FAFC]">{rating}</span>
              <span className="text-[#475569]">•</span>
              <span className="text-[#94A3B8]">Verified Driver</span>
            </div>
          </div>
        </div>

        {eta && (
          <div className="bg-[#7C3AED]/15 border border-[#7C3AED]/30 px-3 py-1.5 rounded-full text-right">
            <span className="text-[11px] font-semibold text-[#7C3AED] uppercase tracking-wide">
              {eta} mins away
            </span>
          </div>
        )}
      </div>

      {/* Middle row: Vehicle details & plate */}
      <div className="mt-3.5 p-2.5 rounded-xl bg-[#0A0A0F]/60 border border-[#1E1E2E] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-[#06B6D4]" />
          <div>
            <p className="text-xs font-medium text-[#F8FAFC]">{vehicleModel}</p>
            <p className="text-[10px] text-[#94A3B8]">{vehicleColor}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-[#111118] text-[#F8FAFC] font-mono text-xs font-bold rounded-lg border border-[#2D2D3F] tracking-wider">
          {plate}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 mt-3.5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onChat}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#1A1A24] hover:bg-[#2D2D3F] text-[#F8FAFC] text-xs font-medium border border-[#2D2D3F] transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Chat</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCall}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#1A1A24] hover:bg-[#2D2D3F] text-[#F8FAFC] text-xs font-medium border border-[#2D2D3F] transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span>Call</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DriverCard;
