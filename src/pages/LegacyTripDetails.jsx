import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    MapPin, Calendar, Camera, Image as ImageIcon,
    ArrowLeft, Share2, Heart, Award,
    CheckCircle, User, Loader2, Sparkles,
    ShieldCheck, Quote, Star
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function LegacyTripDetails() {
    const navigate = useNavigate();
    const { uid, portfolioId } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [portfolioItem, setPortfolioItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const userDoc = await getDoc(doc(db, 'users', uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setProfileData(data);

                    if (data.portfolioItems) {
                        const item = data.portfolioItems.find(p => p.id && p.id.toString() === portfolioId);
                        setPortfolioItem(item);
                    }
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching legacy trip details:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, [uid, portfolioId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <Loader2 size={32} className="text-amber-500 animate-spin" />
            </div>
        );
    }

    if (!portfolioItem) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-navy-900 mb-2">Trip Not Found</h2>
                    <p className="text-secondary mb-6">The story you're looking for might have been archived.</p>
                    <button onClick={() => navigate(-1)} className="btn-primary px-8 py-3 rounded-xl inline-block">Go Back</button>
                </div>
            </div>
        );
    }

    const item = portfolioItem;
    const agent = profileData;

    return (
        <div className="min-h-screen bg-white font-sans text-navy-900">
            <Navbar />

            {/* Hero Section */}
            <div className="relative h-[60vh] lg:h-[70vh] overflow-hidden bg-navy-900">
                <img src={item.image || 'https://images.unsplash.com/photo-1469041746972-68c97ec27758?auto=format&fit=crop&w=1200&q=80'} className="w-full h-full object-cover scale-105" alt={item.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/20 to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full mb-12">
                    <div className="container mx-auto px-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold mb-8 hover:bg-white/20 transition-all w-fit"
                        >
                            <ArrowLeft size={16} /> Back to Agency
                        </button>

                        <div className="max-w-4xl">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-amber-400 text-navy-900 rounded-full text-[10px] font-black uppercase tracking-widest">Legacy Journey</span>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur text-white rounded-full text-[10px] font-black uppercase tracking-widest">Summer 2023</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white font-heading leading-tight mb-6">{item.title}</h1>

                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                                        <img src={agent?.profilePhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80'} className="w-full h-full object-cover" alt={agent?.displayName} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none">Curated By</p>
                                        <p className="text-sm font-bold text-white mt-1">{agent?.displayName}</p>
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-white/20 hidden md:block"></div>
                                <div className="flex items-center gap-3 text-white">
                                    <MapPin size={18} className="text-amber-400" />
                                    <span className="text-sm font-bold">Multiple Destinations</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                                    ))}
                                    <span className="text-xs font-bold text-white ml-2">(12 Reviews)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16">

                    {/* Left Column: Narrative & Gallery */}
                    <div className="space-y-12">
                        <section>
                            <h2 className="text-2xl font-black font-heading mb-6 flex items-center gap-3">
                                <Sparkles size={24} className="text-amber-500" /> The Story Behind The Trip
                            </h2>
                            <p className="text-secondary text-lg leading-relaxed mb-8">
                                {item.description || "This stunning journey was one of our most celebrated curations. We brought together a group of 12 like-minded adventurers to explore the hidden gems and local secrets of this incredible region. From sunrise hot air balloon rides to private vineyard dinners, every moment was designed to create lasting memories."}
                            </p>

                            <div className="bg-neutral-50 rounded-3xl p-8 relative overflow-hidden">
                                <Quote size={48} className="absolute -top-4 -left-4 text-amber-200/50" />
                                <p className="text-navy-900 font-bold text-xl italic relative z-10 leading-relaxed">
                                    "The attention to detail on this trip was unmatched. Our agency spent months scouting every accommodation and partner to ensure a seamless, luxury experience."
                                </p>
                                <div className="mt-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-black text-[10px]">LS</div>
                                    <p className="text-xs font-bold text-secondary">Lead Scout, {agent?.displayName}</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black font-heading mb-8 flex items-center gap-3">
                                <Camera size={24} className="text-amber-500" /> Trip Gallery
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    item.image,
                                    "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80",
                                    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80",
                                    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
                                    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80",
                                    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
                                ].map((img, i) => (
                                    <div key={i} className={`rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                                        <img src={img} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt={`Gallery ${i}`} />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-navy-900 rounded-3xl p-10 text-white">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div>
                                    <h3 className="text-2xl font-black font-heading mb-2">Inspired by this story?</h3>
                                    <p className="text-white/60 text-sm">Our agency is currently booking similar journeys for the upcoming season.</p>
                                </div>
                                <Link to={`/agency/${uid}`} className="px-8 py-4 bg-amber-400 text-navy-900 rounded-2xl font-black hover:bg-amber-500 transition-all shadow-lg shadow-amber-400/20 text-center no-underline">
                                    Consult With Us
                                </Link>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sidebar Specs */}
                    <div className="space-y-8">

                        <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-xl shadow-navy-900/5 sticky top-24">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-8 border-b border-neutral-100 pb-4">Trip Highlights</h3>
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                        <Award size={20} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Key Feature</p>
                                        <p className="text-sm font-bold text-navy-900 mt-1">Private Yacht Excursions</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                        <Calendar size={20} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Duration</p>
                                        <p className="text-sm font-bold text-navy-900 mt-1">10 Days / 9 Nights</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                        <ShieldCheck size={20} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Experience Level</p>
                                        <p className="text-sm font-bold text-navy-900 mt-1">Full-Service Luxury</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-neutral-100">
                                <div className="flex items-center gap-4 mb-4">
                                    <Share2 size={16} className="text-secondary" />
                                    <span className="text-xs font-bold text-secondary">Share This Story</span>
                                </div>
                                <button className="w-full py-3 bg-neutral-100 text-navy-900 rounded-xl text-xs font-bold hover:bg-neutral-200 transition-all flex items-center justify-center gap-2">
                                    <Heart size={14} className="text-red-500" /> Save to Favorites
                                </button>
                            </div>
                        </div>

                        {/* Agency Quick View */}
                        <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100">
                            <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest mb-6 block text-center">The Curator</h4>
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl mx-auto mb-4 border-2 border-white shadow-md overflow-hidden bg-white">
                                    <img src={agent?.profilePhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80'} className="w-full h-full object-cover" alt={agent?.displayName} />
                                </div>
                                <h4 className="font-black text-navy-900 font-heading">{agent?.displayName}</h4>
                                <p className="text-xs text-secondary mt-1 mb-6 flex items-center justify-center gap-1">
                                    <CheckCircle size={12} className="text-amber-500" /> Verified Premium Agency
                                </p>
                                <button onClick={() => navigate(`/agency/${uid}`)} className="text-sm font-black text-amber-600 hover:underline">View Agency Profile →</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Modal for Images (Optional in future) */}
        </div>
    );
}
