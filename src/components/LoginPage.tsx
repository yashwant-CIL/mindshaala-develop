import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Shield, TrendingUp, Target, User, Mail, Phone, Lock, ArrowLeft } from 'lucide-react';
import mindshaalLogo from 'figma:asset/mindshaalaNew-logoCrop.png';
import { AuthService } from '../services/AuthServices';
import { useToast } from '../hooks/use-toast';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginPageProps {
  onLogin: (phone: string, initialPage?: string) => void;
  onBack?: () => void;
  initialMode?: 'login' | 'register';
}

export function LoginPage({ onLogin, onBack, initialMode = 'login' }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first OTP input when OTP screen appears
  useEffect(() => {
    if (otpSent && otpInputs.current[0]) {
      otpInputs.current[0].focus();
    }
  }, [otpSent]);

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (phone.length === 10) {
      setIsLoading(true);
      try {
        await AuthService.sendOtp("91" + phone);
        setOtpSent(true);
        toast({ title: "OTP Sent", description: "Please check your mobile for the OTP." });
      } catch (error: any) {
        toast({ title: "Error", description: error?.response?.data?.message || "Failed to send OTP", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otp;
    if (fullOtp.length === 6) {
      setIsLoading(true);
      try {
        let data;
        if (mode === 'login') {
          data = await AuthService.verifyOtp("91" + phone, fullOtp);
        } else {
          data = await AuthService.registerUser({
            first_name: firstName,
            last_name: lastName,
            mobile_number: `91${phone}`,
            email: email,
            role_id: 100001,
            otp: fullOtp,
          });
        }

        console.log("Auth response:", data);

        if (data && data.jwt_token) {
          // Set tokens in Cookies
          Cookies.set('token', data.jwt_token, { expires: 7 });
          if (data.token_version) {
            Cookies.set('token_version', data.token_version.toString(), { expires: 7 });
          }

          // Set user information in localStorage
         
          if (data) {
            localStorage.setItem('userData', JSON.stringify(data));
            localStorage.setItem('username', data.username || (firstName + " " + lastName).trim() || '');
            localStorage.setItem('user_id', data.user_id?.toString() || '');
            
            Cookies.set('username', data.username || (firstName + " " + lastName).trim() || '', { expires: 7 });
            Cookies.set('user_id', data.user_id?.toString() || '', { expires: 7 });
          }

          toast({ title: mode === 'login' ? "Login Successful" : "Registration Successful", description: "Welcome to MindShaala!" });

          // Navigate to dashboard or courses via onLogin callback
          if (onLogin) {
            onLogin(phone, mode === 'register' ? 'courses' : 'dashboard');
          }
        } else {
          toast({ 
            title: "Action Failed", 
            description: data?.message || "No session token received.", 
            variant: "destructive" 
          });
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || "Something went wrong. Please try again.";
        toast({ 
          title: "Error", 
          description: errorMessage, 
          variant: "destructive" 
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    if (!digit && value !== "") return;

    const newOtp = otp.split('');
    newOtp[index] = digit;
    const updatedOtp = newOtp.join('');
    setOtp(updatedOtp);

    if (digit && index < 5 && otpInputs.current[index + 1]) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      setOtp(pastedData.padEnd(6, ' ').slice(0, 6).trim());
      const nextIndex = Math.min(pastedData.length, 5);
      otpInputs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900 flex flex-col lg:flex-row overflow-hidden relative font-sans">
      {/* Dynamic Background Elements - Light Version */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-blue-400/10 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-indigo-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Left Section - Hero/Branding (Light) */}
      <div className="hidden lg:flex lg:w-1/2 p-16 flex-col justify-between relative z-10">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
        >
          <div className="mb-16 inline-block cursor-pointer" onClick={onBack}>
            <img src={mindshaalLogo} alt="MindShaala" className="h-20 w-auto" />
          </div>
          
          <div className="max-w-xl space-y-8">
            <h1 className="text-6xl font-black leading-tight tracking-tight text-gray-900">
              Personalized Learning <br/>
              <span className="text-blue-600 italic font-medium">for every student.</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium leading-relaxed">
              Experience the power of AI-driven education. Master JEE, NEET, and Board exams with our adaptive learning ecosystem.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-12">
               {[
                 { icon: Target, title: "Precision", desc: "Adaptive AI-based assessments", color: "blue" },
                 { icon: TrendingUp, title: "Growth", desc: "Customized learning trajectories", color: "indigo" },
                 { icon: Shield, title: "Excellence", desc: "Top-tier curated test series", color: "purple" },
                 { icon: Brain, title: "Insights", desc: "Deep performance analytics", color: "blue" }
               ].map((feature, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.5 + (i * 0.1) }}
                   className="p-5 rounded-2xl bg-white/60 border border-white shadow-sm hover:shadow-md transition-all group"
                 >
                   <feature.icon className={`w-6 h-6 text-${feature.color}-600 mb-2 group-hover:scale-110 transition-transform`} />
                   <h3 className="font-bold text-gray-900">{feature.title}</h3>
                   <p className="text-gray-500 text-xs leading-tight">{feature.desc}</p>
                 </motion.div>
               ))}
            </div>
          </div>
        </motion.div>

        <div className="text-gray-400 text-sm font-medium">
          © {new Date().getFullYear()} MindShaala • Empowering Excellence
        </div>
      </div>

      {/* Right Section - Light Form Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-10 cursor-pointer" onClick={onBack}>
           <img src={mindshaalLogo} alt="MindShaala" className="h-10 w-auto" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[480px] bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
          {/* Back Button */}
          {!otpSent && (
            <button 
              onClick={onBack}
              className="absolute top-6 left-6 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all group z-20"
              title="Back to Landing Page"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          )}

          <AnimatePresence mode="wait">
            {!otpSent ? (
              <motion.div
                key="input-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-10 text-center lg:text-left">
                  <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-gray-500 font-medium">
                    {mode === 'login' ? 'Sign in to access your dashboard' : 'Join thousands of students on their path to success'}
                  </p>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-5">
                  {mode === 'register' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 font-sans">First Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="John"
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-gray-300 font-medium text-gray-900 shadow-sm"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 font-sans">Last Name</label>
                        <div className="relative group">
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Doe"
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-gray-300 font-medium text-gray-900 shadow-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {mode === 'register' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 font-sans">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john.doe@example.com"
                          className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-gray-300 font-medium text-gray-900 shadow-sm"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 font-sans">Mobile Number</label>
                    <div className="flex gap-3">
                      <div className="flex items-center justify-center px-4 py-3.5 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 font-bold shadow-sm">
                        +91
                      </div>
                      <div className="relative flex-1 group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="9876543210"
                          className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-gray-300 font-medium text-gray-900 shadow-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={phone.length !== 10 || isLoading}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  >
                    {isLoading ? (
                      <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>Get Authentication Code</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-gray-50">
                   <p className="text-gray-500 font-medium">
                     {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                     <button 
                       onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                       className="ml-2 text-blue-600 hover:text-blue-700 font-bold underline underline-offset-4 decoration-2"
                     >
                       {mode === 'login' ? 'Register Now' : 'Sign In'}
                     </button>
                   </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <button 
                  onClick={() => { setOtpSent(false); setOtp(''); }}
                  className="flex items-center gap-2 text-gray-400 hover:text-blue-600 mb-8 transition-colors text-sm font-bold"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Edit Details
                </button>

                <div className="mb-10 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                     <Lock className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Verify Security Code</h2>
                  <p className="text-gray-500 font-medium">Check your messages for the 6-digit code sent to <span className="text-blue-600">+91 {phone}</span></p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-8">
                  <div className="flex justify-between gap-3">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={otp[index] || ''}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        ref={(el) => { otpInputs.current[index] = el; }}
                        className="w-full aspect-square bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-600 outline-none text-center text-3xl font-black text-gray-900 transition-all shadow-sm"
                        required
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={otp.length !== 6 || isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <span>Complete Verification</span>
                    )}
                  </button>

                  <div className="text-center pt-4">
                    <button type="button" onClick={handleSendOTP} className="text-gray-400 hover:text-blue-600 font-bold text-sm transition-colors">
                      Didn't redive the code? <span className="text-blue-600">Resend Code</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <p className="mt-10 text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">
           Secure Infrastructure • Trusted by Toppers
        </p>
      </div>
    </div>
  );
}

// Internal feature icon helper
const Brain = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);