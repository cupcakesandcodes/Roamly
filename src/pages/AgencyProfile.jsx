import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    MapPin, Star, ShieldCheck, Globe, Mail,
    Calendar, Users, Briefcase, Award, ArrowRight,
    Camera, Image as ImageIcon, MessageSquare,
    CheckCircle, Shield, Loader2, Play
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function AgencyProfile() {
    const navigate = useNavigate();
    const { uid } = useParams();
    const { currentUser, userProfile, loading: authLoading } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [activeTrips, setActiveTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const isMe = !uid || uid === 'me' || uid === currentUser?.uid;
    const profileId = isMe ? currentUser?.uid : uid;

    useEffect(() => {
        if (!authLoading && !currentUser) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            if (!profileId) return;
            try {
                setLoading(true);
                // Fetch Profile
                const userDoc = await getDoc(doc(db, 'users', profileId));
                if (userDoc.exists()) {
                    setProfileData(userDoc.data());
                }

                // Fetch Active Trips
                const tripsQuery = query(
                    collection(db, 'trips'),
                    where('agentId', '==', profileId)
                );
                const tripsSnap = await getDocs(tripsQuery);
                const trips = tripsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setActiveTrips(trips);

                setLoading(false);
            } catch (err) {
                console.error("Error fetching agency profile:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, [authLoading, currentUser, navigate, profileId]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <Loader2 size={32} className="text-amber-500 animate-spin" />
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-navy-900 mb-2">Agency Not Found</h2>
                    <p className="text-secondary mb-6">This professional profile may have been removed or moved.</p>
                    <Link to="/discover" className="btn-primary px-8 py-3 rounded-xl inline-block no-underline">Browse Trips</Link>
                </div>
            </div>
        );
    }

    const p = profileData;
    const name = p.displayName || 'Agency Name';
    const avatar = p.profilePhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80';
    const coverImage = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"; // Default cover

    return (
        <div className="min-h-screen bg-neutral-50 font-sans">
            <Navbar />

            {/* Header / Cover Section */}
            <div className="relative h-[320px] lg:h-[400px] overflow-hidden">
                <img src={coverImage} className="w-full h-full object-cover" alt="Cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                {/* Profile Stats Overlay */}
                <div className="absolute bottom-0 left-0 w-full">
                    <div className="container mx-auto px-6 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-white overflow-hidden shadow-2xl bg-white">
                                    <img src={avatar} className="w-full h-full object-cover" alt={name} />
                                </div>
                                {p.isVerified && (
                                    <div className="absolute -bottom-2 -right-2 bg-amber-400 p-2 rounded-xl shadow-lg shadow-amber-400/30">
                                        <ShieldCheck size={20} className="text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="text-white">
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-2xl md:text-4xl font-black font-heading tracking-tight">{name}</h1>
                                    <CheckCircle size={20} className="text-amber-400" />
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-white/80">
                                    <span className="flex items-center gap-1.5"><MapPin size={16} className="text-amber-400" /> {p.location || 'Global'}</span>
                                    <span className="flex items-center gap-1.5"><Star size={16} className="text-amber-400 fill-amber-400" /> {p.stats?.avgRating || 4.9} Agency Rating</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {isMe ? (
                                <button onClick={() => navigate('/agent/dashboard')} className="px-6 py-3 bg-white text-navy-900 rounded-xl font-bold hover:bg-neutral-50 transition-all flex items-center gap-2 text-sm shadow-lg">
                                    Manage Dashboard <ArrowRight size={16} />
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            const chatParticipants = [currentUser.uid, profileId].sort();
                                            const chatId = `dm_${chatParticipants[0]}_${chatParticipants[1]}`;
                                            navigate(`/messages/${chatId}`);
                                        }}
                                        className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 transition-all flex items-center gap-2 text-sm shadow-lg"
                                    >
                                        <MessageSquare size={16} /> Message
                                    </button>
                                    <button className="px-8 py-3 bg-amber-400 text-navy-900 rounded-xl font-black hover:bg-amber-500 transition-all flex items-center gap-2 text-sm shadow-lg shadow-amber-400/20">
                                        Follow Agency
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-12">
                {isMe && !p.isVerified && (
                    <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-center md:text-left">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-amber-100 flex-shrink-0">
                                <Shield className="text-amber-500 animate-pulse" size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-navy-900">Your profile is currently under review</h3>
                                <p className="text-xs text-secondary mt-0.5">We typically verify new agencies within 24-48 hours. You can still list and manage trips!</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/agent/trip-builder')} className="px-6 py-2.5 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800 transition-all">List New Trip</button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12">

                    {/* Left Column: About & Trips */}
                    <div className="space-y-12">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Trips', val: p.stats?.totalTrips || activeTrips.length, icon: <ImageIcon size={18} /> },
                                { label: 'Travellers', val: p.stats?.travellers || '1.2k+', icon: <Users size={18} /> },
                                { label: 'Exp. Years', val: p.experience || '5+', icon: <Award size={18} /> },
                                { label: 'Response', val: p.responseTime || 'High', icon: <Play size={18} className="rotate-90" /> },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm text-center md:text-left group hover:border-amber-400 transition-colors">
                                    <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center mb-4 text-secondary group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors mx-auto md:mx-0">
                                        {stat.icon}
                                    </div>
                                    <p className="text-2xl font-black text-navy-900 font-heading">{stat.val}</p>
                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Bio Section */}
                        <div className="bg-white p-8 md:p-10 rounded-3xl border border-neutral-100 shadow-sm">
                            <h2 className="text-xl font-black text-navy-900 font-heading mb-6 flex items-center gap-3">
                                <CheckCircle size={24} className="text-amber-500" /> About Our Agency
                            </h2>
                            <p className="text-secondary leading-relaxed text-sm md:text-base mb-8">
                                {p.bio || "No biography provided. This professional agency specializes in creating unique, curated travel experiences for Roamly travelers."}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {p.specializations?.map(s => (
                                    <span key={s} className="px-4 py-2 bg-neutral-100 text-navy-900 rounded-full text-xs font-bold uppercase tracking-wider">{s}</span>
                                ))}
                            </div>
                        </div>

                        {/* Active Trips Portfolio */}
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black text-navy-900 font-heading flex items-center gap-3">
                                    <Briefcase size={24} className="text-amber-500" /> Active Curations
                                </h2>
                                <Link to="/discover" className="text-sm font-bold text-amber-600 hover:underline">View All Listings →</Link>
                            </div>

                            {activeTrips.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {activeTrips.map(trip => (
                                        <div key={trip.id} className="group bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                                            <div className="aspect-[16/10] relative overflow-hidden">
                                                <img src={trip.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={trip.title} />
                                                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black text-navy-900 uppercase">
                                                    {trip.numDays || 7} Days
                                                </div>
                                                <div className="absolute bottom-4 left-4">
                                                    <span className="px-3 py-1 bg-amber-400 text-white rounded-full text-[10px] font-black uppercase tracking-wider">Upcoming</span>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h3 className="text-lg font-black text-navy-900 font-heading group-hover:text-amber-600 transition-colors mb-2">{trip.title}</h3>
                                                <div className="flex items-center justify-between mt-6">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">From</p>
                                                        <p className="text-xl font-black text-navy-900">${trip.price}</p>
                                                    </div>
                                                    <Link to={`/trip/${trip.id}`} className="px-6 py-2.5 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800 transition-all no-underline">
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white p-12 rounded-3xl border border-dashed border-neutral-200 text-center">
                                    <ImageIcon size={48} className="text-neutral-200 mx-auto mb-4" />
                                    <p className="text-secondary font-bold">No active curated trips yet.</p>
                                    <p className="text-xs text-secondary mt-1 max-w-xs mx-auto">Check back soon for unique experiences from this agency.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-8">

                        {/* Highlights Box */}
                        <div className="bg-navy-900 rounded-3xl p-8 text-white shadow-xl">
                            <h3 className="text-sm font-black uppercase tracking-widest border-b border-white/10 pb-4 mb-6">Agency Details</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                        <Globe size={16} className="text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Global Reach</p>
                                        <p className="text-sm font-bold text-white mt-0.5">{p.location || 'Based Worldwide'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                        <Calendar size={16} className="text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">On Roamly Since</p>
                                        <p className="text-sm font-bold text-white mt-0.5">March 2024</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                        <Mail size={16} className="text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Contact Response</p>
                                        <p className="text-sm font-bold text-white mt-0.5">{p.responseTime || 'Usually within 2h'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/10">
                                <div className="flex items-center gap-4">
                                    <CheckCircle size={14} className="text-emerald-400" />
                                    <span className="text-xs font-bold text-white/70">Verified Operations</span>
                                </div>
                                <div className="flex items-center gap-4 mt-3">
                                    <CheckCircle size={14} className="text-emerald-400" />
                                    <span className="text-xs font-bold text-white/70">Insured Bookings</span>
                                </div>
                            </div>
                        </div>

                        {/* Past Portfolios Grid */}
                        <div>
                            <h3 className="text-sm font-black text-navy-900 uppercase tracking-widest mb-4">Past Trip Highlights</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {p.portfolioItems?.length > 0 ? p.portfolioItems.map((item, i) => (
                                    <Link
                                        key={i}
                                        to={`/agency/${profileId}/legacy/${item.id}`}
                                        className="relative aspect-square rounded-2xl overflow-hidden group border border-neutral-200"
                                    >
                                        <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title} />
                                        <div className="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-[10px] uppercase tracking-widest gap-2">
                                            View Story <ArrowRight size={12} />
                                        </div>
                                    </Link>
                                )) : (
                                    [1, 2, 3, 4].map(i => (
                                        <div key={i} className="aspect-square bg-neutral-200 rounded-2xl animate-pulse"></div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Social Sidebar */}
                        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm text-center">
                            <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest mb-4">Follow the Journey</h4>
                            <div className="flex justify-center gap-4">
                                <a href="#" className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-secondary hover:bg-amber-50 hover:text-amber-600 transition-colors">
                                    <ImageIcon size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-secondary hover:bg-amber-50 hover:text-amber-600 transition-colors">
                                    <Globe size={18} />
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-neutral-100 py-12">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center shadow-lg"><span className="text-white font-black text-sm">R</span></div>
                        <span className="text-xl font-black text-navy-900 font-heading">Roamly</span>
                    </div>
                    <p className="text-sm text-secondary max-w-xs mx-auto">Connecting premium agents with modern travelers for unforgettable stories.</p>
                </div>
            </footer>
        </div>
    );
}
