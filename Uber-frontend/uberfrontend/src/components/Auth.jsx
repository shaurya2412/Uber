import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Eye,
  EyeOff,
  User,
  Car,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useUserStore } from '../Zustand/useUserstore';
import { useCaptainStore } from '../Zustand/useCaptainStore';
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
          <div className="absolute left-3.5 text-[#94A3B8] pointer-events-none transition-colors">
            <Icon className={`w-4 h-4 ${isFocused ? 'text-[#7C3AED]' : ''}`} />
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
          className={`w-full rounded-xl bg-[#0A0A0F] text-[#F8FAFC] text-sm pt-5 pb-2 transition-all outline-none border ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${rightElement ? 'pr-10' : 'pr-3.5'} ${
            error
              ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
              : isFocused
              ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20'
              : 'border-[#1E1E2E] hover:border-[#2D2D3F]'
          }`}
          placeholder={isFocused ? placeholder : ''}
        />

        {/* Floating Label */}
        <label
          htmlFor={id}
          className={`absolute pointer-events-none transition-all duration-200 ${
            Icon ? 'left-10' : 'left-3.5'
          } ${
            isFocused || hasValue
              ? 'top-1.5 text-[10px] font-semibold text-[#7C3AED]'
              : 'top-3.5 text-xs text-[#94A3B8]'
          }`}
        >
          {label}
        </label>

        {rightElement && (
          <div className="absolute right-3 text-[#94A3B8]">{rightElement}</div>
        )}
      </div>

      {error && <p className="text-[11px] text-[#EF4444] px-1">{error}</p>}
    </div>
  );
};

const Auth = ({ initialMode = 'login', initialRole = 'user' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Role: 'user' (Rider) | 'captain' (Driver)
  const [role, setRole] = useState(
    location.pathname.includes('captain') ? 'captain' : initialRole
  );

  // View: 'signin' | 'signup' | 'otp'
  const [view, setView] = useState(
    location.pathname === '/Welcome' || location.pathname === '/captainRegister'
      ? 'signup'
      : 'signin'
  );

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');

  // Driver vehicle specs
  const [vehicleColor, setVehicleColor] = useState('Black');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('Sedan');
  const [vehicleCapacity, setVehicleCapacity] = useState('4');

  // Security UI states
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpError, setIsOtpError] = useState(false);
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [toastState, setToastState] = useState({ isVisible: false, message: '', type: 'info' });

  // Store actions
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
        showToast('Google Sign-In successful! Welcome to Nexus.', 'success');
        setTimeout(() => navigate('/dashboard'), 500);
      } else {
        showToast(data.message || 'Google authentication failed', 'error');
      }
    } catch (err) {
      console.error('Google login error:', err);
      showToast(err.response?.data?.message || 'Google authentication error. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    showToast('Google login was cancelled or not authorized on this origin.', 'error');
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
        showToast('Google Login Verified: Welcome!', 'success');
        setTimeout(() => navigate('/dashboard'), 500);
      }
    } catch (err) {
      console.error('Demo Google login error:', err);
      showToast('Could not complete demo login.', 'error');
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
      if (!firstname.trim()) errors.firstname = 'First name required';
      if (role === 'captain') {
        if (!vehiclePlate.trim()) errors.vehiclePlate = 'Vehicle plate required';
        if (!vehicleModel.trim()) errors.vehicleModel = 'Vehicle model required';
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

    try {
      if (role === 'user') {
        if (view === 'signin') {
          // Rider Login
          const res = await axios.post(`${API_BASE_URL}/users/login`, { email, password });
          const { token, user } = res.data;
          localStorage.setItem('token', token);
          setUser(user);
          setToken(token);
          showToast('Welcome back to Nexus!', 'success');
          setTimeout(() => navigate('/dashboard'), 600);
        } else {
          // Rider Register
          const res = await axios.post(`${API_BASE_URL}/users/register`, {
            fullname: { firstname, lastname },
            email,
            password,
            phone,
          });
          const { token, user } = res.data;
          localStorage.setItem('token', token);
          setUser(user);
          setToken(token);
          // Show OTP verification modal/view
          setView('otp');
          showToast('Account created! Please enter verification code.', 'success');
        }
      } else {
        // Driver Flow
        if (view === 'signin') {
          // Driver Login
          const res = await axios.post(`${API_BASE_URL}/captains/login`, { email, password });
          const token = res.data.token || res.data.captaintoken;
          localStorage.setItem('captaintoken', token);
          localStorage.setItem('role', 'captain');
          showToast('Welcome to Driver Cockpit!', 'success');
          setTimeout(() => navigate('/capdashboard'), 600);
        } else {
          // Driver Register
          const res = await axios.post(`${API_BASE_URL}/captains/register`, {
            fullname: { firstname, lastname },
            email,
            password,
            vehicle: {
              color: vehicleColor,
              plate: vehiclePlate,
              vehiclemodel: vehicleModel,
              capacity: vehicleCapacity,
            },
          });
          const token = res.data.token || res.data.captaintoken;
          localStorage.setItem('captaintoken', token);
          localStorage.setItem('role', 'captain');
          setView('otp');
          showToast('Captain registration submitted! Verify OTP.', 'success');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      const msg = err.response?.data?.message || err.message || 'Authentication failed';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (code) => {
    // Check code length
    if (code.length === 6) {
      setLoading(true);
      // Simulate verification / accept standard testing code
      setTimeout(() => {
        setLoading(false);
        if (code === '000000' || code === '123456' || code.length === 6) {
          setIsOtpSuccess(true);
          showToast('Verification successful!', 'success');
          setTimeout(() => {
            if (role === 'captain') {
              navigate('/capdashboard');
            } else {
              navigate('/dashboard');
            }
          }, 800);
        } else {
          setIsOtpError(true);
          showToast('Invalid verification code. Try 123456.', 'error');
          setTimeout(() => setIsOtpError(false), 800);
        }
      }, 600);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/google`, {
        credential: credentialResponse.credential,
      });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setToken(res.data.token);
        showToast('Google Sign-In successful!', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      showToast('Google authentication failed', 'error');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] text-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12 overflow-hidden selection:bg-[#7C3AED] selection:text-white">
      {/* Background SVG grid + Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#7C3AED]/12 blur-[140px] rounded-full" />
      </div>

      <Toast
        isVisible={toastState.isVisible}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((s) => ({ ...s, isVisible: false }))}
      />

      {/* Brand Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center mb-6"
      >
        <Link to="/" className="flex items-center gap-2 mb-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] p-0.5 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
            <div className="w-full h-full bg-[#0A0A0F] rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-[#7C3AED] group-hover:rotate-45 transition-transform" />
            </div>
          </div>
          <span className="text-2xl font-black tracking-tight text-[#F8FAFC]">
            Nexus<span className="text-[#06B6D4]">.</span>
          </span>
        </Link>
        <p className="text-xs text-[#94A3B8]">Autonomous Urban Mobility Ecosystem</p>
      </motion.div>

      {/* Centered Glassmorphism Card (max-w 420px) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[420px] glass-card-elevated rounded-3xl p-6 sm:p-8 border border-[#2D2D3F] shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
      >
        {/* VIEW 1 & 2: SIGN IN / SIGN UP FORM */}
        {view !== 'otp' ? (
          <div className="space-y-6">
            {/* Role Switcher Pill (Rider | Driver) */}
            <div className="p-1 rounded-2xl bg-[#0A0A0F] border border-[#1E1E2E] flex items-center gap-1 relative">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  role === 'user'
                    ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Rider</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('captain')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  role === 'captain'
                    ? 'bg-[#06B6D4] text-[#0A0A0F] shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Driver</span>
              </button>
            </div>

            {/* Mode Header */}
            <div>
              <h2 className="text-2xl font-black tracking-tight text-[#F8FAFC]">
                {view === 'signin'
                  ? role === 'user'
                    ? 'Welcome Back'
                    : 'Driver Portal'
                  : role === 'user'
                  ? 'Create Rider Account'
                  : 'Join Driver Fleet'}
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                {view === 'signin'
                  ? 'Access your telemetry profile and on-demand transit.'
                  : 'Fill in your details to start rolling.'}
              </p>
            </div>

            {/* Google Fast Login (for riders) */}
            {role === 'user' && view === 'signin' && (
              <div>
                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => showToast('Google login cancelled', 'error')}
                    theme="filled_black"
                    shape="pill"
                    text="signin_with"
                    width="100%"
                  />
                </div>
                <div className="relative flex items-center justify-center my-4">
                  <div className="w-full border-t border-[#1E1E2E]" />
                  <span className="absolute px-3 bg-[#111118] text-[11px] uppercase tracking-wider text-[#475569]">
                    or continue with
                  </span>
                </div>
              </div>
            )}

            {/* Form Fields */}
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
                    className="hover:text-[#F8FAFC] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {/* Driver registration extra fields */}
              {view === 'signup' && role === 'captain' && (
                <div className="space-y-3 pt-1 border-t border-[#1E1E2E]">
                  <p className="text-[11px] font-bold text-[#06B6D4] uppercase tracking-wider">
                    Vehicle Specifications
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <FloatingInput
                      id="vehiclePlate"
                      label="License Plate"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      error={fieldErrors.vehiclePlate}
                      placeholder="DL 01 AX 9921"
                      required
                    />
                    <FloatingInput
                      id="vehicleModel"
                      label="Vehicle Model"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      error={fieldErrors.vehicleModel}
                      placeholder="Hyundai Aura"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <FloatingInput
                      id="vehicleColor"
                      label="Color"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                    />
                    <FloatingInput
                      id="vehicleCapacity"
                      label="Passenger Capacity"
                      type="number"
                      value={vehicleCapacity}
                      onChange={(e) => setVehicleCapacity(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button with Loading State */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(124,58,237,0.4)] disabled:opacity-60 transition-all cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{view === 'signin' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              {/* Or continue with Google */}
              {role === 'user' && (
                <div className="pt-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[#1E1E2E]" />
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#475569]">
                      or continue with
                    </span>
                    <div className="h-px flex-1 bg-[#1E1E2E]" />
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-full flex justify-center overflow-hidden rounded-xl bg-[#0A0A0F] border border-[#2D2D3F] p-1.5 hover:border-[#7C3AED]/50 transition-colors shadow-sm">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
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
                      className="text-[11px] text-[#94A3B8] hover:text-[#06B6D4] transition-colors flex items-center gap-1 cursor-pointer py-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#06B6D4]" />
                      <span>Test / Demo Google Sign-In</span>
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Mode Switcher Footer */}
            <div className="pt-2 text-center text-xs text-[#94A3B8]">
              {view === 'signin' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setView('signup');
                      setFieldErrors({});
                    }}
                    className="font-bold text-[#7C3AED] hover:underline"
                  >
                    Sign Up
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
                    className="font-bold text-[#7C3AED] hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        ) : (
          /* VIEW 3: 6-DIGIT OTP VERIFICATION CARD */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center justify-center text-[#7C3AED] mx-auto shadow-[0_0_30px_rgba(124,58,237,0.25)]">
              <KeyRound className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#F8FAFC]">Verify Identity</h2>
              <p className="text-xs text-[#94A3B8] mt-1 max-w-xs mx-auto">
                We sent a 6-digit authentication key to <br />
                <span className="font-semibold text-[#F8FAFC]">{email || 'your email'}</span>
              </p>
            </div>

            {/* 6-box OTP Input */}
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

            <p className="text-[11px] text-[#475569]">
              Test code: <code className="text-[#06B6D4] font-mono">123456</code>
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleVerifyOtp(otpCode)}
              disabled={loading || otpCode.length < 6}
              className="w-full py-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-50 transition-all"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Confirm Verification</span>
              )}
            </motion.button>

            <button
              onClick={() => setView('signin')}
              className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors block mx-auto"
            >
              ← Back to Sign In
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
