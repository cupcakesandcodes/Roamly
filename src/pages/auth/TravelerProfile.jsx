import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    MapPin, Flag, Globe, Mail, Star, Shield, Camera,
    Mountain, Crown, Calendar, Instagram, Linkedin, Image,
    Settings, LogOut, Loader2, Edit3, User
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

const STYLE_LABELS = {
    backpacker: 'Backpacker', luxury: 'Luxury', slow: 'Slow Travel',
    adventure: 'Adventure', foodie: 'Foodie', party: 'Party',
    cultural: 'Cultural', wellness: 'Wellness'
};

import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function TravelerProfile() {
    const navigate = useNavigate();
    const { uid } = useParams();
    const { currentUser, userProfile, loading: authLoading, logout } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    const isMe = !uid || uid === 'me' || uid === currentUser?.uid;

    useEffect(() => {
        if (!authLoading && !currentUser) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            if (isMe) {
                if (userProfile?.role === 'agent') {
                    navigate(`/agency/${currentUser.uid}`, { replace: true });
                    return;
                }
                setProfileData(userProfile);
                setProfileLoading(false);
            } else {
                try {
                    setProfileLoading(true);
                    const userDoc = await getDoc(doc(db, 'users', uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        if (data.role === 'agent') {
                            navigate(`/agency/${uid}`, { replace: true });
                            return;
                        }
                        setProfileData(data);
                    }
                    setProfileLoading(false);
                } catch (err) {
                    console.error("Error fetching profile:", err);
                    setProfileLoading(false);
                }
            }
        };

        fetchProfile();
    }, [authLoading, currentUser, navigate, uid, userProfile, isMe]);

    if (authLoading || profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <Loader2 size={32} className="text-amber-500 animate-spin" />
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-center">
                <div>
                    <Loader2 size={32} className="text-amber-500 animate-spin mx-auto mb-4" />
                    <p className="text-secondary">Profile not found or loading...</p>
                    <Link to="/dashboard" className="text-navy-900 font-bold mt-4 inline-block">Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    const p = profileData;
    const photoURL = p.profilePhoto || currentUser?.photoURL || '';
    const name = p.displayName || currentUser?.displayName || 'Traveler';

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Bucket list images (placeholder since we don't store images for bucket list items yet)
    const bucketImages = [
        'https://images.unsplash.com/photo-1508804052814-6f8a7140925c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    ];

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            <div className="pt-20 pb-16">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">

                        {/* ─── Left Column ─── */}
                        <div className="space-y-6">
                            {/* Profile Card */}
                            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 text-center">
                                <div className="relative w-28 h-28 mx-auto mb-4">
                                    {photoURL ? (
                                        <img src={photoURL} className="w-28 h-28 rounded-2xl object-cover shadow-lg" alt={name} />
                                    ) : (
                                        <div className="w-28 h-28 rounded-2xl bg-neutral-100 flex items-center justify-center shadow-lg">
                                            <User size={48} className="text-neutral-300" />
                                        </div>
                                    )}
                                    {p.onboardingComplete && (
                                        <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-3 border-white shadow-md">
                                            <Shield size={14} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                {p.onboardingComplete && (
                                    <span className="inline-block px-3 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">Verified</span>
                                )}
                                <h2 className="text-xl font-black text-navy-900 font-heading">{name}{p.age ? `, ${p.age}` : ''}</h2>
                                {p.hometown && (
                                    <p className="text-sm text-secondary flex items-center justify-center gap-1 mt-1">
                                        <MapPin size={14} /> {p.hometown}
                                    </p>
                                )}
                                {p.nationality && (
                                    <p className="text-sm text-secondary flex items-center justify-center gap-1 mt-0.5">
                                        <Flag size={14} /> {p.nationality}
                                    </p>
                                )}
                                <p className="text-xs text-secondary mt-2">{p.email || currentUser?.email}</p>

                                <div className="flex gap-2 mt-5">
                                    {isMe ? (
                                        <>
                                            <button onClick={() => navigate('/onboarding/traveler')} className="flex-1 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-bold hover:bg-navy-800 transition-all shadow-sm flex items-center justify-center gap-1.5">
                                                <Edit3 size={14} /> Edit Profile
                                            </button>
                                            <button onClick={handleLogout} className="w-11 h-11 border border-neutral-200 rounded-xl flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors group">
                                                <LogOut size={16} className="text-secondary group-hover:text-red-500" />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                const chatParticipants = [currentUser.uid, uid].sort();
                                                const chatId = `dm_${chatParticipants[0]}_${chatParticipants[1]}`;
                                                navigate(`/messages/${chatId}`);
                                            }}
                                            className="w-full py-2.5 bg-amber-400 text-navy-900 rounded-xl text-sm font-black hover:bg-amber-500 transition-all shadow-md flex items-center justify-center gap-1.5"
                                        >
                                            <MessageSquare size={14} /> Send Message
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Languages */}
                            {p.languages?.length > 0 && p.languages[0]?.lang && (
                                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
                                    <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest mb-3">Languages</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {p.languages.filter(l => l.lang).map((l, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-neutral-100 rounded-full text-xs font-medium text-navy-900">
                                                {l.lang} ({l.level})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Travel Persona */}
                            {(p.travelStyles?.length > 0 || p.budgetPref || p.frequency) && (
                                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
                                    {p.travelStyles?.length > 0 && (
                                        <>
                                            <h4 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
                                                <Mountain size={16} className="text-amber-500" /> Travel Persona
                                            </h4>
                                            <div className="flex flex-wrap gap-2 mb-5">
                                                {p.travelStyles.map((s, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-neutral-100 rounded-full text-xs font-medium text-navy-900">{STYLE_LABELS[s] || s}</span>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {p.budgetPref && (
                                        <>
                                            <h4 className="text-sm font-bold text-navy-900 mb-2 flex items-center gap-2">
                                                <Crown size={16} className="text-amber-500" /> Budget Style
                                            </h4>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="flex-1 bg-neutral-200 rounded-full h-2">
                                                    <div className={`h-2 rounded-full transition-all ${p.budgetPref === 'Budget' ? 'w-1/3 bg-sky-400' : p.budgetPref === 'Mid-Range' ? 'w-2/3 bg-amber-400' : 'w-full bg-amber-500'}`}></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{p.budgetPref}</span>
                                            </div>
                                        </>
                                    )}

                                    {p.frequency && (
                                        <>
                                            <h4 className="text-sm font-bold text-navy-900 mt-4 mb-1 flex items-center gap-2">
                                                <Calendar size={16} className="text-amber-500" /> Frequency
                                            </h4>
                                            <p className="text-sm text-secondary">{p.frequency}</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ─── Right Column ─── */}
                        <div className="space-y-8">
                            {/* About Me */}
                            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8">
                                <h3 className="text-lg font-bold text-navy-900 font-heading mb-4">About Me</h3>
                                {p.bio ? (
                                    <p className="text-sm text-secondary leading-relaxed mb-6">{p.bio}</p>
                                ) : (
                                    <p className="text-sm text-secondary/50 italic mb-6">No bio yet. <Link to="/onboarding/traveler" className="text-amber-600 font-bold hover:underline not-italic">Add one →</Link></p>
                                )}
                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-navy-900 font-heading">{p.stats?.countries || 0}</p>
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Countries</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-navy-900 font-heading">{p.stats?.trips || 0}</p>
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Trips</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-navy-900 font-heading">{p.stats?.followers || 0}</p>
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Friends</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bucket List */}
                            {p.bucketList?.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-navy-900 font-heading flex items-center gap-2">
                                            <Star size={18} className="text-amber-500" /> Bucket List
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {p.bucketList.map((item, i) => (
                                            <div key={i} className="relative group rounded-2xl overflow-hidden h-48 shadow-sm bg-gradient-to-br from-amber-100 to-orange-100">
                                                {bucketImages[i % bucketImages.length] && (
                                                    <>
                                                        <img src={bucketImages[i % bucketImages.length]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item} />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                                                    </>
                                                )}
                                                <div className="absolute bottom-0 left-0 p-4">
                                                    <h4 className="text-white font-bold text-sm">{item}</h4>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty State for Incomplete Profile */}
                            {isMe && !p.onboardingComplete && (
                                <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-8 text-center">
                                    <h3 className="text-lg font-bold text-navy-900 mb-2">Complete Your Profile</h3>
                                    <p className="text-sm text-secondary mb-4">Add your travel preferences, bucket list, and past trips to connect with fellow travelers.</p>
                                    <button onClick={() => navigate('/onboarding/traveler')} className="px-6 py-3 bg-amber-400 text-navy-900 rounded-xl text-sm font-black hover:bg-amber-500 transition-all shadow-md">
                                        Continue Setup →
                                    </button>
                                </div>
                            )}

                            {/* Past Trips placeholder */}
                            <div>
                                <h3 className="text-lg font-bold text-navy-900 font-heading mb-4">Past Trips</h3>
                                <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-10 text-center">
                                    <Image size={32} className="text-neutral-300 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-navy-900 mb-1">No past trips yet</p>
                                    <p className="text-xs text-secondary">Your trip showcase will appear here after you complete your first trip with Roamly.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-neutral-100 py-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center"><span className="text-white font-black text-xs">R</span></div>
                    <span className="font-bold text-navy-900 font-heading">Roamly</span>
                </div>
                <p className="text-xs text-secondary">© 2024 Roamly Technologies Inc. Premium Travel Experiences.</p>
            </footer>
        </div>
    );
}
