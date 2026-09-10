import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Globe,
  MessageSquare,
  FileText,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  User,
  CheckCircle2,
  Eye,
  EyeOff,
  Camera,
  Upload,
  KeyRound,
  RotateCcw,
  Crown,
  Zap,
  Star,
  Award,
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ContextBadge } from '../components/ui/ContextBadge';
import { AvatarPickerModal } from '../components/ui/AvatarPickerModal';
import { LangToggle } from '../components/ui/LangToggle';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useLang } from '../hooks/useLang';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { AnimatedAuthBackground } from '../components/auth/AnimatedAuthBackground';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const { lang, isRTL } = useLang();
  const { loginUser, loginAsGuest } = useAuth();
  const { bgPattern } = useTheme();

  const [step, setStep] = useState<number>(1);

  // Auth Method State: 'login' | 'register' | 'google' | 'forgot_password'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'google' | 'forgot_password'>('login');
  const [emailInput, setEmailInput] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nexus_user_email') || '';
    }
    return '';
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifyingText, setVerifyingText] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Forgot Password / Reset Password state
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotCode, setForgotCode] = useState<string>('');
  const [forgotNewPassword, setForgotNewPassword] = useState<string>('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState<string>('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState<boolean>(false);

  // New Account Registration state
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState<boolean>(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState<boolean>(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState<boolean>(false);
  const [passwordMismatchError, setPasswordMismatchError] = useState<string | null>(null);

  // OTP Verification Modal state (for real Gmail email verification)
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('');
  const [simulatedOtp, setSimulatedOtp] = useState<string>('');
  const [otpResendTimer, setOtpResendTimer] = useState<number>(60);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerifying, setOtpVerifying] = useState<boolean>(false);
  const [otpVerifyingText, setOtpVerifyingText] = useState<string>('');

  // Device Linked Google Accounts
  const [googleAccounts, setGoogleAccounts] = useState<
    Array<{ email: string; name: string; avatar: string; isDevicePrimary?: boolean; isExistingInDatabase?: boolean }>
  >([
    {
      email: 'xxx230641@gmail.com',
      name: 'حساب الهاتف الرئيسي',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isDevicePrimary: true,
      isExistingInDatabase: false,
    },
    {
      email: 'ahmed.nexus@gmail.com',
      name: 'أحمد النكسوس (Google)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isDevicePrimary: false,
      isExistingInDatabase: true,
    },
  ]);

  useEffect(() => {
    fetch('/api/auth/google-accounts')
      .then((res) => res.json())
      .then((data) => {
        if (data.accounts && Array.isArray(data.accounts) && data.accounts.length > 0) {
          setGoogleAccounts(data.accounts);
        }
      })
      .catch(() => {});
  }, []);

  // Saved Recognized User Info
  const savedUserEmail = typeof window !== 'undefined' ? localStorage.getItem('nexus_user_email') : null;
  const savedUserName = typeof window !== 'undefined' ? localStorage.getItem('nexus_user_name') : null;
  const savedUserAvatar = typeof window !== 'undefined' ? localStorage.getItem('nexus_user_avatar') : null;

  const handleQuickRecognizedLogin = () => {
    if (!savedUserEmail) return;
    setVerifying(true);
    setVerifyingText(lang === 'ar' ? 'جاري التعرف وتسجيل الدخول المباشر...' : 'Recognizing user & logging in...');
    setTimeout(() => {
      loginUser(savedUserEmail, savedUserName || undefined, 'manual', savedUserAvatar || undefined);
      if (rememberMe) {
        localStorage.setItem('nexus_remember_me', 'true');
      }
      onComplete();
    }, 300);
  };

  // Avatar Selection State
  const [onboardingAvatar, setOnboardingAvatar] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80'
  );
  const [showAvatarPickerModal, setShowAvatarPickerModal] = useState<boolean>(false);

  // Multi-Provider Social SSO Modal State (Google, Microsoft, Apple, GitHub)
  const [selectedSsoProvider, setSelectedSsoProvider] = useState<'google' | 'microsoft' | 'apple' | 'github'>('google');
  const [showSocialModal, setShowSocialModal] = useState<boolean>(false);
  const [customSsoEmail, setCustomSsoEmail] = useState<string>('');

  const handleOpenSocialModal = (provider: 'google' | 'microsoft' | 'apple' | 'github') => {
    setSelectedSsoProvider(provider);
    setCustomSsoEmail('');
    setShowSocialModal(true);
  };

  // Step 2 Google connection state
  const [googleConnected, setGoogleConnected] = useState<boolean>(true);

  // Step 3 Selected Contexts state
  const [selectedContexts, setSelectedContexts] = useState<string[]>([
    'professional',
    'family',
    'learning',
    'social',
  ]);

  const toggleContext = (key: string) => {
    setSelectedContexts((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);

    const email = emailInput.trim();
    if (!email) {
      setEmailError(t('auth.emailLabel') + ' ' + (lang === 'ar' ? 'مطلوب' : 'is required'));
      return;
    }

    if (!passwordInput) {
      setEmailError(lang === 'ar' ? 'يرجى إدخال كلمة المرور.' : 'Please enter your password.');
      return;
    }

    if (passwordInput.length < 6) {
      setEmailError(lang === 'ar' ? 'كلمة المرور يجب أن تتكون من 6 رموز على الأقل.' : 'Password must be at least 6 characters.');
      return;
    }

    setVerifying(true);
    setVerifyingText(lang === 'ar' ? 'جاري تسجيل الدخول...' : 'Logging in...');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passwordInput }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errorType === 'incorrect_password') {
          setEmailError(
            lang === 'ar'
              ? data.messageAr || '❌ كلمة المرور التي أدخلتها غير صحيحة. يرجى إعادة التأكد من كلمة المرور.'
              : data.messageEn || '❌ Incorrect password. Please check your password and try again.'
          );
        } else if (data.errorType === 'email_not_found') {
          setEmailError(
            lang === 'ar'
              ? data.messageAr || '❌ هذا البريد الإلكتروني غير موجود في النظام. يرجى التأكد من كتابة البريد بشكل صحيح أو إنشاء حساب جديد.'
              : data.messageEn || '❌ Account not found. Please check your email address or register a new account.'
          );
        } else {
          setEmailError(
            lang === 'ar'
              ? data.messageAr || '❌ تعذر تسجيل الدخول. يرجى التأكد من بيانات الدخول.'
              : data.messageEn || '❌ Login failed. Please verify your credentials.'
          );
        }
      } else {
        setEmailSuccess(lang === 'ar' ? data.messageAr : data.messageEn);
        loginUser(data.user.email, data.user.name, 'manual', data.user.avatarUrl || onboardingAvatar);
        onComplete();
      }
    } catch (err) {
      console.error('Login error:', err);
      setEmailError(
        lang === 'ar'
          ? 'تعذر الاتصال بخادم المصادقة المحلي. يرجى المحاولة لاحقاً.'
          : 'Failed to connect to authentication server.'
      );
    } finally {
      setVerifying(false);
      setVerifyingText('');
    }
  };

  // Resend OTP timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (showOtpModal && otpResendTimer > 0) {
      interval = setInterval(() => {
        setOtpResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showOtpModal, otpResendTimer]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);
    setPasswordMismatchError(null);

    if (!regName.trim()) {
      setEmailError(lang === 'ar' ? 'يرجى إدخال الاسم الكامل.' : 'Please enter your full name.');
      return;
    }

    if (!regEmail.trim()) {
      setEmailError(lang === 'ar' ? 'يرجى إدخال عنوان البريد الإلكتروني.' : 'Please enter your email address.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setPasswordMismatchError(
        lang === 'ar'
          ? '❌ كلمتا المرور غير متطابقتين. يرجى إعادة التأكد وكتابتها بشكل مطابق.'
          : '❌ Passwords do not match. Please verify.'
      );
      return;
    }

    if (regPassword.length < 6) {
      setPasswordMismatchError(
        lang === 'ar'
          ? 'كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل.'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    setVerifying(true);
    setVerifyingText(lang === 'ar' ? 'جاري إرسال رمز التحقق...' : 'Sending verification code...');

    try {
      // 1. Check email domain validity
      const verifyRes = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim() }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.valid) {
        setEmailError(
          lang === 'ar'
            ? verifyData.messageAr || 'عذراً، يرجى تقديم بريد إلكتروني حقيقي ونشط.'
            : verifyData.messageEn || 'Please provide a valid active email address.'
        );
        return;
      }

      // 2. Request OTP verification code (sent to user email, with registration existing account check)
      const otpRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim(), isRegistration: true }),
      });
      const otpData = await otpRes.json();

      if (otpData.exists) {
        setEmailError(
          lang === 'ar'
            ? '❌ هذا البريد الإلكتروني مسجل مسبقاً في النظام. يرجى تسجيل الدخول أو استخدام خيار "نسيت كلمة المرور".'
            : '❌ Account already registered. Please sign in or use Forgot Password.'
        );
        return;
      }

      if (otpRes.ok && otpData.success) {
        setOtpInput('');
        setOtpError(null);
        setOtpResendTimer(60);
        setShowOtpModal(true);
      } else {
        setEmailError(
          lang === 'ar'
            ? otpData.messageAr || 'فشل إرسال رمز التحقق إلى البريد.'
            : otpData.messageEn || 'Failed to send OTP verification code to email.'
        );
      }
    } catch (err) {
      console.error('Registration verification error:', err);
      setEmailError(
        lang === 'ar'
          ? 'تعذر الاتصال بخادم المصادقة. يرجى المحاولة لاحقاً.'
          : 'Failed to connect to authentication server.'
      );
    } finally {
      setVerifying(false);
      setVerifyingText('');
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotError(lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setForgotError(lang === 'ar' ? data.messageAr || 'حدث خطأ أثناء إرسال الرمز.' : data.messageEn || 'Error sending reset code.');
      } else {
        setForgotSuccess(lang === 'ar' ? data.messageAr : data.messageEn);
        setForgotStep(2);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setForgotError(lang === 'ar' ? 'تعذر الاتصال بخادم المصادقة.' : 'Failed to connect to authentication server.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotCode.trim() || forgotCode.trim().length < 6) {
      setForgotError(lang === 'ar' ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام.' : 'Please enter the 6-digit OTP code.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError(lang === 'ar' ? '❌ كلمتا المرور غير متطابقتين.' : '❌ Passwords do not match.');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotError(lang === 'ar' ? 'كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل.' : 'Password must be at least 6 characters.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          code: forgotCode.trim(),
          newPassword: forgotNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setForgotError(lang === 'ar' ? data.messageAr || 'رمز التحقق غير صحيح' : data.messageEn || 'Invalid code');
      } else {
        setEmailSuccess(
          lang === 'ar'
            ? 'تمت إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة ✓'
            : 'Password reset successfully! Log in now ✓'
        );
        setEmailInput(forgotEmail.trim());
        setPasswordInput(forgotNewPassword);
        setAuthMode('login');
        setForgotStep(1);
        setForgotCode('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setForgotError(lang === 'ar' ? 'تعذر الاتصال بخادم المصادقة.' : 'Failed to connect to authentication server.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpResendTimer > 0) return;
    setOtpError(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpResendTimer(60);
      }
    } catch (e) {
      console.error('Resend OTP error:', e);
    }
  };

  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (!otpInput.trim() || otpInput.trim().length < 6) {
      setOtpError(lang === 'ar' ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام الواصل لبريدك.' : 'Please enter the 6-digit OTP code received in your email.');
      return;
    }

    setOtpVerifying(true);
    setOtpVerifyingText(lang === 'ar' ? 'جاري التحقق من الرمز...' : 'Verifying code...');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail.trim(),
          code: otpInput.trim(),
          name: regName.trim(),
          password: regPassword,
          avatar: onboardingAvatar,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setOtpError(lang === 'ar' ? data.messageAr || '❌ رمز التحقق المكون من 6 أرقام غير صحيح.' : data.messageEn || '❌ Invalid 6-digit OTP code.');
      } else {
        setShowOtpModal(false);
        loginUser(regEmail.trim(), regName.trim(), 'manual', onboardingAvatar);
        setEmailSuccess(lang === 'ar' ? 'تم توثيق الرمز وإنشاء الحساب في قاعدة البيانات بنجاح ✓' : 'Account verified and created in DB ✓');
        setStep(2);
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      setOtpError(lang === 'ar' ? 'حدث خطأ أثناء التحقق من الرمز.' : 'An error occurred during verification.');
    } finally {
      setOtpVerifying(false);
      setOtpVerifyingText('');
    }
  };

  const handleSocialLoginSelect = async (selectedEmail: string, name: string, provider: 'google' | 'microsoft' | 'apple' | 'github' = selectedSsoProvider) => {
    setVerifying(true);
    const providerTitle = provider === 'microsoft' ? 'Microsoft' : provider === 'apple' ? 'Apple ID' : provider === 'github' ? 'GitHub' : 'Google';
    setVerifyingText(lang === 'ar' ? `جاري تسجيل الدخول عبر ${providerTitle}...` : `Signing in with ${providerTitle}...`);
    setEmailError(null);

    try {
      // Call Multi-Provider Social OAuth Endpoint
      const oauthRes = await fetch('/api/auth/social-oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedEmail,
          name,
          provider,
          idToken: 'openid_token_' + Date.now(),
        }),
      });
      const oauthData = await oauthRes.json();

      setShowSocialModal(false);
      setVerifying(false);

      if (oauthRes.ok && oauthData.user) {
        loginUser(
          oauthData.user.email,
          oauthData.user.name,
          provider,
          oauthData.user.avatarUrl
        );

        // If existing user in database: Log in directly to Dashboard
        if (oauthData.isNewUser === false) {
          onComplete();
        } else {
          // If new user: Trigger onboarding setup steps!
          setGoogleConnected(true);
          setStep(2);
        }
      } else {
        loginUser(selectedEmail, name, provider);
        onComplete();
      }
    } catch (err) {
      console.error('Social OAuth error:', err);
      setShowSocialModal(false);
      setVerifying(false);
      loginUser(selectedEmail, name, provider);
      onComplete();
    }
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className={`min-h-screen text-[var(--text-primary)] flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden bg-pattern-${bgPattern}`}>
      {/* Dynamic Animated Nature & Cyber Tech Background */}
      <AnimatedAuthBackground isRTL={isRTL} />

      {/* Decorative Rotating Arabesque Geometry Background Watermark */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-15 dark:opacity-25 z-0">
        <div className="w-[700px] h-[700px] sm:w-[900px] sm:h-[900px] border border-[var(--accent)]/30 rounded-full animate-spin-slow flex items-center justify-center">
          <div className="w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] border-2 border-dashed border-[var(--accent)]/40 rotate-45 flex items-center justify-center">
            <div className="w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] border border-[var(--accent)]/30 rotate-45 flex items-center justify-center">
              <svg className="w-72 h-72 text-[var(--accent)]/40 animate-pulse-glow" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z" />
                <path d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z" transform="rotate(45 50 50)" opacity="0.6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient Glowing Orbs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-[var(--accent)]/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow z-0" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow z-0" style={{ animationDelay: '2s' }} />

      {/* Main Content Card Container */}
      <div className="w-full max-w-xl mx-auto z-10">
        {/* Top Header Controls Bar for Language & Theme Selection before Login */}
        <div className="w-full max-w-xl mx-auto mb-6 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            {(step > 1 || authMode !== 'login') && (
              <button
                type="button"
                onClick={() => {
                  if (authMode !== 'login' && step === 1) {
                    setAuthMode('login');
                    setEmailError(null);
                    setPasswordMismatchError(null);
                  } else if (step > 1) {
                    setStep((prev) => Math.max(1, prev - 1));
                  }
                }}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                  bg-[var(--accent)] text-white hover:opacity-90
                  border border-white/20 font-black text-xs transition-all duration-200
                  cursor-pointer shadow-md active:scale-95 touch-manipulation shrink-0 animate-fadeIn
                "
                title={lang === 'ar' ? 'الرجوع للخطوة / الشاشة السابقة' : 'Go back to previous step'}
              >
                <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 shrink-0" />
                <span className="font-extrabold">{lang === 'ar' ? 'رجوع' : 'Back'}</span>
              </button>
            )}
            <Logo size="sm" isArabic={lang === 'ar'} />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-[var(--text-muted)] hidden sm:inline">
              {lang === 'ar' ? 'اختر اللغة / Language:' : 'Language:'}
            </span>
            <LangToggle className="shadow-sm border-[var(--accent)]/30" />
            <ThemeToggle className="shadow-sm" />
          </div>
        </div>
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`
                  w-9 h-9 rounded-full font-extrabold text-sm flex items-center justify-center transition-all duration-300
                  ${
                    step === i
                      ? 'bg-[var(--accent)] text-white ring-4 ring-[var(--accent)]/20 shadow-md scale-105'
                      : step > i
                      ? 'bg-[var(--success)] text-white'
                      : 'bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                  }
                `}
              >
                {step > i ? <Check className="w-5 h-5" /> : i}
              </div>
              {i < 4 && (
                <div
                  className={`h-1 flex-1 min-w-[10px] max-w-[80px] mx-1 rounded transition-all duration-300 ${
                    step > i ? 'bg-[var(--success)]' : 'bg-[var(--border-subtle)]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Card Container */}
        <Card className="shadow-xl relative overflow-hidden border-[var(--border-default)]">
          <AnimatePresence mode="wait">
            {/* STEP 1: LOGIN & VERIFICATION (GOOGLE OR MANUAL) */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-2">
                    <Logo size="md" showText={false} isArabic={lang === 'ar'} />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                    {t('auth.loginTitle')}
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {t('auth.loginSubtitle')}
                  </p>
                </div>

                {/* Authentication Method Selection Tabs (2 Local Options) */}
                <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[var(--bg-base)] rounded-2xl border border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setEmailError(null);
                      setPasswordMismatchError(null);
                    }}
                    className={`
                      py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer
                      ${
                        authMode === 'login'
                          ? 'bg-[var(--accent)] text-white shadow-md'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                      }
                    `}
                  >
                    <Mail className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'تسجيل دخول محلي' : 'Local Sign In'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setEmailError(null);
                      setPasswordMismatchError(null);
                    }}
                    className={`
                      py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer
                      ${
                        authMode === 'register'
                          ? 'bg-[var(--accent)] text-white shadow-md'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                      }
                    `}
                  >
                    <User className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'حساب جديد (تحقق OTP)' : 'New Account (OTP)'}</span>
                  </button>
                </div>

                {/* Error Banner */}
                {emailError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3.5 rounded-2xl bg-red-500/10 border-2 border-red-500/40 text-red-600 dark:text-red-400 text-xs font-bold flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                    <span className="leading-relaxed">{emailError}</span>
                  </motion.div>
                )}

                {/* Password Mismatch Banner */}
                {passwordMismatchError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                    <span className="leading-relaxed">{passwordMismatchError}</span>
                  </motion.div>
                )}

                {/* Success Banner */}
                {emailSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3.5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                    <span>{emailSuccess}</span>
                  </motion.div>
                )}

                {authMode === 'register' ? (
                  /* MODE 1: CREATE NEW ACCOUNT (إنشاء حساب جديد مع تأكيد كلمة المرور والـ OTP) */
                  <form onSubmit={handleRegisterSubmit} className="space-y-4 relative overflow-hidden p-1">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-primary)] mb-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[var(--accent)]" />
                        {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder={lang === 'ar' ? 'مثال: محمد علي' : 'e.g., Alex Mercer'}
                        className="
                          w-full px-4 py-2.5 rounded-xl bg-[var(--bg-hover)]
                          border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]
                          placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]
                        "
                        required
                      />
                    </div>

                    {/* Email Input */}
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-primary)] mb-1 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[var(--accent)]" />
                        {lang === 'ar' ? 'عنوان البريد الإلكتروني' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          setEmailError(null);
                        }}
                        placeholder="name@example.com"
                        className="
                          w-full px-4 py-2.5 rounded-xl bg-[var(--bg-hover)]
                          border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]
                          placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]
                          font-mono
                        "
                        required
                      />
                      <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                        {lang === 'ar'
                          ? 'يمكنك استخدام أي بريد إلكتروني (Outlook, Gmail, Yahoo, Hotmail, إلخ).'
                          : 'Use any active email (Outlook, Gmail, Yahoo, Hotmail, etc.).'}
                      </span>
                    </div>

                    {/* Password & Confirm Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-primary)] mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-[var(--accent)]" />
                            {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                          </span>
                          <span className={`text-[10px] font-bold ${regPassword.length >= 6 ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>
                            {regPassword.length > 0 ? (regPassword.length >= 6 ? (lang === 'ar' ? '✓ (6+ رموز)' : '✓ Valid') : (lang === 'ar' ? '6 رموز على الأقل' : 'Min 6 chars')) : (lang === 'ar' ? '6 رموز على الأقل' : 'Min 6 chars')}
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            value={regPassword}
                            onChange={(e) => {
                              setRegPassword(e.target.value);
                              if (e.target.value.length < 6 && e.target.value.length > 0) {
                                setPasswordMismatchError(lang === 'ar' ? 'كلمة المرور يجب أن تتكون من 6 رموز على الأقل.' : 'Password must be at least 6 characters.');
                              } else if (regConfirmPassword && e.target.value !== regConfirmPassword) {
                                setPasswordMismatchError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
                              } else {
                                setPasswordMismatchError(null);
                              }
                            }}
                            placeholder="••••••••"
                            className="
                              w-full px-3 py-2.5 rounded-xl bg-[var(--bg-hover)]
                              border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]
                              placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]
                              ltr:pr-9 rtl:pl-9 transition-all
                            "
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute top-1/2 -translate-y-1/2 ltr:right-2.5 rtl:left-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
                            aria-label={showRegPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                            title={showRegPassword ? 'إخفاء كلمة المرور' : 'معاينة كلمة المرور'}
                          >
                            {showRegPassword ? <EyeOff className="w-4 h-4 text-emerald-500" /> : <Eye className="w-4 h-4 text-amber-500" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[var(--text-primary)] mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                            {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type={showRegConfirmPassword ? 'text' : 'password'}
                            value={regConfirmPassword}
                            onChange={(e) => {
                              setRegConfirmPassword(e.target.value);
                              if (regPassword && e.target.value !== regPassword) {
                                setPasswordMismatchError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
                              } else if (regPassword.length < 6) {
                                setPasswordMismatchError(lang === 'ar' ? 'كلمة المرور يجب أن تتكون من 6 رموز على الأقل.' : 'Password must be at least 6 characters.');
                              } else {
                                setPasswordMismatchError(null);
                              }
                            }}
                            placeholder="••••••••"
                            className={`
                              w-full px-3 py-2.5 rounded-xl bg-[var(--bg-hover)]
                              border text-xs text-[var(--text-primary)]
                              placeholder-[var(--text-muted)] focus:outline-none
                              ltr:pr-9 rtl:pl-9 transition-all
                              ${
                                passwordMismatchError
                                  ? 'border-amber-500 bg-amber-500/5'
                                  : 'border-[var(--border-subtle)] focus:border-[var(--accent)]'
                              }
                            `}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                            className="absolute top-1/2 -translate-y-1/2 ltr:right-2.5 rtl:left-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
                            aria-label={showRegConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                            title={showRegConfirmPassword ? 'إخفاء كلمة المرور' : 'معاينة كلمة المرور'}
                          >
                            {showRegConfirmPassword ? <EyeOff className="w-4 h-4 text-emerald-500" /> : <Eye className="w-4 h-4 text-amber-500" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      fullWidth
                      disabled={verifying || (regPassword !== '' && regConfirmPassword !== '' && regPassword !== regConfirmPassword)}
                      icon={verifying ? <Sparkles className="w-5 h-5 animate-spin" /> : isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                    >
                      {verifying ? (verifyingText || 'جاري فحص الحساب...') : (lang === 'ar' ? 'إنشاء الحساب وتأكيد البيانات' : 'Create & Verify Account')}
                    </Button>
                  </form>
                ) : authMode === 'login' ? (
                  /* MODE 3: MANUAL LOGIN WITH AUTO RECOGNITION */
                  <form onSubmit={handleManualSubmit} className="space-y-4 relative overflow-hidden p-1">
                    {/* Saved Recognized User Card (1-Click Login) */}
                    {savedUserEmail && (
                      <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border-2 border-emerald-500/40 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={savedUserAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={savedUserName || 'User Avatar'}
                              className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shrink-0 shadow-sm"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-sm font-black text-[var(--text-primary)] truncate">
                                  {savedUserName || 'المستخدم المسجل'}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                                  {lang === 'ar' ? 'تم التعرف تلقائياً ✓' : 'Recognized ✓'}
                                </span>
                              </div>
                              <p className="text-xs text-[var(--text-secondary)] font-mono truncate">
                                {savedUserEmail}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="primary"
                          size="md"
                          onClick={handleQuickRecognizedLogin}
                          disabled={verifying}
                          icon={<Sparkles className="w-4 h-4 text-amber-300" />}
                          className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md transition-all"
                        >
                          {lang === 'ar'
                            ? `دخول بنقرة واحدة كـ (${savedUserName || 'المستخدم'}) 🚀`
                            : `One-Click Login as ${savedUserName || 'User'} 🚀`}
                        </Button>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-[var(--text-primary)] mb-1 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[var(--accent)]" />
                        {t('auth.emailLabel')}
                      </label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          setEmailError(null);
                        }}
                        placeholder="name@example.com"
                        className="
                          w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)]
                          border border-[var(--border-subtle)] text-sm text-[var(--text-primary)]
                          placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]
                          font-mono transition-all
                        "
                        required
                      />
                      <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                        {lang === 'ar'
                          ? 'تنبيه: سيتم حفظ بريدك تلقائياً ليتعرف عليك التطبيق دون إعادته عند كل زيارة.'
                          : 'Note: Your email is saved automatically so the app recognizes you next time.'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-[var(--accent)]" />
                          {t('auth.passwordLabel')}
                        </span>
                        <span className={`text-[10px] font-bold ${passwordInput.length >= 6 ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>
                          {passwordInput.length > 0 ? (passwordInput.length >= 6 ? (lang === 'ar' ? '✓ (6+ رموز)' : '✓ Valid') : (lang === 'ar' ? '6 رموز على الأقل' : 'Min 6 chars')) : (lang === 'ar' ? '6 رموز على الأقل' : 'Min 6 chars')}
                        </span>
                      </label>

                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder={t('auth.passwordPlaceholder')}
                          className="
                            w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)]
                            border border-[var(--border-subtle)] text-sm text-[var(--text-primary)]
                            placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]
                            ltr:pr-11 rtl:pl-11 transition-all
                          "
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 -translate-y-1/2 ltr:right-3.5 rtl:left-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                          aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 text-emerald-500" /> : <Eye className="w-4 h-4 text-amber-500 animate-pulse" />}
                        </button>
                      </div>

                      {/* Remember Me Checkbox & Forgot Password Link */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)] accent-[var(--accent)]"
                          />
                          <span className="text-xs font-bold text-[var(--text-primary)]">
                            {lang === 'ar' ? 'تذكرني وسجل دخولي تلقائياً 🛡️' : 'Remember me & Auto-Login 🛡️'}
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('forgot_password');
                            setForgotEmail(emailInput || '');
                            setEmailError(null);
                            setForgotError(null);
                            setForgotSuccess(null);
                            setForgotStep(1);
                          }}
                          className="text-xs font-black text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'نسيت كلمة المرور؟ / استعادة' : 'Forgot Password? / Reset'}</span>
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      fullWidth
                      disabled={verifying}
                      icon={verifying ? <Sparkles className="w-5 h-5 animate-spin" /> : isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                    >
                      {verifying ? (verifyingText || t('auth.verifyingEmail')) : t('auth.loginBtn')}
                    </Button>

                  </form>
                ) : (
                  /* MODE 4: FORGOT / RESET PASSWORD VIEW */
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-[var(--accent)]" />
                        <span className="text-sm font-black text-[var(--text-primary)]">
                          {lang === 'ar' ? '🔑 استعادة / تغيير كلمة المرور' : '🔑 Reset / Change Password'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setForgotError(null);
                        }}
                        className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
                      >
                        <span>{lang === 'ar' ? 'الرجوع للـ تسجيل الدخول ↵' : 'Back to Login ↵'}</span>
                      </button>
                    </div>

                    {forgotError && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3.5 rounded-2xl bg-red-500/10 border-2 border-red-500/40 text-red-600 dark:text-red-400 text-xs font-bold flex items-start gap-2.5"
                      >
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                        <span className="leading-relaxed">{forgotError}</span>
                      </motion.div>
                    )}

                    {forgotSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3.5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2.5"
                      >
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                        <span>{forgotSuccess}</span>
                      </motion.div>
                    )}

                    {forgotStep === 1 ? (
                      <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {lang === 'ar'
                            ? 'أدخل عنوان بريد Gmail الخاص بحسابك. سنقوم بإرسال رمز تحقق حقيقي (OTP) مكون من 6 أرقام إلى بريدك مباشرة لاستعادة وتعديل كلمة المرور.'
                            : 'Enter your account Gmail address. A real 6-digit OTP reset code will be sent to your inbox.'}
                        </p>

                        <div>
                          <label className="block text-xs font-bold text-[var(--text-primary)] mb-1 flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-[var(--accent)]" />
                            {lang === 'ar' ? 'عنوان بريد Gmail الحقيقي' : 'Real Gmail Address'}
                          </label>
                          <input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => {
                              setForgotEmail(e.target.value);
                              setForgotError(null);
                            }}
                            placeholder="yourname@gmail.com"
                            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent)]"
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          fullWidth
                          disabled={forgotLoading}
                          icon={forgotLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                        >
                          {forgotLoading
                            ? (lang === 'ar' ? 'جاري إرسال رمز الاستعادة...' : 'Sending Reset OTP...')
                            : (lang === 'ar' ? 'إرسال رمز إعادة التعيين (OTP) للبريد' : 'Send Reset Code to Email')}
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                        <div className="p-3 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-center text-xs space-y-1">
                          <span className="font-bold text-[var(--accent)] block">
                            {lang === 'ar' ? `📧 تم إرسال الرمز إلى (${forgotEmail})` : `📧 Code sent to (${forgotEmail})`}
                          </span>
                          <span className="text-[11px] text-[var(--text-secondary)] block">
                            {lang === 'ar' ? 'يرجى مراجعة البريد الإلكتروني أو صندوق الرسائل العشوائية.' : 'Please check your email inbox or spam folder.'}
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                            {lang === 'ar' ? 'رمز التحقق الواصل لبريدك (6 أرقام)' : '6-Digit OTP Code'}
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={forgotCode}
                            onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••••"
                            className="w-full text-center text-2xl font-black font-mono py-3 rounded-xl bg-[var(--bg-hover)] border-2 border-[var(--accent)] focus:outline-none tracking-[0.3em]"
                            autoFocus
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Lock className="w-3.5 h-3.5 text-[var(--accent)]" />
                                {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                              </span>
                              <span className={`text-[10px] font-bold ${forgotNewPassword.length >= 6 ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>
                                {forgotNewPassword.length > 0 ? (forgotNewPassword.length >= 6 ? (lang === 'ar' ? '✓ (6+ رموز)' : '✓ Valid') : (lang === 'ar' ? '6 رموز على الأقل' : 'Min 6 chars')) : (lang === 'ar' ? '6 رموز على الأقل' : 'Min 6 chars')}
                              </span>
                            </label>
                            <div className="relative">
                              <input
                                type={showForgotNewPassword ? 'text' : 'password'}
                                value={forgotNewPassword}
                                onChange={(e) => setForgotNewPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] ltr:pr-9 rtl:pl-9 transition-all"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                                className="absolute top-1/2 -translate-y-1/2 ltr:right-2.5 rtl:left-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
                                aria-label={showForgotNewPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                                title={showForgotNewPassword ? 'إخفاء كلمة المرور' : 'معاينة كلمة المرور'}
                              >
                                {showForgotNewPassword ? <EyeOff className="w-4 h-4 text-emerald-500" /> : <Eye className="w-4 h-4 text-amber-500" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                                {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                              </span>
                            </label>
                            <div className="relative">
                              <input
                                type={showForgotConfirmPassword ? 'text' : 'password'}
                                value={forgotConfirmPassword}
                                onChange={(e) => setForgotConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] ltr:pr-9 rtl:pl-9 transition-all"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                                className="absolute top-1/2 -translate-y-1/2 ltr:right-2.5 rtl:left-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
                                aria-label={showForgotConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                                title={showForgotConfirmPassword ? 'إخفاء كلمة المرور' : 'معاينة كلمة المرور'}
                              >
                                {showForgotConfirmPassword ? <EyeOff className="w-4 h-4 text-emerald-500" /> : <Eye className="w-4 h-4 text-amber-500" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          fullWidth
                          disabled={forgotLoading}
                          icon={forgotLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                        >
                          {forgotLoading
                            ? (lang === 'ar' ? 'جاري تحديث كلمة المرور...' : 'Resetting Password...')
                            : (lang === 'ar' ? 'تأكيد وحفظ كلمة المرور الجديدة' : 'Confirm & Save New Password')}
                        </Button>
                      </form>
                    )}
                  </div>
                )}

                {/* Guest Mode Entry Button */}
                <div className="pt-3 border-t border-[var(--border-subtle)] text-center space-y-2">
                  <div className="text-[11px] font-bold text-[var(--text-muted)]">
                    {lang === 'ar' ? 'أو يمكنك استكشاف الواجهات مباشرة بدون إنشاء حساب:' : 'Or explore the app directly without an account:'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      loginAsGuest();
                      onComplete();
                    }}
                    className="
                      w-full py-3 px-4 rounded-xl font-black text-xs
                      bg-[var(--bg-hover)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)]
                      border border-[var(--border-subtle)] hover:border-amber-500/50
                      flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm
                      group active:scale-[0.99]
                    "
                  >
                    <User className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
                    <span>
                      {lang === 'ar' ? '👀 الدخول كضيف (معاينة التطبيق بميزات محدودة)' : '👀 Continue as Guest (Limited Preview)'}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CONNECT GOOGLE & WORKSPACE */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black text-[var(--text-primary)]">
                    {t('onboarding.step2Title')}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {t('onboarding.step2Desc')}
                  </p>
                </div>

                {/* Primary Integration (Google) */}
                <div className="bg-[var(--bg-hover)] p-4 rounded-xl border-2 border-[var(--accent)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-[var(--text-primary)]">
                          Google Workspace
                        </h4>
                        <span className="text-xs text-[var(--accent)] font-semibold">
                          {t('onboarding.step2GoogleHint')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setGoogleConnected(!googleConnected)}
                      className={`
                        px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer
                        ${
                          googleConnected
                            ? 'bg-[var(--success)] text-white shadow-sm'
                            : 'bg-[var(--accent)] text-white hover:opacity-90'
                        }
                      `}
                    >
                      {googleConnected ? t('profile.statusConnected') : t('actions.connect')}
                    </button>
                  </div>
                </div>

                {/* Optional Integrations */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-[var(--text-muted)] block uppercase tracking-wider">
                    {t('onboarding.step2OptionalHint')}
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] opacity-75">
                      <MessageSquare className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                      <span className="text-xs font-semibold block">Slack</span>
                    </div>
                    <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] opacity-75">
                      <FileText className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                      <span className="text-xs font-semibold block">Notion</span>
                    </div>
                    <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] opacity-75">
                      <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                      <span className="text-xs font-semibold block">Calendar</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <Button variant="ghost" onClick={prevStep}>
                    {t('actions.back')}
                  </Button>
                  <Button onClick={nextStep}>
                    {t('actions.next')}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CONTEXTS SELECTION */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black text-[var(--text-primary)]">
                    {t('onboarding.step3Title')}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {t('onboarding.step3Desc')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['professional', 'family', 'learning', 'social', 'personal'].map((key) => {
                    const selected = selectedContexts.includes(key);
                    return (
                      <div
                        key={key}
                        onClick={() => toggleContext(key)}
                        className={`
                          flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                          ${
                            selected
                              ? 'border-[var(--accent)] bg-[var(--bg-hover)] shadow-sm'
                              : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                          }
                        `}
                      >
                        <ContextBadge context={key} size="md" />
                        <div
                          className={`
                            w-6 h-6 rounded-full border flex items-center justify-center transition-colors
                            ${
                              selected
                                ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                                : 'border-[var(--border-default)]'
                            }
                          `}
                        >
                          {selected && <Check className="w-4 h-4" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <Button variant="ghost" onClick={prevStep}>
                    {t('actions.back')}
                  </Button>
                  <Button onClick={nextStep} disabled={selectedContexts.length === 0}>
                    {t('actions.next')}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: READY */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center py-6 space-y-6"
              >
                <div className="w-16 h-16 bg-[var(--success)]/15 text-[var(--success)] rounded-full flex items-center justify-center mx-auto ring-8 ring-[var(--success)]/10">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-[var(--text-primary)]">
                    {t('onboarding.step4Title')}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                    {t('onboarding.step4Desc')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-right space-y-2">
                  <span className="text-xs font-bold text-[var(--text-muted)] block uppercase">
                    {lang === 'ar' ? 'ملخص الإعداد:' : 'Setup Summary:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedContexts.map((ctx) => (
                      <ContextBadge key={ctx} context={ctx} size="sm" />
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button size="lg" fullWidth onClick={onComplete} variant="primary">
                    {t('actions.viewDashboard')}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* 6-DIGIT REAL GMAIL OTP EMAIL VERIFICATION MODAL */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-[var(--bg-surface)] border-2 border-[var(--accent)] p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-5 text-right relative overflow-hidden"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-[var(--accent)]/15 text-[var(--accent)] rounded-2xl flex items-center justify-center mx-auto ring-8 ring-[var(--accent)]/10">
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)]">
                  {lang === 'ar' ? 'تأكيد رمز التحقق (OTP)' : 'Gmail OTP Verification'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {lang === 'ar'
                    ? `تم إرسال رمز تحقق مكون من 6 أرقام إلى بريدك الإلكتروني (${regEmail}) لمنع التسجيل ببريد وهمي وتوثيق الحساب.`
                    : `A 6-digit OTP code was sent to your Gmail (${regEmail}) to verify your real identity.`}
                </p>
              </div>

              {/* Info Notice */}
              <div className="p-3 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-center space-y-1">
                <span className="text-[11px] font-bold text-[var(--accent)] block">
                  {lang === 'ar' ? '📧 تفقد صندوق الوارد أو البريد العشوائي (Spam) في بريدك الإلكتروني.' : '📧 Check your email inbox or spam folder for the code.'}
                </span>
              </div>

              {/* Error Alert */}
              {otpError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold text-center">
                  {otpError}
                </div>
              )}

              {/* OTP Code Form */}
              <form onSubmit={handleOtpVerifySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5 text-center">
                    {lang === 'ar' ? 'أدخل الرمز المكون من 6 أرقام:' : 'Enter 6-Digit Verification Code:'}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center text-2xl font-black font-mono py-3 rounded-2xl bg-[var(--bg-hover)] border-2 border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20 tracking-[0.3em]"
                    autoFocus
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  disabled={otpVerifying || otpInput.trim().length < 6}
                  icon={otpVerifying ? <Sparkles className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                >
                  {otpVerifying
                    ? (lang === 'ar' ? 'جاري توثيق الرمز...' : 'Verifying OTP Code...')
                    : (lang === 'ar' ? 'تأكيد الرمز وتفعيل الحساب' : 'Verify & Activate Account')}
                </Button>
              </form>

              {/* Resend Code Timer Row */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  disabled={otpResendTimer > 0}
                  onClick={handleResendOtp}
                  className={`font-bold transition-colors cursor-pointer ${
                    otpResendTimer > 0 ? 'text-[var(--text-muted)] cursor-not-allowed' : 'text-[var(--accent)] hover:underline'
                  }`}
                >
                  {lang === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code'}
                </button>

                <span className="font-mono font-bold text-[var(--text-secondary)]">
                  {otpResendTimer > 0
                    ? `${lang === 'ar' ? 'إعادة الإرسال بعد' : 'Resend in'} ${otpResendTimer}s`
                    : (lang === 'ar' ? 'يمكنك إعادة الإرسال الآن' : 'Ready to resend')}
                </span>
              </div>

              <div className="flex justify-center">
                <Button variant="ghost" size="sm" onClick={() => setShowOtpModal(false)}>
                  {t('actions.cancel')}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Picture / Studio Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={showAvatarPickerModal}
        onClose={() => setShowAvatarPickerModal(false)}
        currentAvatar={onboardingAvatar}
        onSelectAvatar={(newUrl) => {
          setOnboardingAvatar(newUrl);
        }}
      />
    </div>
  );
};
