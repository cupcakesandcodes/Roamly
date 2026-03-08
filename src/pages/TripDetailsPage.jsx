import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    MapPin, Calendar, Clock, Users, Star, Shield,
    ArrowRight, ChevronLeft, ChevronRight, Check, X,
    Heart, Share2, Info, Compass, ShieldCheck, Mail, ArrowUpRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getTripById } from '../data/trips'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import VerifiedBadge from '../components/VerifiedBadge'
import StarRating from '../components/StarRating'
import Footer from '../components/Footer'

/* ──────────────────── Page ──────────────────── */
export default function TripDetailsPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { currentUser, userProfile } = useAuth()
    const trip = getTripById(id)

    const overviewRef = useRef(null)
    const itineraryRef = useRef(null)
    const agentRef = useRef(null)
    const reviewsRef = useRef(null)
    const [activeTab, setActiveTab] = useState('Overview')

    // Booking Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [bookingStep, setBookingStep] = useState(1) // 1: Info, 2: Review, 3: Success
    const [guests, setGuests] = useState(2)
    const [bookingMessage, setBookingMessage] = useState('')

    // Scroll progress for header
    const [scrollOffset, setScrollOffset] = useState(0)
    useEffect(() => {
        const handleScroll = () => setScrollOffset(window.scrollY)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (!trip) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-navy-900 mb-2">Trip Not Found</h2>
                    <p className="text-gray-500 mb-6">The trip you are looking for doesn't exist or has been removed.</p>
                    <Link to="/discover" className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-xl font-bold hover:bg-navy-800 transition no-underline">
                        <ChevronLeft size={18} /> Back to Discover
                    </Link>
                </div>
            </div>
        )
    }

    const totalReviews = Object.values(trip?.reviewBreakdown || {}).reduce((a, b) => a + b, 0)

    const scrollTo = (ref, tab) => {
        setActiveTab(tab)
        const offset = 120 // Header height
        const top = ref.current.getBoundingClientRect().top + window.pageYOffset - offset
        window.scrollTo({ top, behavior: 'smooth' })
    }

    return (
        <div className="min-h-screen bg-white pt-16">
            {/* ═══════ BOOKING MODAL ═══════ */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-navy-900">
                                {bookingStep === 3 ? 'Request Sent!' : 'Request to Book'}
                            </h3>
                            <button onClick={() => { setIsModalOpen(false); setBookingStep(1); }} className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer px-0 py-0"><X size={20} /></button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8">
                            {bookingStep === 1 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                        <img src={trip.image} className="w-20 h-20 rounded-xl object-cover" />
                                        <div>
                                            <h4 className="font-bold text-navy-900 line-clamp-1">{trip.title}</h4>
                                            <p className="text-sm text-gray-500">{trip.dates}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-navy-900 mb-3 lowercase tracking-wide uppercase">Number of Travellers</label>
                                        <div className="flex items-center gap-6">
                                            <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer px-0 py-0"><ChevronLeft size={20} /></button>
                                            <span className="text-2xl font-bold text-navy-900 w-8 text-center">{guests}</span>
                                            <button onClick={() => setGuests(Math.min(trip.spotsLeft, guests + 1))} className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer px-0 py-0"><ChevronRight size={20} /></button>
                                            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">{trip.spotsLeft} spots left</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-navy-900 mb-2 lowercase tracking-wide uppercase">Add a message (Optional)</label>
                                        <textarea
                                            value={bookingMessage}
                                            onChange={(e) => setBookingMessage(e.target.value)}
                                            placeholder="Introduce yourself to the agent..."
                                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-navy-900/5 min-h-[100px] outline-none"
                                        />
                                    </div>

                                    <button
                                        onClick={() => setBookingStep(2)}
                                        className="w-full py-4 rounded-2xl bg-navy-900 text-white font-bold text-sm shadow-xl shadow-navy-100 hover:bg-navy-800 transition-all cursor-pointer"
                                    >
                                        Continue to Review
                                    </button>
                                </div>
                            )}

                            {bookingStep === 2 && (
                                <div className="space-y-6">
                                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                            Your request will be sent to <strong>{trip.agentName}</strong>. They typically respond within 12 hours. No payment is required until your request is approved.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                                            <span className="text-gray-500 font-medium">Price per person</span>
                                            <span className="font-bold text-navy-900">${trip.price}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                                            <span className="text-gray-500 font-medium">Travellers</span>
                                            <span className="font-bold text-navy-900">{guests}</span>
                                        </div>
                                        <div className="flex justify-between text-lg py-4">
                                            <span className="font-bold text-navy-900">Total</span>
                                            <span className="font-extrabold text-navy-900">${(trip.price * guests).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button onClick={() => setBookingStep(1)} className="flex-1 py-4 rounded-2xl border border-gray-200 font-bold text-sm hover:bg-gray-50 transition cursor-pointer">Back</button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    if (!currentUser) {
                                                        navigate('/login');
                                                        return;
                                                    }
                                                    await addDoc(collection(db, 'bookings'), {
                                                        tripId: trip.id,
                                                        userId: currentUser.uid,
                                                        userName: userProfile?.displayName || currentUser.displayName || 'Guest',
                                                        userPhoto: userProfile?.profilePhoto || currentUser.photoURL || '',
                                                        message: bookingMessage,
                                                        guests: guests,
                                                        status: 'PENDING',
                                                        createdAt: serverTimestamp()
                                                    });
                                                    setBookingStep(3);
                                                } catch (err) {
                                                    console.error("Error booking trip:", err);
                                                    alert("Failed to send booking request. Please try again.");
                                                }
                                            }}
                                            className="flex-[2] py-4 rounded-2xl bg-navy-900 text-white font-bold text-sm shadow-xl shadow-navy-100 hover:bg-navy-800 transition-all cursor-pointer"
                                        >
                                            Send Request
                                        </button>
                                    </div>
                                </div>
                            )}

                            {bookingStep === 3 && (
                                <div className="text-center py-6">
                                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check size={36} strokeWidth={3} />
                                    </div>
                                    <h4 className="text-2xl font-bold text-navy-900 mb-3">You're all set!</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed mb-8 px-4">
                                        Your booking request for <strong>{trip.title}</strong> has been sent to {trip.agentName}. We'll notify you as soon as they respond!
                                    </p>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full py-4 rounded-2xl bg-navy-900 text-white font-bold text-sm shadow-xl shadow-navy-100 transition-all cursor-pointer"
                                    >
                                        View in Dashboard
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ HERO SECTION ═══════ */}
            <div className="relative h-[70vh] min-h-[500px]">
                <img src={trip.image} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Floating Actions */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition flex items-center justify-center text-white pointer-events-auto cursor-pointer border-none px-0 py-0"><ChevronLeft size={24} /></button>
                    <div className="flex gap-3 pointer-events-auto">
                        <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition flex items-center justify-center text-white cursor-pointer border-none px-0 py-0"><Share2 size={20} /></button>
                        <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition flex items-center justify-center text-white cursor-pointer border-none px-0 py-0"><Heart size={20} /></button>
                    </div>
                </div>

                <div className="absolute bottom-12 left-0 right-0">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500 text-white rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 shadow-lg">
                            <Star size={12} className="fill-white" /> Featured Journey
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight max-w-4xl font-[var(--font-heading)]">
                            {trip.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-white/90">
                            <div className="flex items-center gap-2"><MapPin size={18} className="text-amber-400" /> <span className="text-sm font-bold uppercase tracking-wide">{trip.destination}</span></div>
                            <div className="flex items-center gap-2"><Calendar size={18} className="text-amber-400" /> <span className="text-sm font-bold uppercase tracking-wide">{trip.dates}</span></div>
                            <div className="flex items-center gap-2"><Users size={18} className="text-amber-400" /> <span className="text-sm font-bold uppercase tracking-wide">{trip.groupSize} Travellers</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════ STICKY TABS ═══════ */}
            <div className={`sticky top-16 z-40 bg-white border-b border-gray-100 transition-shadow ${scrollOffset > 400 ? 'shadow-md' : ''}`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-8 h-16 overflow-x-auto no-scrollbar">
                        {['Overview', 'Itinerary', 'Agent', 'Reviews'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => {
                                    if (tab === 'Overview') scrollTo(overviewRef, 'Overview')
                                    if (tab === 'Itinerary') scrollTo(itineraryRef, 'Itinerary')
                                    if (tab === 'Agent') scrollTo(agentRef, 'Agent')
                                    if (tab === 'Reviews') scrollTo(reviewsRef, 'Reviews')
                                }}
                                className={`text-sm font-bold whitespace-nowrap transition-all relative h-full flex items-center cursor-pointer border-none bg-transparent px-0 py-0 ${activeTab === tab ? 'text-navy-900 border-b-2 border-navy-900' : 'text-gray-400 hover:text-navy-600'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════ CONTENT MAIN ═══════ */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-16">

                    {/* LEFT COL: DETAILS */}
                    <div className="flex-1 space-y-16">
                        {/* Overview Section */}
                        <section ref={overviewRef} className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-navy-900 mb-6 lowercase tracking-tight uppercase">Adventure Overview</h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                {trip.description}
                            </p>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="p-8 bg-gray-50 rounded-3xl">
                                    <h4 className="text-sm font-bold text-navy-900 mb-6 flex items-center gap-2 uppercase tracking-widest"><CheckIcon size={18} className="text-emerald-500" /> What's Included</h4>
                                    <ul className="space-y-4">
                                        {trip.included?.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-8 bg-gray-50 rounded-3xl">
                                    <h4 className="text-sm font-bold text-navy-900 mb-6 flex items-center gap-2 uppercase tracking-widest"><XIcon size={18} className="text-red-500" /> What's Excluded</h4>
                                    <ul className="space-y-4">
                                        {trip.excluded?.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600 font-medium opacity-70">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Itinerary Section */}
                        <section ref={itineraryRef} className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-navy-900 mb-8 lowercase tracking-tight uppercase">Journey Itinerary</h2>
                            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-px before:bg-gray-100">
                                {trip.itinerary?.map((day, i) => (
                                    <div key={i} className="relative pl-12 pb-4">
                                        <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-navy-900 text-white flex items-center justify-center text-[10px] font-bold z-10">
                                            {day.day}
                                        </div>
                                        <div className="p-6 bg-white border border-gray-100 rounded-2xl hover:border-navy-100 hover:shadow-lg hover:shadow-navy-50/5 transition-all">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${day.tagColor || 'bg-gray-100 text-gray-500'}`}>{day.tag}</span>
                                                <span className="text-xs font-bold text-gray-400">{day.time}</span>
                                            </div>
                                            <h4 className="text-lg font-bold text-navy-900 mb-3">{day.title}</h4>
                                            <p className="text-sm text-gray-500 leading-relaxed mb-4">{day.description}</p>
                                            {day.image && <img src={day.image} className="w-full h-48 object-cover rounded-xl mt-4" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Agent Section */}
                        <section ref={agentRef} className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-navy-900 mb-8 lowercase tracking-tight uppercase">Your Local Guide</h2>
                            <div className="p-10 bg-navy-900 rounded-3xl text-white">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="relative">
                                        <img src={trip.agent?.avatar} className="w-32 h-32 rounded-3xl object-cover ring-4 ring-white/10" />
                                        <div className="absolute -bottom-2 -right-2 bg-amber-400 text-navy-900 p-2 rounded-xl shadow-lg">
                                            <ShieldCheck size={20} />
                                        </div>
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
                                            <h3 className="text-2xl font-bold">{trip.agent?.name}</h3>
                                            <VerifiedBadge size={16} />
                                        </div>
                                        <p className="text-navy-100 leading-relaxed mb-6 max-w-xl font-medium">
                                            "{trip.agent?.bio}"
                                        </p>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
                                            <div><p className="text-[10px] uppercase tracking-widest text-navy-300 font-bold mb-1">Total Trips</p><p className="text-xl font-bold">{trip.agent?.totalTrips}</p></div>
                                            <div><p className="text-[10px] uppercase tracking-widest text-navy-300 font-bold mb-1">Response</p><p className="text-xl font-bold">{trip.agent?.responseRate}</p></div>
                                            <div><p className="text-[10px] uppercase tracking-widest text-navy-300 font-bold mb-1">Rating</p><p className="text-xl font-bold flex items-center gap-1.5"><Star size={18} className="fill-amber-400 text-amber-400" /> {trip.agent?.rating}</p></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Reviews Section */}
                        <section ref={reviewsRef} className="scroll-mt-32">
                            <div className="flex items-end justify-between mb-8">
                                <h2 className="text-2xl font-bold text-navy-900 lowercase tracking-tight uppercase">Traveller Reviews</h2>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xl font-extrabold text-navy-900">{trip.agent?.rating}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{totalReviews} Reviews</p>
                                    </div>
                                    <StarRating rating={trip.agent?.rating} />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {trip.reviews?.map((review, i) => (
                                    <div key={i} className="p-8 bg-gray-50 rounded-3xl border border-transparent hover:border-gray-200 transition-all">
                                        <div className="flex items-center gap-4 mb-6">
                                            <img src={review.avatar} className="w-12 h-12 rounded-full ring-2 ring-white shadow-sm" />
                                            <div>
                                                <p className="font-bold text-navy-900">{review.name}</p>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    {[...Array(5)].map((_, j) => (
                                                        <Star key={j} size={10} className={j < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed italic font-medium">"{review.text}"</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COL: STICKY BOOKING CARD */}
                    <div className="lg:w-[400px]">
                        <div className="sticky top-32 space-y-6">
                            <div className="p-8 bg-white border border-gray-100 rounded-[32px] shadow-2xl shadow-navy-100/20">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Price per person</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-extrabold text-navy-900">${trip.price.toLocaleString()}</span>
                                            <span className="text-gray-400 text-sm font-medium">USD</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm shadow-sm">
                                        -{Math.round(Math.random() * 20 + 10)}%
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-navy-900 shadow-sm"><Users size={14} /></div>
                                            <span className="text-xs font-bold text-gray-600">{trip.spotsLeft} Spots left</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-navy-900 shadow-sm"><Clock size={14} /></div>
                                            <span className="text-xs font-bold text-gray-600">{trip.duration}</span>
                                        </div>
                                    </div>

                                    <div className="p-4 border border-amber-100 bg-amber-50/30 rounded-2xl">
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2 mb-1"><Info size={12} /> Instant Confirmation</p>
                                        <p className="text-[11px] text-gray-500 font-medium">Secure your spot with a request to book flow.</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full py-5 rounded-2xl bg-navy-900 text-white font-bold text-lg shadow-xl shadow-navy-200 hover:scale-[1.02] active:scale-95 transition-all mb-4 flex items-center justify-center gap-3 cursor-pointer border-none"
                                >
                                    Review & Book <ArrowRight size={20} />
                                </button>

                                <p className="text-center text-[11px] text-gray-400 font-medium">Book now, pay later. Full refund available up to 30 days before.</p>
                            </div>

                            <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                                <h4 className="text-sm font-bold text-navy-900 mb-4 flex items-center gap-2 uppercase tracking-tight"><ShieldCheck size={18} className="text-amber-500" /> Roamly Protection</h4>
                                <ul className="space-y-3">
                                    {['Secure Payment Options', 'Verified Local Agents', '24/7 Traveller Support', 'Flexible Cancellations'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs text-gray-600 font-medium">
                                            <Check size={14} className="text-emerald-500" /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    )
}

function CheckIcon({ size, className }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
}

function XIcon({ size, className }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
}
