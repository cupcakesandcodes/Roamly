import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Briefcase, Camera, MapPin, Globe, ArrowRight, ArrowLeft,
    Sparkles, ShieldCheck, Heart, User, Loader2, Check,
    ChevronDown, Plus, X, Image, GraduationCap, Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AgentNavbar from '../../components/AgentNavbar';

const SPECIALIZATIONS = [
    { id: 'luxury', label: 'Luxury Travel', icon: <Award size={16} /> },
    { id: 'adventure', label: 'Adventure', icon: <MapPin size={16} /> },
    { id: 'cultural', label: 'Cultural Tours', icon: <Globe size={16} /> },
    { id: 'eco', label: 'Eco-Tourism', icon: <Sparkles size={16} /> },
    { id: 'photography', label: 'Photography', icon: <Camera size={16} /> },
    { id: 'generalist', label: 'Generalist / All Destinations', icon: <Briefcase size={16} /> },
];

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic', 'Russian', 'Hindi', 'Portuguese'];

export default function AgentOnboarding() {
    const navigate = useNavigate();
    const { currentUser, userProfile, uploadProfilePhoto, completeOnboarding, updateUserProfile, loading: authLoading } = useAuth();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    // Step 1 — Basic Professional Info
    const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
    const [experience, setExperience] = useState('');
    const [specializations, setSpecializations] = useState([]);
    const [languages, setSelectedLanguages] = useState([]);

    // Step 2 — Agency Details
    const [bio, setBio] = useState('');
    const [website, setWebsite] = useState('');
    const [location, setLocation] = useState('');
    const [responseTime, setResponseTime] = useState('Within 2 hours');

    // Step 3 — Portfolio & Finish
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [portfolioInput, setPortfolioInput] = useState({ title: '', image: '', description: '' });

    // Pre-fill from existing profile
    useEffect(() => {
        if (userProfile && userProfile.role === 'agent') {
            setProfilePhotoPreview(userProfile.profilePhoto || currentUser?.photoURL || '');
            setExperience(userProfile.experience || '');
            setSpecializations(userProfile.specializations || []);
            setSelectedLanguages(userProfile.languages || []);
            setBio(userProfile.bio || '');
            setWebsite(userProfile.website || '');
            setLocation(userProfile.location || '');
            setResponseTime(userProfile.responseTime || 'Within 2 hours');
            setPortfolioItems(userProfile.portfolioItems || []);
        }
    }, [userProfile, currentUser]);

    // Redirect if not logged in or not an agent
    useEffect(() => {
        if (!authLoading && !currentUser) {
            navigate('/signup');
        } else if (!authLoading && userProfile && userProfile.role !== 'agent') {
            navigate('/onboarding/traveler');
        }
    }, [authLoading, currentUser, userProfile, navigate]);

    const totalSteps = 3;
    const progress = Math.round((step / totalSteps) * 100);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setProfilePhotoPreview(URL.createObjectURL(file));
        setUploading(true);
        try {
            await uploadProfilePhoto(file);
            showSave('Photo uploaded!');
        } catch (err) {
            console.error('Photo upload failed:', err);
            showSave('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const showSave = (msg) => {
        setSaveMsg(msg);
        setTimeout(() => setSaveMsg(''), 2500);
    };

    const toggleSpecialization = (id) => {
        setSpecializations(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const toggleLanguage = (lang) => {
        setSelectedLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
    };

    const saveStepData = async () => {
        setSaving(true);
        try {
            if (step === 1) {
                await updateUserProfile({
                    experience,
                    specializations,
                    languages,
                });
            } else if (step === 2) {
                await updateUserProfile({
                    bio,
                    website,
                    location,
                    responseTime,
                });
            } else if (step === 3) {
                await updateUserProfile({
                    portfolioItems,
                });
            }
            showSave('Saved!');
        } catch (err) {
            console.error('Save failed:', err);
            showSave('Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleNext = async () => {
        await saveStepData();
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const handleFinish = async () => {
        setSaving(true);
        try {
            await completeOnboarding({
                experience,
                specializations,
                languages,
                bio,
                website,
                location,
                responseTime,
                portfolioItems,
                isVerified: false, // Agents start as unverified
                stats: {
                    totalTrips: 0,
                    travellers: 0,
                    avgRating: 0
                }
            });
            navigate('/profile/me'); // This will redirect to the new AgencyProfile via App.jsx routing logic
        } catch (err) {
            console.error('Complete onboarding failed:', err);
            showSave('Error finishing setup');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-navy-900">
                <Loader2 size={32} className="text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 font-sans text-navy-900">
            {/* Unified Agent Nav */}
            <AgentNavbar
                customActions={
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">Onboarding Progress</span>
                            <div className="flex items-center gap-3 mt-1.5">
                                <div className="w-32 bg-neutral-100 h-1 rounded-full overflow-hidden">
                                    <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                </div>
                                <span className="text-[10px] font-black text-navy-900">{progress}%</span>
                            </div>
                        </div>
                        <button
                            onClick={step < totalSteps ? handleNext : handleFinish}
                            disabled={saving}
                            className="px-6 py-2 bg-navy-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/10 disabled:opacity-50 flex items-center gap-2 cursor-pointer border-none"
                        >
                            {saving ? <Loader2 size={12} className="animate-spin" /> : null}
                            {step < totalSteps ? 'Continue' : 'Complete Setup'}
                        </button>
                    </div>
                }
            />

            <div className="max-w-2xl mx-auto px-6 py-10">
                {/* Progress */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Step {step} of {totalSteps}</span>
                            <h1 className="text-2xl font-black text-navy-900 font-heading mt-1 leading-tight">
                                {step === 1 && "Agency Credentials"}
                                {step === 2 && "Profile Details"}
                                {step === 3 && "Previous Portfolios"}
                            </h1>
                        </div>
                        <span className="text-sm font-bold text-secondary">{progress}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-navy-900 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                {/* ===== STEP 1 ===== */}
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-3xl border border-neutral-100 p-8 text-center shadow-sm">
                            <div className="relative w-32 h-32 mx-auto mb-4">
                                <div className="w-32 h-32 rounded-3xl bg-neutral-50 border-2 border-dashed border-neutral-200 flex items-center justify-center overflow-hidden">
                                    {profilePhotoPreview ? (
                                        <img src={profilePhotoPreview} className="w-full h-full object-cover" alt="Profile" />
                                    ) : (
                                        <Briefcase size={48} className="text-neutral-200" />
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-400 rounded-2xl flex items-center justify-center cursor-pointer shadow-lg shadow-amber-400/30 hover:bg-amber-500 transition-colors">
                                    {uploading ? <Loader2 size={18} className="text-white animate-spin" /> : <Camera size={18} className="text-white" />}
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                                </label>
                            </div>
                            <h3 className="font-bold text-navy-900">Agency Logo / Avatar</h3>
                            <p className="text-xs text-secondary mt-1">This will be shown on all your trip listings.</p>
                        </div>

                        <div className="bg-white rounded-3xl border border-neutral-100 p-8 space-y-6 shadow-sm">
                            <div>
                                <label className="text-sm font-bold text-navy-900 mb-2 block">Years of Experience</label>
                                <div className="relative">
                                    <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type="number"
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                        placeholder="e.g. 5"
                                        className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-navy-900 mb-3 block">Specialization Areas</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {SPECIALIZATIONS.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => toggleSpecialization(s.id)}
                                            className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold transition-all border ${specializations.includes(s.id) ? 'bg-navy-900 text-white border-navy-900 shadow-md' : 'bg-neutral-50 text-secondary border-neutral-100 hover:border-amber-300'}`}
                                        >
                                            <span className={specializations.includes(s.id) ? 'text-amber-400' : 'text-neutral-400'}>{s.icon}</span>
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-navy-900 mb-3 block">Languages Spoken</label>
                                <div className="flex flex-wrap gap-2">
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => toggleLanguage(lang)}
                                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${languages.includes(lang) ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white text-secondary border-neutral-200 hover:border-amber-300'}`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button onClick={handleNext} disabled={saving} className="w-full bg-navy-900 text-white rounded-2xl py-4 font-bold text-base hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/10 active:scale-[0.98] flex items-center justify-center gap-2">
                            Continue to Profile Setup <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {/* ===== STEP 2 ===== */}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
                            <label className="text-sm font-bold text-navy-900 mb-2 block">Professional Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value.slice(0, 600))}
                                placeholder="Describe your agency's mission, values, and why travelers should choose your curated experiences..."
                                className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400 min-h-[160px] leading-relaxed font-medium"
                            />
                            <div className="flex justify-between mt-2">
                                <p className="text-[10px] text-neutral-400">Be descriptive and professional.</p>
                                <p className="text-[10px] text-secondary font-bold">{bio.length}/600</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-neutral-100 p-8 space-y-6 shadow-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-navy-900 mb-2 block">Website URL (Optional)</label>
                                    <div className="relative">
                                        <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input
                                            type="url"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            placeholder="agency.com"
                                            className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400 font-medium"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-navy-900 mb-2 block">Base City/Region</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="e.g. London, UK"
                                            className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-navy-900 mb-3 block">Average Response Time</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Within 1 hour', 'Within 2 hours', 'Within 24 hours'].map(time => (
                                        <button
                                            key={time}
                                            onClick={() => setResponseTime(time)}
                                            className={`py-3 px-2 rounded-xl text-[11px] font-bold border transition-all ${responseTime === time ? 'bg-amber-400 text-navy-900 border-amber-400 shadow-sm' : 'bg-neutral-50 text-secondary border-neutral-100 hover:border-amber-400'}`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="flex-1 py-4 bg-neutral-100 text-secondary rounded-2xl font-bold hover:bg-neutral-200 transition-all flex items-center justify-center gap-2">
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button onClick={handleNext} disabled={saving} className="flex-[2] py-4 bg-navy-900 text-white rounded-2xl font-bold hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/10 flex items-center justify-center gap-2">
                                Continue to Portfolio <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ===== STEP 3 ===== */}
                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
                            <h3 className="text-sm font-black text-navy-900 mb-1 flex items-center gap-2 uppercase tracking-wider">
                                <Award size={18} className="text-amber-500" /> Share Your Best Trips
                            </h3>
                            <p className="text-xs text-secondary mb-6 leading-relaxed">Let travelers see the quality of your past journeys. Uploading portfolio items increases your verification chance.</p>

                            <div className="space-y-4 mb-8">
                                <div className="grid grid-cols-1 gap-4 bg-neutral-50 p-6 rounded-3xl border border-dashed border-neutral-200">
                                    <div className="bg-white p-3 rounded-2xl shadow-sm">
                                        <label className="text-[10px] font-black text-secondary uppercase mb-2 block tracking-widest">Trip Title</label>
                                        <input
                                            type="text"
                                            value={portfolioInput.title}
                                            onChange={(e) => setPortfolioInput({ ...portfolioInput, title: e.target.value })}
                                            placeholder="e.g. Serengeti Luxury Safari"
                                            className="w-full bg-transparent border-none text-sm font-bold text-navy-900 focus:ring-0 placeholder:text-neutral-300"
                                        />
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl shadow-sm">
                                        <label className="text-[10px] font-black text-secondary uppercase mb-2 block tracking-widest">Banner Photo URL</label>
                                        <input
                                            type="text"
                                            value={portfolioInput.image}
                                            onChange={(e) => setPortfolioInput({ ...portfolioInput, image: e.target.value })}
                                            placeholder="Paste image link from Unsplash"
                                            className="w-full bg-transparent border-none text-sm font-bold text-navy-900 focus:ring-0 placeholder:text-neutral-300"
                                        />
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl shadow-sm">
                                        <label className="text-[10px] font-black text-secondary uppercase mb-2 block tracking-widest">Trip Story / Description</label>
                                        <textarea
                                            value={portfolioInput.description}
                                            onChange={(e) => setPortfolioInput({ ...portfolioInput, description: e.target.value })}
                                            placeholder="Tell the story of this trip..."
                                            className="w-full bg-transparent border-none text-sm font-medium text-navy-900 focus:ring-0 placeholder:text-neutral-300 min-h-[80px] resize-none"
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (portfolioInput.title && portfolioInput.image) {
                                                setPortfolioItems([...portfolioItems, { ...portfolioInput, id: Date.now() }]);
                                                setPortfolioInput({ title: '', image: '', description: '' });
                                            }
                                        }}
                                        className="py-3 bg-amber-400 text-navy-900 rounded-2xl text-sm font-bold hover:bg-amber-500 transition-colors shadow-lg shadow-amber-400/20 active:scale-[0.98]"
                                    >
                                        Add to Portfolio
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {portfolioItems.map(item => (
                                        <div key={item.id} className="relative group aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200">
                                            <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                                            <div className="absolute inset-0 bg-navy-900/60 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-white font-bold text-xs truncate">{item.title}</p>
                                                <button
                                                    onClick={() => setPortfolioItems(portfolioItems.filter(p => p.id !== item.id))}
                                                    className="mt-2 text-[10px] font-black text-amber-400 uppercase tracking-widest hover:text-white transition-colors text-left"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 text-center shadow-inner">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4 border border-amber-100">
                                <ShieldCheck size={32} className="text-amber-500" />
                            </div>
                            <h3 className="text-lg font-black text-navy-900 font-heading tracking-tight">Ready for Review?</h3>
                            <p className="text-sm text-secondary mt-2 max-w-sm mx-auto leading-relaxed">Once submitted, your agency profile will be visible to travelers and enter our verification process.</p>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep(2)} className="flex-1 py-4 bg-neutral-100 text-secondary rounded-2xl font-bold hover:bg-neutral-200 transition-all flex items-center justify-center gap-2">
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button onClick={handleFinish} disabled={saving || specializations.length === 0} className="flex-[2] py-4 bg-navy-900 text-white rounded-2xl font-bold hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/10 flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-amber-400" />} Submit & Build Your Empire
                            </button>
                        </div>
                        {specializations.length === 0 && <p className="text-center text-[10px] text-amber-600 font-bold uppercase tracking-widest">Please select at least one specialization on Step 1</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
