import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { signInWithEmail, signInWithGoogle } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signInWithEmail(form.email, form.password);
            // Route based on profile role
            navigate('/discover');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many attempts. Please try again later.');
            } else {
                setError(err.message || 'Something went wrong.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const { isNew } = await signInWithGoogle();
            if (isNew) {
                navigate('/onboarding/traveler');
            } else {
                navigate('/discover');
            }
        } catch (err) {
            console.error(err);
            if (err.code !== 'auth/popup-closed-by-user') {
                setError(err.message || 'Google sign-in failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Left Hero */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] relative flex-shrink-0">
                <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover" alt="Travel" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/40 to-navy-900/20"></div>
                </div>
                <div className="relative z-10 flex flex-col justify-between p-10 w-full">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg"><span className="text-white font-black text-base">R</span></div>
                        <span className="text-xl font-black text-white font-heading">Roamly</span>
                    </Link>
                    <div>
                        <h2 className="text-4xl font-black text-white font-heading leading-tight mb-4">Welcome back, explorer.</h2>
                        <p className="text-white/70 text-sm leading-relaxed">Your next adventure is waiting.</p>
                    </div>
                    <p className="text-white/30 text-xs">© 2024 Roamly Technologies. All rights reserved.</p>
                </div>
            </div>

            {/* Right Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
                <div className="max-w-md w-full">
                    <h1 className="text-3xl font-black text-navy-900 font-heading tracking-tight mb-2">Sign in</h1>
                    <p className="text-secondary mb-8">Welcome back! Sign in to continue.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button onClick={handleGoogleLogin} disabled={loading} className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" /> Google
                        </button>
                        <button disabled className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-neutral-200 rounded-xl text-sm font-medium shadow-sm opacity-50 cursor-not-allowed">
                            <img src="https://www.svgrepo.com/show/511330/apple-173.svg" className="w-5 h-5" alt="Apple" /> Apple
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-neutral-200"></div>
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Or continue with email</span>
                        <div className="flex-1 h-px bg-neutral-200"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-sm font-bold text-navy-900 mb-1.5 block">Email address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-sm font-bold text-navy-900">Password</label>
                                <Link to="#" className="text-xs font-bold text-amber-600 hover:underline">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input type={showPassword ? "text" : "password"} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="w-full pl-10 pr-12 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3.5 bg-navy-900 text-white rounded-xl text-sm font-bold hover:bg-navy-800 disabled:opacity-50 transition-all shadow-lg shadow-navy-900/10 active:scale-[0.98] flex items-center justify-center gap-2">
                            {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
                        </button>
                    </form>
                    <p className="text-center mt-6 text-sm text-secondary">Don't have an account? <Link to="/signup" className="text-amber-600 font-bold hover:underline">Sign Up</Link></p>
                </div>
            </div>
        </div>
    );
}
