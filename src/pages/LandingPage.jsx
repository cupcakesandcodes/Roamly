import { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Search, Compass, ShieldCheck, CreditCard, UserPlus, ListChecks, TrendingUp,
    ChevronLeft, ChevronRight, MapPin, Star, ArrowRight, Globe, Users, Sparkles
} from 'lucide-react'
import TripCard from '../components/TripCard'
import StarRating from '../components/StarRating'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { TRIPS } from '../data/trips'

/* ──────────────────── Mock Data ──────────────────── */
const FEATURED_TRIPS = TRIPS.slice(0, 4)

const DESTINATIONS = [
    { name: 'Vietnam', trips: 24, image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80' },
    { name: 'Italy', trips: 38, image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&q=80' },
    { name: 'India', trips: 31, image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80' },
    { name: 'France', trips: 22, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80' },
    { name: 'Canada', trips: 19, image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&q=80' },
]

const TESTIMONIALS = [
    {
        text: "I've been on four trips through Roamly and each one exceeded my expectations. The agents are incredibly knowledgeable and the group dynamic was amazing!",
        name: 'Monica Chen',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80',
    },
    {
        text: "Being a solo traveller I was nervous about group trips, but Roamly made it so easy. I just booked, showed up, and had the time of my life.",
        name: 'Antony Martins',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80',
    },
    {
        text: "The verified agent system gives me peace of mind. I've referred Roamly to all my friends — the trip quality is consistently top-notch.",
        name: 'Jessica O\'Carter',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80',
    },
]

/* ──────────────────── Landing Page ──────────────────── */
export default function LandingPage() {
    const { currentUser } = useAuth()
    const carouselRef = useRef(null)

    const scroll = (dir) => {
        if (!carouselRef.current) return
        const amount = 360
        carouselRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
    }

    return (
        <main className="pt-16">
            {/* ═══════════ HERO ═══════════ */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/hero-bg.png"
                        alt="Mountain landscape"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-navy-900/60 via-navy-900/40 to-navy-900/70" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-40 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight font-[var(--font-heading)]">
                        Find Your Perfect Trip.<br />
                        <span className="text-amber-300">Guided by Experts.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Professionally curated group travel experiences crafted by verified travel agents — discover, book, and explore the world together.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/discover"
                            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-navy-900 font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 no-underline"
                        >
                            <Search size={18} />
                            Browse Trips
                        </Link>
                        {currentUser ? (
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold text-base border border-white/30 transition-all duration-200 no-underline"
                            >
                                <Users size={18} />
                                My Dashboard
                            </Link>
                        ) : (
                            <Link
                                to="/signup"
                                className="inline-flex items-center px-8 py-3.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold text-base backdrop-blur-md border border-white/30 transition-all duration-200 no-underline"
                            >
                                Sign Up
                            </Link>
                        )}
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm">
                        <span className="flex items-center gap-1.5"><Users size={15} /> 12,000+ Travellers</span>
                        <span className="flex items-center gap-1.5"><Globe size={15} /> 85+ Destinations</span>
                        <span className="flex items-center gap-1.5"><ShieldCheck size={15} /> 400+ Verified Agents</span>
                    </div>
                </div>
            </section>

            {/* ═══════════ FEATURED TRIPS ═══════════ */}
            <section className="py-20 bg-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-navy-900 font-[var(--font-heading)]">Featured Trips</h2>
                            <p className="text-text-secondary mt-1">Hand-picked adventures from our top-rated agents</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                            <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-border hover:bg-surface-muted flex items-center justify-center transition-colors">
                                <ChevronLeft size={18} />
                            </button>
                            <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-border hover:bg-surface-muted flex items-center justify-center transition-colors">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div
                        ref={carouselRef}
                        className="flex gap-6 overflow-x-auto scroll-smooth pb-4"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {FEATURED_TRIPS.map(trip => (
                            <Link to={`/trip/${trip.id}`} key={trip.id} className="min-w-[300px] max-w-[340px] flex-shrink-0 no-underline transition-transform hover:-translate-y-1">
                                <TripCard trip={trip} />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section className="py-20 bg-surface-alt">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-navy-900 font-[var(--font-heading)]">How Roamly Works</h2>
                        <p className="text-text-secondary mt-2 max-w-xl mx-auto">We bridge the gap between travel enthusiasts and trusted local expertise to create seamless group travel experiences.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* For Travellers */}
                        <div className="bg-white rounded-2xl p-8 border border-border">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                                    <Compass size={20} className="text-primary-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-navy-900">For Travellers</h3>
                            </div>
                            <div className="space-y-5">
                                {[
                                    { icon: <Search size={18} />, title: 'Discover Curated Trips', desc: 'Browse expert-crafted group trips by destination, style, and budget.' },
                                    { icon: <ShieldCheck size={18} />, title: 'Connect with Agents', desc: 'Chat directly with verified local guides and experienced planners.' },
                                    { icon: <CreditCard size={18} />, title: 'Book Securely', desc: 'Pay safely through our platform. Full protection and easy cancellation.' },
                                ].map((step, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 text-primary-600">
                                            {step.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-navy-900">{step.title}</h4>
                                            <p className="text-sm text-text-secondary mt-0.5">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* For Agents */}
                        <div className="bg-navy-900 rounded-2xl p-8 text-white">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center">
                                    <Sparkles size={20} className="text-amber-400" />
                                </div>
                                <h3 className="text-lg font-semibold">For Agents</h3>
                            </div>
                            <div className="space-y-5">
                                {[
                                    { icon: <UserPlus size={18} />, title: 'Build Your Profile', desc: 'Showcase your expertise, certifications, and past trip portfolio.' },
                                    { icon: <ListChecks size={18} />, title: 'List Experiences', desc: 'Create and manage group trips with our full itinerary builder tools.' },
                                    { icon: <TrendingUp size={18} />, title: 'Grow Your Business', desc: 'Reach thousands of travellers worldwide and track your performance.' },
                                ].map((step, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-9 h-9 rounded-xl bg-amber-400/20 flex items-center justify-center flex-shrink-0 text-amber-400">
                                            {step.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                                            <p className="text-sm text-navy-300 mt-0.5">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ TRENDING DESTINATIONS ═══════════ */}
            <section className="py-20 bg-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-10">
                        <h2 className="text-3xl font-bold text-navy-900 font-[var(--font-heading)]">Trending Destinations</h2>
                        <a href="#" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition no-underline">
                            View all destinations <ArrowRight size={14} />
                        </a>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {DESTINATIONS.map((dest, i) => (
                            <a
                                key={dest.name}
                                href="#"
                                className={`group relative overflow-hidden rounded-2xl no-underline ${i < 2 ? 'aspect-[4/3]' : i === 2 ? 'aspect-[4/3] row-span-2' : 'aspect-[4/3]'
                                    }`}
                            >
                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-4">
                                    <h3 className="text-white text-lg font-bold">{dest.name}</h3>
                                    <p className="text-white/70 text-sm flex items-center gap-1">
                                        <MapPin size={12} /> {dest.trips} trips available
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ TESTIMONIALS ═══════════ */}
            <section className="py-20 bg-surface-alt">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-navy-900 font-[var(--font-heading)]">What our travellers say</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-border hover:shadow-lg transition-all duration-300">
                                <StarRating rating={t.rating} size={14} showValue={false} />
                                <p className="text-sm text-text-secondary mt-4 mb-6 leading-relaxed italic">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                                    <span className="text-sm font-semibold text-navy-900">{t.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ CTA BANNER ═══════════ */}
            <section className="py-20 bg-navy-900">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-heading)]">
                        Ready to explore the world?
                    </h2>
                    <p className="text-navy-300 text-lg mb-8 max-w-2xl mx-auto">
                        Join thousands of travellers discovering curated group adventures — or become a verified agent and grow your travel business.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/discover" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-navy-900 font-semibold transition-all shadow-lg no-underline">
                            <Search size={18} /> Start Exploring
                        </Link>
                        <Link to="/become-agent" className="inline-flex items-center px-8 py-3.5 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition-all no-underline">
                            Become an Agent
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
