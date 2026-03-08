import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Briefcase, MapPin, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SignUp() {
    const navigate = useNavigate();
    const { signUpWithEmail, signInWithGoogle } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const { pathname } = useLocation();
    const [role, setRole] = useState(pathname === '/become-agent' ? 'agent' : null);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!role) return;
        setError('');
        setLoading(true);
        try {
            await signUpWithEmail(form.name, form.email, form.password, role);
            navigate(role === 'traveler' ? '/onboarding/traveler' : '/onboarding/agent');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already registered. Try signing in.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password must be at least 6 characters.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError(err.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        if (!role) return;
        setError('');
        setLoading(true);
        try {
            const { isNew } = await signInWithGoogle(role);
            if (isNew) {
                navigate(role === 'traveler' ? '/onboarding/traveler' : '/onboarding/agent');
            } else {
                navigate(role === 'traveler' ? '/discover' : '/agent/dashboard');
            }
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in popup was closed.');
            } else {
                setError(err.message || 'Google sign-in failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Role Chooser ──
    if (!role) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
                <div className="max-w-3xl w-full">
                    <div className="text-center mb-12">
                        <Link to="/" className="inline-flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/30">
                                <span className="text-white font-black text-lg">R</span>
                            </div>
                            <span className="text-2xl font-black text-navy-900 font-heading">Roamly</span>
                        </Link>
                        <h1 className="text-4xl font-black text-navy-900 font-heading tracking-tight mb-3">Join Roamly</h1>
                        <p className="text-secondary text-lg">How would you like to use Roamly?</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button onClick={() => setRole('traveler')} className="group bg-white border-2 border-neutral-200 hover:border-amber-400 rounded-3xl p-10 text-left transition-all hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-50 rounded-full -mr-16 -mt-16 group-hover:bg-amber-100 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-amber-100 group-hover:bg-amber-400 rounded-2xl flex items-center justify-center mb-6 transition-colors">
                                    <MapPin size={32} className="text-amber-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-2xl font-black text-navy-900 mb-2 font-heading">I'm a Traveler</h3>
                                <p className="text-secondary leading-relaxed mb-6">Discover curated group trips, connect with fellow travelers, and explore the world.</p>
                                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Continue <ArrowRight size={16} /></div>
                            </div>
                        </button>
                        <button onClick={() => setRole('agent')} className="group bg-white border-2 border-neutral-200 hover:border-sky-400 rounded-3xl p-10 text-left transition-all hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-sky-50 rounded-full -mr-16 -mt-16 group-hover:bg-sky-100 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-sky-100 group-hover:bg-sky-500 rounded-2xl flex items-center justify-center mb-6 transition-colors">
                                    <Briefcase size={32} className="text-sky-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-2xl font-black text-navy-900 mb-2 font-heading">I'm an Agent / Agency</h3>
                                <p className="text-secondary leading-relaxed mb-6">List your curated trips, manage bookings, and build your travel business.</p>
                                <div className="flex items-center gap-2 text-sky-600 font-bold text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Continue <ArrowRight size={16} /></div>
                            </div>
                        </button>
                    </div>
                    <p className="text-center mt-8 text-secondary">
                        Already have an account? <Link to="/login" className="text-amber-600 font-bold hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        );
    }

    // ── Sign Up Form ──
    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Left Hero */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] relative flex-shrink-0">
                <div className="absolute inset-0">
                    <img src={role === 'traveler' ? "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" : "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"} className="w-full h-full object-cover" alt="Travel" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/40 to-navy-900/20"></div>
                </div>
                <div className="relative z-10 flex flex-col justify-between p-10 w-full">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg"><span className="text-white font-black text-base">R</span></div>
                        <span className="text-xl font-black text-white font-heading">Roamly</span>
                    </Link>
                    <div>
                        <h2 className="text-4xl font-black text-white font-heading leading-tight mb-4">Explore the world's best‑kept secrets.</h2>
                        <p className="text-white/70 text-sm leading-relaxed mb-8">Join over 2 million travelers planning unforgettable itineraries every day.</p>
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-[10px] font-bold text-white">{String.fromCharCode(64 + i)}</div>
                                ))}
                            </div>
                            <span className="text-white/60 text-sm font-medium">Join 500+ new travelers today</span>
                        </div>
                    </div>
                    <p className="text-white/30 text-xs">© 2024 Roamly Technologies. All rights reserved.</p>
                </div>
            </div>

            {/* Right Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
                <div className="max-w-md w-full">
                    <button onClick={() => setRole(null)} className="text-xs font-bold text-secondary hover:text-primary-dark uppercase tracking-widest mb-6 flex items-center gap-1">← Change role</button>
                    <h1 className="text-3xl font-black text-navy-900 font-heading tracking-tight mb-2">Create an account</h1>
                    <p className="text-secondary mb-8">{role === 'traveler' ? 'Start your adventure with a free account today.' : 'Start managing trips for your agency.'}</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* OAuth */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button onClick={handleGoogleSignUp} disabled={loading} className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" /> Google
                        </button>
                        <button disabled className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors shadow-sm opacity-50 cursor-not-allowed">
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
                            <label className="text-sm font-bold text-navy-900 mb-1.5 block">
                                {role === 'agent' ? 'Agency Name' : 'Full Name'}
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={role === 'agent' ? "Elite Travels" : "John Doe"} className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-navy-900 mb-1.5 block">Email address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-sm font-bold text-navy-900">Password</label>
                                <Link to="#" className="text-xs font-bold text-amber-600 hover:underline">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input type={showPassword ? "text" : "password"} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="w-full pl-10 pr-12 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                            </div>
                        </div>
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="mt-1 w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500" />
                            <span className="text-sm text-secondary">I agree to the <Link to="#" className="font-bold text-navy-900 underline">Terms of Service</Link></span>
                        </label>
                        <button type="submit" disabled={!agreed || loading} className="w-full py-3.5 bg-navy-900 text-white rounded-xl text-sm font-bold hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-navy-900/10 active:scale-[0.98] flex items-center justify-center gap-2">
                            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create Account'}
                        </button>
                    </form>
                    <p className="text-center mt-6 text-sm text-secondary">Already have an account? <Link to="/login" className="text-amber-600 font-bold hover:underline">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
}
