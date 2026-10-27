import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  User,
  Car,
  Mail,
  Lock,
  ArrowRight,
  KeyRound,
  Check,
} from 'lucide-react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useUserStore } from '../Zustand/useUserstore';
import OTPInput from './ui/OTPInput';
import Toast from './ui/Toast';
import { API_BASE_URL } from '../config';

const FloatingInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  icon: Icon,
  rightElement,
  error,
  placeholder = '',
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className="relative space-y-1">
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-[#A1A1AA] pointer-events-none transition-colors">
            <Icon className={`w-4 h-4 ${isFocused ? 'text-[#FAFAFA]' : ''}`} />
          </div>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          className={`w-full rounded-xl bg-[#09090B] text-[#FAFAFA] text-sm pt-5 pb-2 transition-all outline-none border ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${rightElement ? 'pr-10' : 'pr-3.5'} ${
            error
              ? 'border-[#EF4444]'
              : isFocused
              ? 'border-[#FAFAFA]'
              : 'border-white/[0.1] hover:border-white/20'
          }`}
          placeholder={isFocused ? placeholder : ''}
        />

        <label
          htmlFor={id}
          className={`absolute pointer-events-none transition-all duration-200 ${
            Icon ? 'left-10' : 'left-3.5'
          } ${
            isFocused || hasValue
              ? 'top-1.5 text-[10px] font-semibold text-[#10B981]'
              : 'top-3.5 text-xs text-[#A1A1AA]'
          }`}
        >
          {label}
        </label>

        {rightElement && (
          <div className="absolute right-3 text-[#A1A1AA]">{rightElement}</div>
        )}
      </div>

      {error && <p className="text-[11px] text-[#EF4444] px-1">{error}</p>}
    </div>
  );
};

const Auth = ({ initialMode = 'login', initialRole = 'user' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(
    location.pathname.includes('captain') ? 'captain' : initialRole
  );

  const [view, setView] = useState(
    location.pathname === '/Welcome' || location.pathname === '/captainRegister'
      ? 'signup'
      : 'signin'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');

  const [vehicleColor, setVehicleColor] = useState('White');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('Honda City');
  const [vehicleCapacity, setVehicleCapacity] = useState('4');

  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpError, setIsOtpError] = useState(false);
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [toastState, setToastState] = useState({ isVisible: false, message: '', type: 'info' });

  const setUser = useUserStore((state) => state.setUser);
  const setToken = useUserStore((state) => state.setToken);

  const showToast = (message, type = 'info') => {
    setToastState({ isVisible: true, message, type });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/auth/google`, {
        credential: credentialResponse.credential,
      });
      const data = res.data;
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
        setToken(data.token);
        showToast('Signed in with Google.', 'success');
        setTimeout(() => navigate('/dashboard'), 450);
      } else {
        showToast(data.message || 'Could not sign in with Google', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Google sign-in failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoGoogleLogin = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/auth/google`, {
        credential: 'test_google_credential',
      });
      const data = res.data;
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
        setToken(data.token);
        showToast('Signed in as demo rider.', 'success');
        setTimeout(() => navigate('/dashboard'), 450);
      }
    } catch {
      showToast('Could not complete instant sign-in.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (view === 'signup') {
      if (!firstname.trim() || firstname.trim().length < 3) {
        errors.firstname = 'First name must be at least 3 characters';
      }
      if (!lastname.trim() || lastname.trim().length < 2) {
        errors.lastname = 'Last name must be at least 2 characters';
      }
      if (role === 'captain') {
        if (!vehiclePlate.trim()) errors.vehiclePlate = 'Registration plate required';
        if (!vehicleModel.trim()) errors.vehicleModel = 'Car model required';
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setFieldErrors({});

    const cleanFirst = firstname.trim();
    const cleanLast = lastname.trim() || (role === 'captain' ? 'Partner' : 'Rider');

    try {
      if (role === 'user') {
        if (view === 'signin') {
          const res = await axios.post(`${API_BASE_URL}/users/login`, { email, password });
          const { token, user } = res.data;
          localStorage.setItem('token', token);
          setUser(user);
          setToken(token);
          showToast('Signed in.', 'success');
          setTimeout(() => navigate('/dashboard'), 500);
        } else {
          const res = await axios.post(`${API_BASE_URL}/users/register`, {
            fullname: { firstname: cleanFirst, lastname: cleanLast },
            name: { firstname: cleanFirst, lastname: cleanLast },
            email: email.trim(),
            password,
            phone,
          });
          const { token, user } = res.data;
          localStorage.setItem('token', token);
          setUser(user);
          setToken(token);
          setView('otp');
          showToast('Account created! Enter the 6-digit code to finish.', 'success');
        }
      } else {
        if (view === 'signin') {
          const res = await axios.post(`${API_BASE_URL}/captains/login`, { email, password });
          const token = res.data.token || res.data.captaintoken;
          localStorage.setItem('captaintoken', token);
          localStorage.setItem('role', 'captain');
          showToast('Signed in to Driver Console.', 'success');
          setTimeout(() => navigate('/capdashboard'), 500);
        } else {
          const res = await axios.post(`${API_BASE_URL}/captains/register`, {
            name: { firstname: cleanFirst, lastname: cleanLast },
            fullname: { firstname: cleanFirst, lastname: cleanLast },
            email: email.trim(),
            password,
            vehicle: {
              color: vehicleColor || 'White',
              plate: vehiclePlate.trim() || 'DL 01 AX 9921',
              vehiclemodel: vehicleModel || 'Sedan',
              capacity: String(vehicleCapacity || 4),
            },
          });
          const token = res.data.token || res.data.captaintoken;
          localStorage.setItem('captaintoken', token);
          localStorage.setItem('role', 'captain');
          setView('otp');
          showToast('Driver profile created! Verify your code.', 'success');
        }
      }
    } catch (err) {
      let msg = 'Sign in failed';
      if (err.response?.data?.error) {
        if (Array.isArray(err.response.data.error)) {
          msg = err.response.data.error.map((e) => e.msg).join(', ');
        } else if (typeof err.response.data.error === 'string') {
          msg = err.response.data.error;
        }
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (code) => {
    if (code.length === 6) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        if (code.length === 6) {
          setIsOtpSuccess(true);
          showToast('Verified!', 'success');
          setTimeout(() => {
            if (role === 'captain') {
              navigate('/capdashboard');
            } else {
              navigate('/dashboard');
            }
          }, 600);
        } else {
          setIsOtpError(true);
          showToast('Invalid code. Try 123456.', 'error');
          setTimeout(() => setIsOtpError(false), 800);
        }
      }, 450);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col justify-center items-center px-4 py-12 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern opacity-50" />

      <Toast
        isVisible={toastState.isVisible}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((s) => ({ ...s, isVisible: false }))}
      />

      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center mb-6"
      >
        <Link to="/" className="flex items-center gap-2.5 mb-1.5 group">
          <div className="w-9 h-9 rounded-lg bg-[#FAFAFA] text-[#09090B] flex items-center justify-center font-black text-base group-hover:bg-[#10B981] transition-colors">
            N
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#FAFAFA]">
            Nexus
          </span>
        </Link>
        <p className="text-xs text-[#A1A1AA]">City rides & driver partner console</p>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-[420px] rounded-2xl bg-[#121215] p-6 sm:p-8 border border-white/[0.1] shadow-[0_25px_60px_rgba(0,0,0,0.75)]"
      >
        <AnimatePresence mode="wait">
          {view !== 'otp' ? (
            <motion.div
              key={`${role}-${view}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Role Switcher */}
              <div className="p-1 rounded-xl bg-[#09090B] border border-white/[0.08] flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    role === 'user'
                      ? 'bg-[#FAFAFA] text-[#09090B]'
                      : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Rider</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('captain')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    role === 'captain'
                      ? 'bg-[#10B981] text-[#09090B]'
                      : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Driver Partner</span>
                </button>
              </div>

              {/* Heading */}
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-[#FAFAFA]">
                  {view === 'signin'
                    ? role === 'user'
                      ? 'Log in to your account'
                      : 'Driver Partner Sign In'
                    : role === 'user'
                    ? 'Create your rider account'
                    : 'Register as a Driver Partner'}
                </h2>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  {view === 'signin'
                    ? role === 'user'
                      ? 'Book city rides with upfront fares and instant receipts.'
                      : 'Go online, see drop-off locations upfront, and track daily payouts.'
                    : 'Takes less than 30 seconds to get started.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {view === 'signup' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <FloatingInput
                      id="firstname"
                      label="First Name"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      error={fieldErrors.firstname}
                      required
                    />
                    <FloatingInput
                      id="lastname"
                      label="Last Name"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      error={fieldErrors.lastname}
                    />
                  </div>
                )}

                <FloatingInput
                  id="email"
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={fieldErrors.email}
                  required
                />

                <FloatingInput
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={fieldErrors.password}
                  required
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="hover:text-[#FAFAFA] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                {view === 'signup' && role === 'captain' && (
                  <div className="space-y-3 pt-2 border-t border-white/[0.08]">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[#10B981]">
                      Vehicle Details
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <FloatingInput
                        id="vehiclePlate"
                        label="Registration Plate"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value)}
                        error={fieldErrors.vehiclePlate}
                        placeholder="DL 01 AX 9921"
                        required
                      />
                      <FloatingInput
                        id="vehicleModel"
                        label="Car Model"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        error={fieldErrors.vehicleModel}
                        placeholder="BYD e6 / Dzire"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <FloatingInput
                        id="vehicleColor"
                        label="Exterior Color"
                        value={vehicleColor}
                        onChange={(e) => setVehicleColor(e.target.value)}
                      />
                      <FloatingInput
                        id="vehicleCapacity"
                        label="Seats"
                        type="number"
                        value={vehicleCapacity}
                        onChange={(e) => setVehicleCapacity(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-2 rounded-xl bg-[#FAFAFA] hover:bg-white text-[#09090B] text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60 transition-all cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-[#09090B]/30 border-t-[#09090B] rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{view === 'signin' ? 'Continue' : 'Create Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>

                {role === 'user' && (
                  <div className="pt-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-white/[0.08]" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                        or
                      </span>
                      <div className="h-px flex-1 bg-white/[0.08]" />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div className="w-full flex justify-center overflow-hidden rounded-xl bg-[#09090B] border border-white/[0.1] p-1.5">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => showToast('Google login cancelled', 'error')}
                          useOneTap={false}
                          theme="filled_black"
                          shape="rectangular"
                          text="continue_with"
                          width="100%"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleDemoGoogleLogin}
                        className="text-xs text-[#A1A1AA] hover:text-[#10B981] transition-colors flex items-center gap-1.5 cursor-pointer py-1"
                      >
                        <Check className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>1-Click Instant Demo Rider Login</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>

              <div className="pt-2 text-center text-xs text-[#A1A1AA]">
                {view === 'signin' ? (
                  <p>
                    New to Nexus?{' '}
                    <button
                      onClick={() => {
                        setView('signup');
                        setFieldErrors({});
                      }}
                      className="font-bold text-[#FAFAFA] hover:text-[#10B981] underline cursor-pointer"
                    >
                      Create an account
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      onClick={() => {
                        setView('signin');
                        setFieldErrors({});
                      }}
                      className="font-bold text-[#FAFAFA] hover:text-[#10B981] underline cursor-pointer"
                    >
                      Log in
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="otp-view"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="space-y-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-[#FAFAFA]">Confirm your email</h2>
                <p className="text-xs text-[#A1A1AA] mt-1 max-w-xs mx-auto">
                  Enter the 6-digit code sent to{' '}
                  <span className="font-semibold text-[#FAFAFA]">{email || 'your email'}</span>
                </p>
              </div>

              <div className="py-2">
                <OTPInput
                  length={6}
                  value={otpCode}
                  onChange={setOtpCode}
                  onComplete={handleVerifyOtp}
                  isError={isOtpError}
                  isSuccess={isOtpSuccess}
                  disabled={loading}
                />
              </div>

              <p className="text-[11px] text-[#A1A1AA]">
                Demo verification code: <code className="text-[#10B981] font-mono">123456</code>
              </p>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVerifyOtp(otpCode)}
                disabled={loading || otpCode.length < 6}
                className="w-full py-3.5 rounded-xl bg-[#FAFAFA] hover:bg-white text-[#09090B] text-xs font-extrabold uppercase tracking-wider disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </motion.button>

              <button
                onClick={() => setView('signin')}
                className="text-xs text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors block mx-auto cursor-pointer"
              >
                ← Back to sign in
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Auth;
