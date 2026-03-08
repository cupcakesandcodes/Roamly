import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    User, Camera, MapPin, Globe, ArrowRight, ArrowLeft,
    Sparkles, Mountain, Utensils, PartyPopper, Palette, Flower2,
    Backpack, Crown, Gauge, ChevronDown, Plus, X, Image, Loader2, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TRAVEL_STYLES = [
    { id: 'backpacker', label: 'Backpacker', icon: <Backpack size={16} /> },
    { id: 'luxury', label: 'Luxury', icon: <Crown size={16} /> },
    { id: 'slow', label: 'Slow Travel', icon: <Gauge size={16} /> },
    { id: 'adventure', label: 'Adventure', icon: <Mountain size={16} /> },
    { id: 'foodie', label: 'Foodie', icon: <Utensils size={16} /> },
    { id: 'party', label: 'Party', icon: <PartyPopper size={16} /> },
    { id: 'cultural', label: 'Cultural', icon: <Palette size={16} /> },
    { id: 'wellness', label: 'Wellness', icon: <Flower2 size={16} /> },
];

const BUDGET_OPTIONS = ['Budget', 'Mid-Range', 'Luxury'];
const FREQUENCY_OPTIONS = ['Occasional (1-2/yr)', 'Frequent (3-5/yr)', 'Digital Nomad'];
const COUNTRIES = ['United States', 'India', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Brazil', 'Mexico', 'Italy', 'Spain', 'Thailand', 'Indonesia', 'South Korea', 'Netherlands', 'Sweden', 'Norway', 'New Zealand', 'Singapore', 'UAE', 'South Africa', 'Argentina', 'Colombia', 'Portugal', 'Ireland', 'Switzerland', 'Austria', 'Denmark', 'Poland'];

export default function TravelerOnboarding() {
    const navigate = useNavigate();
    const { currentUser, userProfile, uploadProfilePhoto, completeOnboarding, updateUserProfile, loading: authLoading } = useAuth();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    // Step 1 — Basic Info
    const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [age, setAge] = useState('');
    const [nationality, setNationality] = useState('');
    const [hometown, setHometown] = useState('');

    // Step 2 — Travel Preferences
    const [bio, setBio] = useState('');
    const [languages, setLanguages] = useState([{ lang: '', level: 'Native' }]);
    const [travelStyles, setTravelStyles] = useState([]);
    const [budgetPref, setBudgetPref] = useState('');
    const [frequency, setFrequency] = useState('');

    // Step 3 — Showcase
    const [bucketList, setBucketList] = useState([]);
    const [bucketInput, setBucketInput] = useState('');

    // Pre-fill from existing profile
    useEffect(() => {
        if (userProfile) {
            setDisplayName(userProfile.displayName || currentUser?.displayName || '');
            setProfilePhotoPreview(userProfile.profilePhoto || currentUser?.photoURL || '');
            setAge(userProfile.age || '');
            setNationality(userProfile.nationality || '');
            setHometown(userProfile.hometown || '');
            setBio(userProfile.bio || '');
            setLanguages(userProfile.languages?.length ? userProfile.languages : [{ lang: '', level: 'Native' }]);
            setTravelStyles(userProfile.travelStyles || []);
            setBudgetPref(userProfile.budgetPref || '');
            setFrequency(userProfile.frequency || '');
            setBucketList(userProfile.bucketList || []);
        }
    }, [userProfile, currentUser]);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !currentUser) {
            navigate('/signup');
        }
    }, [authLoading, currentUser, navigate]);

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

    const toggleStyle = (id) => {
        setTravelStyles(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const addLanguage = () => setLanguages([...languages, { lang: '', level: 'Basic' }]);
    const updateLanguage = (idx, field, val) => {
        const updated = [...languages];
        updated[idx] = { ...updated[idx], [field]: val };
        setLanguages(updated);
    };
    const removeLanguage = (idx) => setLanguages(languages.filter((_, i) => i !== idx));

    const addBucketItem = () => {
        if (bucketInput.trim()) {
            setBucketList([...bucketList, bucketInput.trim()]);
            setBucketInput('');
        }
    };

    // Save current step data to Firestore
    const saveStepData = async () => {
        setSaving(true);
        try {
            if (step === 1) {
                await updateUserProfile({
                    displayName,
                    age: age ? parseInt(age) : null,
                    nationality,
                    hometown,
                });
            } else if (step === 2) {
                await updateUserProfile({
                    bio,
                    languages: languages.filter(l => l.lang.trim()),
                    travelStyles,
                    budgetPref,
                    frequency,
                });
            } else if (step === 3) {
                await updateUserProfile({
                    bucketList,
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
                displayName,
                age: age ? parseInt(age) : null,
                nationality,
                hometown,
                bio,
                languages: languages.filter(l => l.lang.trim()),
                travelStyles,
                budgetPref,
                frequency,
                bucketList,
                stats: { countries: 0, trips: 0, followers: 0 },
            });
            navigate('/profile/me');
        } catch (err) {
            console.error('Complete onboarding failed:', err);
            showSave('Error finishing setup');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        await saveStepData();
        navigate('/discover');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <Loader2 size={32} className="text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Top Nav */}
            <nav className="bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-black text-sm">R</span>
                    </div>
                    <span className="text-lg font-black text-navy-900 font-heading">Roamly</span>
                </Link>
                <div className="flex items-center gap-4">
                    {saveMsg && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                            <Check size={12} /> {saveMsg}
                        </span>
                    )}
                    <button onClick={handleSaveDraft} disabled={saving} className="text-sm font-medium text-secondary hover:text-primary-dark transition-colors disabled:opacity-50">
                        Save Draft
                    </button>
                    <button onClick={step < totalSteps ? handleNext : handleFinish} disabled={saving} className="px-5 py-2 bg-navy-900 text-white rounded-xl text-sm font-bold hover:bg-navy-800 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                        {step < totalSteps ? 'Continue' : 'Finish'}
                    </button>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-10">
                {/* Progress */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Step {step} of {totalSteps}</span>
                            <h1 className="text-2xl font-black text-navy-900 font-heading mt-1">
                                {step === 1 && "Basic Information"}
                                {step === 2 && "Travel Preferences"}
                                {step === 3 && "Showcase & Finish"}
                            </h1>
                        </div>
                        <span className="text-sm font-bold text-secondary">{progress}% Complete</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-navy-900 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                {/* ===== STEP 1 ===== */}
                {step === 1 && (
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center shadow-sm">
                            <div className="relative w-28 h-28 mx-auto mb-4">
                                <div className="w-28 h-28 rounded-full bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center overflow-hidden">
                                    {profilePhotoPreview ? (
                                        <img src={profilePhotoPreview} className="w-full h-full object-cover" alt="Profile" />
                                    ) : (
                                        <User size={48} className="text-neutral-300" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 w-9 h-9 bg-amber-400 rounded-full flex items-center justify-center cursor-pointer shadow-lg shadow-amber-400/30 hover:bg-amber-500 transition-colors">
                                    {uploading ? <Loader2 size={16} className="text-white animate-spin" /> : <Camera size={16} className="text-white" />}
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                                </label>
                            </div>
                            <h3 className="font-bold text-navy-900">Profile Photo</h3>
                            <p className="text-sm text-secondary mt-1">Show your fellow travelers who you are.</p>
                            <label className="inline-block mt-4 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium cursor-pointer hover:bg-neutral-50 transition-colors">
                                {uploading ? 'Uploading...' : 'Upload New Image'}
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                            </label>
                        </div>

                        <div className="bg-white rounded-2xl border border-neutral-100 p-8 space-y-5 shadow-sm">
                            <div>
                                <label className="text-sm font-bold text-navy-900 mb-1.5 block">Display Name</label>
                                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Alex Rover" className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-navy-900 mb-1.5 block">Age</label>
                                    <input type="number" min="13" max="100" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-navy-900 mb-1.5 block">Nationality</label>
                                    <div className="relative">
                                        <select value={nationality} onChange={(e) => setNationality(e.target.value)} className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 appearance-none">
                                            <option value="">Select country</option>
                                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-navy-900 mb-1.5 block">Hometown</label>
                                <div className="relative">
                                    <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input type="text" value={hometown} onChange={(e) => setHometown(e.target.value)} placeholder="e.g. Barcelona, Spain" className="w-full pl-9 pr-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400" />
                                </div>
                            </div>
                        </div>

                        <button onClick={handleNext} disabled={saving} className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between hover:bg-amber-100 transition-colors group disabled:opacity-50">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-sm">
                                    {saving ? <Loader2 size={18} className="text-white animate-spin" /> : <ArrowRight size={18} className="text-white" />}
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-navy-900 text-sm">Next: Travel Preferences</p>
                                    <p className="text-xs text-secondary">Share your style, languages and frequency.</p>
                                </div>
                            </div>
                            <ArrowRight size={18} className="text-amber-500 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="flex items-center justify-between">
                            <button onClick={handleSaveDraft} className="text-sm font-bold text-amber-600 hover:underline">Skip for now</button>
                            <button onClick={handleNext} disabled={saving} className="px-6 py-3 bg-navy-900 text-white rounded-xl text-sm font-bold hover:bg-navy-800 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center gap-2">
                                {saving && <Loader2 size={14} className="animate-spin" />} Save & Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* ===== STEP 2 ===== */}
                {step === 2 && (
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl border border-neutral-100 p-8 shadow-sm">
                            <label className="text-sm font-bold text-navy-900 mb-1.5 block">About Me</label>
                            <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 500))} placeholder="Tell fellow travelers about yourself, your travel philosophy, and what inspires your journeys..." className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 min-h-[120px] leading-relaxed" />
                            <p className="text-[10px] text-secondary mt-2 text-right">{bio.length}/500</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-neutral-100 p-8 shadow-sm">
                            <h3 className="text-sm font-bold text-navy-900 mb-4">Travel Style Tags</h3>
                            <p className="text-xs text-secondary mb-4">Select all that resonate with you.</p>
                            <div className="flex flex-wrap gap-2">
                                {TRAVEL_STYLES.map(s => (
                                    <button key={s.id} onClick={() => toggleStyle(s.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all border ${travelStyles.includes(s.id) ? 'bg-amber-400 text-navy-900 border-amber-400 shadow-md shadow-amber-400/20' : 'bg-white text-secondary border-neutral-200 hover:border-amber-300 hover:text-navy-900'}`}>
                                        {s.icon} {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-neutral-100 p-8 shadow-sm">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-bold text-navy-900 mb-3">Budget Preference</h3>
                                    <div className="space-y-2">
                                        {BUDGET_OPTIONS.map(b => (
                                            <button key={b} onClick={() => setBudgetPref(b)} className={`w-full px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border ${budgetPref === b ? 'bg-amber-50 border-amber-400 text-navy-900 font-bold' : 'bg-white border-neutral-200 text-secondary hover:border-amber-300'}`}>{b}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-navy-900 mb-3">Travel Frequency</h3>
                                    <div className="space-y-2">
                                        {FREQUENCY_OPTIONS.map(f => (
                                            <button key={f} onClick={() => setFrequency(f)} className={`w-full px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border ${frequency === f ? 'bg-amber-50 border-amber-400 text-navy-900 font-bold' : 'bg-white border-neutral-200 text-secondary hover:border-amber-300'}`}>{f}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-neutral-100 p-8 shadow-sm">
                            <h3 className="text-sm font-bold text-navy-900 mb-4">Languages Spoken</h3>
                            <div className="space-y-3">
                                {languages.map((l, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <input type="text" value={l.lang} onChange={(e) => updateLanguage(idx, 'lang', e.target.value)} placeholder="e.g. English" className="flex-1 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" />
                                        <select value={l.level} onChange={(e) => updateLanguage(idx, 'level', e.target.value)} className="px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 appearance-none">
                                            <option>Native</option><option>Fluent</option><option>Conversational</option><option>Basic</option>
                                        </select>
                                        {languages.length > 1 && <button onClick={() => removeLanguage(idx)} className="p-2 text-secondary hover:text-red-500"><X size={16} /></button>}
                                    </div>
                                ))}
                            </div>
                            <button onClick={addLanguage} className="mt-3 text-sm font-bold text-amber-600 hover:underline flex items-center gap-1"><Plus size={14} /> Add Language</button>
                        </div>

                        <div className="flex items-center justify-between">
                            <button onClick={() => setStep(1)} className="text-sm font-bold text-secondary hover:text-navy-900 flex items-center gap-1"><ArrowLeft size={14} /> Back</button>
                            <button onClick={handleNext} disabled={saving} className="px-6 py-3 bg-navy-900 text-white rounded-xl text-sm font-bold hover:bg-navy-800 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center gap-2">
                                {saving && <Loader2 size={14} className="animate-spin" />} Save & Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* ===== STEP 3 ===== */}
                {step === 3 && (
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl border border-neutral-100 p-8 shadow-sm">
                            <h3 className="text-sm font-bold text-navy-900 mb-1 flex items-center gap-2"><Sparkles size={16} className="text-amber-500" /> Bucket List Destinations</h3>
                            <p className="text-xs text-secondary mb-5">Where do you dream of going?</p>
                            <div className="flex gap-2 mb-4">
                                <input type="text" value={bucketInput} onChange={(e) => setBucketInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addBucketItem()} placeholder="e.g. Angkor Wat, Cambodia" className="flex-1 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" />
                                <button onClick={addBucketItem} className="px-4 py-2.5 bg-amber-400 text-navy-900 rounded-xl text-sm font-bold hover:bg-amber-500 transition-colors shadow-sm">Add</button>
                            </div>
                            {bucketList.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {bucketList.map((item, i) => (
                                        <span key={i} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 rounded-full text-sm font-medium border border-amber-200">
                                            {item}
                                            <button onClick={() => setBucketList(bucketList.filter((_, j) => j !== i))} className="hover:text-amber-600"><X size={14} /></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl border border-neutral-100 p-8 shadow-sm">
                            <h3 className="text-sm font-bold text-navy-900 mb-1 flex items-center gap-2"><Image size={16} className="text-amber-500" /> Past Trips Showcase</h3>
                            <p className="text-xs text-secondary mb-5">Share your favorite travel memories.</p>
                            <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-10 text-center hover:border-amber-300 transition-colors cursor-pointer group">
                                <div className="w-14 h-14 bg-neutral-100 group-hover:bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors">
                                    <Plus size={28} className="text-neutral-400 group-hover:text-amber-500" />
                                </div>
                                <p className="text-sm font-bold text-navy-900 mb-1">Add a Past Trip</p>
                                <p className="text-xs text-secondary">Upload photos, name the trip, and add dates.</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-neutral-100 p-8 shadow-sm">
                            <h3 className="text-sm font-bold text-navy-900 mb-4">Connect Social Accounts</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors">
                                    <Globe size={16} className="text-pink-500" /> Instagram
                                </button>
                                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors">
                                    <Globe size={16} className="text-blue-600" /> LinkedIn
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <button onClick={() => setStep(2)} className="text-sm font-bold text-secondary hover:text-navy-900 flex items-center gap-1"><ArrowLeft size={14} /> Back</button>
                            <button onClick={handleFinish} disabled={saving} className="px-8 py-3.5 bg-amber-400 text-navy-900 rounded-xl text-sm font-black hover:bg-amber-500 transition-all shadow-lg shadow-amber-400/20 active:scale-[0.98] flex items-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Finish & View Profile
                            </button>
                        </div>
                    </div>
                )}

                <footer className="text-center mt-16 py-8 border-t border-neutral-100">
                    <p className="text-xs text-secondary">© 2024 Roamly Technologies Inc. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
