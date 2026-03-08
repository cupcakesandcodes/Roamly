import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Compass, MessageSquare, Bookmark, User, Search, Plus, CheckCircle, AlertCircle, Clock, MapPin, ChevronRight, LogOut, Check, ShieldCheck, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { TRIPS } from '../data/trips'
import { db } from '../firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

/* ──────────────────── Mock Data ──────────────────── */
const ACTIVITIES = [
    {
        id: 1,
        type: 'CONFIRMATION',
        icon: <CheckCircle size={14} className="text-emerald-500" />,
        bg: 'bg-emerald-50',
        title: 'Flight confirmed',
        desc: 'for Santorini. Your tickets are now ready.',
        time: '2 HOURS AGO',
        highlight: true
    },
    {
        id: 2,
        type: 'PRICE_ALERT',
        icon: <div className="w-3.5 h-3.5 flex items-center justify-center font-bold text-[10px] text-amber-500">¥</div>,
        bg: 'bg-amber-50',
        title: 'Price Alert:',
        desc: 'Hotel prices in Tokyo dropped by 15%.',
        time: '5 HOURS AGO'
    },
    {
        id: 3,
        type: 'MESSAGE',
        icon: <MessageSquare size={14} className="text-gray-500" />,
        bg: 'bg-gray-100',
        title: 'Maria',
        desc: 'sent you a message about the itinerary.',
        time: 'YESTERDAY'
    }
]

export default function TravellerDashboard() {
    const { currentUser, userProfile, logout } = useAuth()
    const navigate = useNavigate()
    const [view, setView] = useState('My Trips')
    const [activeTab, setActiveTab] = useState('Upcoming')
    const [searchQuery, setSearchQuery] = useState('')
    const [userBookings, setUserBookings] = useState([])
    const [directChats, setDirectChats] = useState([])
    const [loading, setLoading] = useState(true)

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Logout failed', error)
        }
    }

    useEffect(() => {
        if (!currentUser) return;

        const q = query(collection(db, 'bookings'), where('userId', '==', currentUser.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserBookings(bookings);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) return;

        const q = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // For each direct chat, we need to fetch the other participant's profile
            const enrichedChats = await Promise.all(chats.map(async (chat) => {
                const otherUid = chat.participants.find(uid => uid !== currentUser.uid);
                const userDoc = await getDoc(doc(db, 'users', otherUid));
                return {
                    ...chat,
                    otherUser: userDoc.exists() ? { uid: otherUid, ...userDoc.data() } : { uid: otherUid, displayName: 'User' }
                };
            }));

            setDirectChats(enrichedChats);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const activeTrips = userBookings.map(booking => {
        const tripDetails = TRIPS.find(t => t.id === booking.tripId);
        return tripDetails ? { ...tripDetails, ...booking, id: booking.id, tripId: tripDetails.id } : null;
    }).filter(Boolean);

    const filteredTrips = activeTrips.filter(trip => {
        const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trip.destination.toLowerCase().includes(searchQuery.toLowerCase())

        if (activeTab === 'Upcoming') return matchesSearch && trip.status === 'CONFIRMED'
        if (activeTab === 'Pending') return matchesSearch && trip.status === 'PENDING'
        if (activeTab === 'Past') return matchesSearch && trip.status === 'PAST'
        return matchesSearch
    })

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex text-[var(--font-heading)]">
            {/* ════════ SIDEBAR ════════ */}
            <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-10">
                {/* Logo */}
                <div className="h-20 flex items-center px-8 border-b border-white">
                    <Link to="/" className="flex items-center gap-2 no-underline">
                        <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center">
                            <Compass size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-bold text-navy-900">Roamly</span>
                    </Link>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <button
                        onClick={() => setView('My Trips')}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition cursor-pointer border-none font-medium ${view === 'My Trips' ? 'bg-navy-900 text-white' : 'bg-transparent text-gray-500 hover:text-navy-900 hover:bg-gray-50'}`}
                    >
                        <div className="w-6 flex justify-center"><Compass size={20} /></div>
                        My Trips
                    </button>
                    <button
                        onClick={() => setView('Messages')}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition cursor-pointer border-none font-medium ${view === 'Messages' ? 'bg-navy-900 text-white' : 'bg-transparent text-gray-500 hover:text-navy-900 hover:bg-gray-50'}`}
                    >
                        <div className="w-6 flex justify-center"><MessageSquare size={20} /></div>
                        Messages
                    </button>
                    <Link to="#" className="flex items-center gap-4 px-4 py-3 rounded-2xl text-gray-500 hover:text-navy-900 hover:bg-gray-50 font-medium transition cursor-pointer no-underline">
                        <div className="w-6 flex justify-center"><Bookmark size={20} /></div>
                        Saved
                    </Link>
                    <Link to={`/profile/${currentUser?.uid}`} className="flex items-center gap-4 px-4 py-3 rounded-2xl text-gray-500 hover:text-navy-900 hover:bg-gray-50 font-medium transition cursor-pointer no-underline">
                        <div className="w-6 flex justify-center"><User size={20} /></div>
                        Profile
                    </Link>
                </nav>

                {/* Bottom User Area */}
                <div className="p-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0 bg-gray-100">
                            {(userProfile?.profilePhoto || currentUser?.photoURL) ? (
                                <img src={userProfile?.profilePhoto || currentUser?.photoURL} alt="User" className="w-full h-full object-cover" />
                            ) : <User className="w-full h-full p-2 text-gray-400" />}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-navy-900 truncate">{userProfile?.displayName || currentUser?.displayName || 'User'}</p>
                            <p className="text-[11px] text-gray-400 font-medium truncate">{userProfile?.role || 'Traveller'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 mt-2 text-sm font-medium text-gray-500 hover:text-red-500 transition cursor-pointer bg-transparent border-none"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* ════════ MAIN CONTENT ════════ */}
            <main className="flex-1 ml-[260px] flex">
                {/* Center Column */}
                <div className="flex-1 px-10 py-10 max-w-4xl border-r border-gray-200">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-navy-900 mb-1">{view}</h1>
                            <p className="text-gray-500 text-sm">
                                {view === 'My Trips' ? 'Manage your upcoming and past travel adventures.' : 'Connect with your group and fellow travellers.'}
                            </p>
                        </div>
                        {view === 'My Trips' && (
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search trips..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-11 pr-4 py-2.5 w-64 rounded-full border border-gray-100 bg-white text-sm focus:outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-400 transition"
                                    />
                                </div>
                                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy-900 hover:bg-navy-800 text-white font-medium text-sm transition cursor-pointer shadow-sm">
                                    <Plus size={16} /> New Trip
                                </button>
                            </div>
                        )}
                    </div>

                    {view === 'My Trips' ? (
                        <>
                            {/* Tabs */}
                            <div className="flex gap-8 border-b border-gray-200 mb-8">
                                {['Upcoming', 'Pending', 'Past'].map(tab => {
                                    const isActive = activeTab === tab
                                    const count = activeTrips.filter(t => t.status === (tab === 'Upcoming' ? 'CONFIRMED' : tab.toUpperCase())).length
                                    return (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`pb-3 text-sm font-bold transition-all relative cursor-pointer border-none bg-transparent ${isActive ? 'text-navy-900' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {tab} ({count})
                                            {isActive && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy-900" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Trip Cards */}
                            <div className="space-y-6">
                                {filteredTrips.length === 0 ? (
                                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                                        <Compass size={40} className="mx-auto text-gray-200 mb-4" />
                                        <p className="text-gray-400 font-medium">No {activeTab.toLowerCase()} trips found.</p>
                                        <Link to="/discover" className="text-navy-900 font-bold text-sm mt-2 inline-block hover:underline">Browse new adventures</Link>
                                    </div>
                                ) : filteredTrips.map(trip => (
                                    <div key={trip.id} className="group bg-white rounded-2xl border border-gray-100 p-3 flex gap-6 hover:shadow-md transition duration-300">
                                        <div className="w-64 h-40 flex-shrink-0 relative rounded-xl overflow-hidden">
                                            <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                        </div>
                                        <div className="flex-1 py-2 pr-4 flex flex-col">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md w-fit ${trip.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {trip.status === 'CONFIRMED' ? 'UPCOMING' : trip.status}
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-navy-900 mb-2">{trip.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-auto">
                                                <div className="flex items-center gap-1.5"><Clock size={14} /> {trip.dates}</div>
                                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                <div className="flex items-center gap-1.5"><MapPin size={14} /> {trip.destination}</div>
                                            </div>
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center">
                                                    {[1, 2, 3].map((i) => (
                                                        <img key={i} src={`https://i.pravatar.cc/150?u=${trip.id}${i}`} className="w-8 h-8 rounded-full border-2 border-white object-cover -mr-2 relative z-10" />
                                                    ))}
                                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-navy-900 text-white text-[10px] font-bold flex items-center justify-center relative z-0 pl-1">
                                                        +{Math.floor(Math.random() * 5 + 3)}
                                                    </div>
                                                </div>
                                                <Link
                                                    to={trip.status === 'CONFIRMED' ? `/trip-hub/${trip.tripId}` : `/trip/${trip.tripId}`}
                                                    className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition shadow-sm no-underline"
                                                >
                                                    {trip.status === 'CONFIRMED' ? 'View Chat' : 'View Request'} <ArrowRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-navy-900 mb-6 font-[var(--font-heading)]">Messages & Groups</h2>

                            {(activeTrips.length === 0 && directChats.length === 0) ? (
                                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                                    <MessageSquare size={40} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-gray-400 font-medium">No messages yet. Join a trip to start chatting!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Group Chats */}
                                    {activeTrips.map(trip => (
                                        <Link
                                            key={`group_${trip.id}`}
                                            to={`/trip-hub/${trip.tripId}`}
                                            className="block p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition no-underline group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center text-navy-900 font-bold group-hover:bg-amber-100 group-hover:text-amber-600 transition">
                                                    {trip.title.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="text-sm font-bold text-navy-900">{trip.title} Group</h4>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Group</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate max-w-[400px]">Coordination for your {trip.destination} adventure.</p>
                                                </div>
                                                <ArrowRight size={16} className="text-gray-300 group-hover:text-navy-900 transition" />
                                            </div>
                                        </Link>
                                    ))}

                                    {/* Direct Messages */}
                                    {directChats.map(chat => (
                                        <Link
                                            key={`dm_${chat.id}`}
                                            to={`/messages/${chat.id}`}
                                            className="block p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition no-underline group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-amber-50 overflow-hidden relative group-hover:scale-105 transition-transform">
                                                    <img src={chat.otherUser.profilePhoto || 'https://i.pravatar.cc/150'} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="text-sm font-bold text-navy-900">{chat.otherUser.displayName}</h4>
                                                        <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Direct</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate max-w-[400px]">{chat.lastMessage || `Start a conversation with ${chat.otherUser.displayName}`}</p>
                                                </div>
                                                <ArrowRight size={16} className="text-gray-300 group-hover:text-navy-900 transition" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Column */}
                <aside className="w-[340px] flex-shrink-0 bg-white p-8 overflow-y-auto">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <ShieldCheck size={20} className="text-navy-900" />
                            <h3 className="text-sm font-bold text-navy-900 mr-auto ml-3">Profile Completion</h3>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                            <div className="bg-navy-900 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <p className="text-xs text-gray-400 italic mt-3">Complete your profile to unlock rewards.</p>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-base font-bold text-navy-900 mb-6">Recent Activity</h3>
                        <div className="space-y-6">
                            {ACTIVITIES.map(activity => (
                                <div key={activity.id} className="flex gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${activity.bg}`}>
                                        {activity.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm text-navy-900 leading-snug"><span className="font-bold">{activity.title}</span> {activity.desc}</p>
                                        <p className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-wider">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    )
}
