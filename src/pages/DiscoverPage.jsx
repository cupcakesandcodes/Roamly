import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Search, MapPin, Calendar, Wallet, SlidersHorizontal,
    ChevronDown, ChevronLeft, ChevronRight, Map, LayoutGrid,
    Heart, ArrowRight, Star, X
} from 'lucide-react'
import StarRating from '../components/StarRating'
import VerifiedBadge from '../components/VerifiedBadge'
import { useAuth } from '../context/AuthContext'
import { TRIPS } from '../data/trips'
import { db } from '../firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

/* ──────────────────── Constants ──────────────────── */
const TRIP_TYPES = ['Adventure', 'Cultural', 'Luxury', 'Relaxation']
const GROUP_SIZES = ['1-4', '5-10', '10-20', '20+']
const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Top Rated', 'Spots Filling Fast']

/* ──────────────────── Page ──────────────────── */
export default function DiscoverPage() {
    const navigate = useNavigate()
    const { currentUser, userProfile, logout } = useAuth()
    const [search, setSearch] = useState('')
    const [selectedType, setSelectedType] = useState('')
    const [budgetRange, setBudgetRange] = useState(5000)
    const [selectedGroupSize, setSelectedGroupSize] = useState('')
    const [departureMonth, setDepartureMonth] = useState('')
    const [sortBy, setSortBy] = useState('Newest')
    const [viewMode, setViewMode] = useState('grid')
    const [currentPage, setCurrentPage] = useState(1)
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [savedTrips, setSavedTrips] = useState(new Set([2]))
    const [firebaseTrips, setFirebaseTrips] = useState([])

    useEffect(() => {
        const q = query(collection(db, 'trips'), orderBy('createdAt', 'desc'))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setFirebaseTrips(fetched)
        })
        return () => unsubscribe()
    }, [])

    const toggleSave = (id) => {
        setSavedTrips(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const filteredTrips = useMemo(() => {
        // Combine static mock data with dynamically fetched agent trips
        let list = [...TRIPS, ...firebaseTrips]

        if (search) list = list.filter(t =>
            (t.title && t.title.toLowerCase().includes(search.toLowerCase())) ||
            (t.destination && t.destination.toLowerCase().includes(search.toLowerCase()))
        )

        // Agent trips might not have exact matching tags out-of-the-box, but we can do our best
        // This relies on the agent selecting an exact match or us checking the tags array
        if (selectedType) {
            list = list.filter(t =>
                t.type === selectedType ||
                (t.tags && t.tags.includes(selectedType))
            )
        }

        if (budgetRange < 5000) list = list.filter(t => (t.price || 0) <= budgetRange)

        if (selectedGroupSize) {
            list = list.filter(t => {
                const size = t.totalSpots || parseInt(t.groupSize?.split('-')[1]) || 10;
                if (selectedGroupSize === '1-4') return size <= 4;
                if (selectedGroupSize === '5-10') return size >= 5 && size <= 10;
                if (selectedGroupSize === '10-20') return size > 10 && size <= 20;
                if (selectedGroupSize === '20+') return size > 20;
                return t.groupSize === selectedGroupSize; // Fallback for old mock data
            })
        }

        switch (sortBy) {
            case 'Price: Low to High': list.sort((a, b) => (a.price || 0) - (b.price || 0)); break
            case 'Price: High to Low': list.sort((a, b) => (b.price || 0) - (a.price || 0)); break
            case 'Top Rated': list.sort((a, b) => (b.agentRating || 5) - (a.agentRating || 5)); break
            case 'Spots Filling Fast': list.sort((a, b) => {
                const spotsLeftA = a.totalSpots ? a.totalSpots - (a.spotsFilled || 0) : (parseInt(a.groupSize?.split('-')[1]) - (a.spotsFilled || 0));
                const spotsLeftB = b.totalSpots ? b.totalSpots - (b.spotsFilled || 0) : (parseInt(b.groupSize?.split('-')[1]) - (b.spotsFilled || 0));
                return (spotsLeftA || 99) - (spotsLeftB || 99);
            }); break
            default: break // Newest is default, which is already handled by Firestore order for new trips
        }
        return list
    }, [search, selectedType, budgetRange, selectedGroupSize, sortBy, firebaseTrips])

    return (
        <div className="min-h-screen bg-white">
            <div className="pt-16">
                <div className="max-w-[1400px] mx-auto px-6 py-8">
                    {/* Integrated Search Bar */}
                    <div className="flex items-center w-full max-w-2xl bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-8 mx-auto">
                        <div className="flex items-center gap-3 px-6 py-3 border-r border-gray-100 flex-1">
                            <MapPin size={18} className="text-amber-500" />
                            <input
                                type="text"
                                placeholder="Where to next?"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="bg-transparent border-none outline-none text-base text-navy-900 placeholder:text-gray-400 w-full font-medium"
                            />
                        </div>
                        <button className="m-1 px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm transition flex-shrink-0 flex items-center gap-2">
                            <Search size={16} /> Search
                        </button>
                    </div>

                    <div className="flex gap-8">
                        {/* ─── LEFT: FILTER SIDEBAR ─── */}
                        <aside className="hidden lg:block w-56 flex-shrink-0">
                            <div className="sticky top-32">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-bold text-navy-900 uppercase tracking-widest">Filters</h3>
                                    {(selectedType || budgetRange < 5000 || selectedGroupSize || departureMonth) && (
                                        <button onClick={() => { setSelectedType(''); setBudgetRange(5000); setSelectedGroupSize(''); setDepartureMonth(''); }} className="text-[10px] font-bold text-amber-600 hover:text-amber-700 uppercase tracking-widest cursor-pointer">Clear All</button>
                                    )}
                                </div>

                                {/* Trip Type */}
                                <div className="mb-8">
                                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Trip Type</h4>
                                    <div className="space-y-3">
                                        {TRIP_TYPES.map(type => (
                                            <label key={type} className="flex items-center gap-3 cursor-pointer group" onClick={() => setSelectedType(selectedType === type ? '' : type)}>
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedType === type ? 'bg-navy-900 border-navy-900' : 'border-gray-200 group-hover:border-gray-300'}`}>
                                                    {selectedType === type && <CheckIcon size={12} className="text-white" />}
                                                </div>
                                                <span className={`text-sm transition-colors ${selectedType === type ? 'text-navy-900 font-bold' : 'text-gray-600'}`}>{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Budget */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Max Budget</h4>
                                        <span className="text-sm font-bold text-navy-900">${budgetRange}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="500"
                                        max="5000"
                                        step="100"
                                        value={budgetRange}
                                        onChange={e => setBudgetRange(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-navy-900"
                                    />
                                    <div className="flex justify-between mt-2">
                                        <span className="text-[10px] text-gray-400 font-medium">$500</span>
                                        <span className="text-[10px] text-gray-400 font-medium">$5000+</span>
                                    </div>
                                </div>

                                {/* Group Size */}
                                <div className="mb-4">
                                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Group Size</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {GROUP_SIZES.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedGroupSize(selectedGroupSize === size ? '' : size)}
                                                className={`px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${selectedGroupSize === size
                                                    ? 'bg-navy-900 text-white border-navy-900 shadow-md'
                                                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* ─── RIGHT: MAIN CONTENT ─── */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-navy-900 font-[var(--font-heading)]">Discover Trips</h1>
                                    <p className="text-sm text-gray-500 mt-1">Found {filteredTrips.length} curated journeys</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value)}
                                        className="appearance-none bg-surface border-none rounded-xl px-4 py-2.5 text-sm font-bold text-navy-900 focus:ring-2 focus:ring-navy-900/5 transition cursor-pointer"
                                    >
                                        {SORT_OPTIONS.map(opt => <option key={opt} value={opt}>Sort: {opt}</option>)}
                                    </select>
                                    <button
                                        onClick={() => setMobileFiltersOpen(true)}
                                        className="lg:hidden p-2.5 rounded-xl bg-surface hover:bg-gray-100 transition cursor-pointer"
                                    >
                                        <SlidersHorizontal size={18} className="text-navy-900" />
                                    </button>
                                </div>
                            </div>

                            {/* Trip Cards Grid */}
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredTrips.map(trip => (
                                    <DiscoverTripCard
                                        key={trip.id}
                                        trip={trip}
                                        saved={savedTrips.has(trip.id)}
                                        onToggleSave={() => toggleSave(trip.id)}
                                    />
                                ))}
                            </div>

                            {/* Pagination Placeholder */}
                            <div className="mt-12 flex justify-center gap-2">
                                <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition cursor-pointer px-0 py-0"><ChevronLeft size={18} /></button>
                                <button className="w-10 h-10 rounded-full bg-navy-900 text-white font-bold text-sm shadow-lg shadow-navy-100 px-0 py-0">1</button>
                                <button className="w-10 h-10 rounded-full border border-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-50 transition px-0 py-0 cursor-pointer">2</button>
                                <button className="w-10 h-10 rounded-full border border-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-50 transition px-0 py-0 cursor-pointer">3</button>
                                <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition px-0 py-0 cursor-pointer"><ChevronRight size={18} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Filters Drawer */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-[300px] bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="p-6 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-bold text-navy-900">Filters</h3>
                                <button onClick={() => setMobileFiltersOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition cursor-pointer px-0 py-0"><X size={20} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-8">
                                <div>
                                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Trip Type</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {TRIP_TYPES.map(type => (
                                            <button key={type} onClick={() => setSelectedType(type)} className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all ${selectedType === type ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-gray-600 border-gray-100'}`}>{type}</button>
                                        ))}
                                    </div>
                                </div>
                                {/* More mobile filters here */}
                            </div>
                            <div className="pt-6 border-t border-gray-100">
                                <button onClick={() => setMobileFiltersOpen(false)} className="w-full py-4 rounded-2xl bg-navy-900 text-white font-bold text-sm shadow-xl shadow-navy-100">Show Results</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function CheckIcon({ size, className }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
}

/* ──────────────────── Discover Trip Card ──────────────────── */
function DiscoverTripCard({ trip, saved, onToggleSave }) {
    return (
        <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
            {/* Image Section */}
            <div className="relative h-52 overflow-hidden">
                <Link to={`/trip/${trip.id}`} className="block h-full">
                    <img
                        src={trip.image}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                </Link>
                {/* Save button */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave() }}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center transition-all shadow-sm cursor-pointer px-0 py-0"
                >
                    <Heart size={18} className={saved ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
                </button>
                {/* Overlay Badge */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-navy-900 shadow-sm uppercase tracking-wider">
                    {trip.duration}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <Link to={`/trip/${trip.id}`} className="no-underline">
                        <h3 className="text-[15px] font-bold text-navy-900 leading-snug hover:text-amber-600 transition-colors">{trip.title || 'Untitled Trip'}</h3>
                    </Link>
                    <div className="text-right flex-shrink-0">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold leading-tight">From</p>
                        <p className="text-lg font-bold text-navy-900 mt-0.5">${(trip.price || 0).toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
                    <MapPin size={11} /> {trip.destination || 'Unknown Location'}
                </div>

                {/* Agent Row */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2.5">
                        <img
                            src={trip.agentAvatar || "https://ui-avatars.com/api/?name=" + (trip.agentName || "Agent")}
                            alt={trip.agentName || "Agent"}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-50 bg-gray-100"
                        />
                        <div>
                            <p className="text-xs font-bold text-navy-900 flex items-center gap-1">
                                {trip.agentName || 'Roamly Agent'}
                                {trip.agentVerified && <VerifiedBadge size={12} />}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Star size={10} className="fill-amber-400 text-amber-400" />
                                <span className="text-[10px] font-bold text-gray-400">{trip.agentRating || 'New'}</span>
                            </div>
                        </div>
                    </div>
                    <Link
                        to={`/trip/${trip.id}`}
                        className="w-9 h-9 rounded-full bg-surface hover:bg-navy-900 hover:text-white transition-all flex items-center justify-center text-navy-900 no-underline px-0 py-0"
                    >
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    )
}
