import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    Send, MapPin, Calendar, Users, Info, ArrowLeft,
    MoreVertical, Check, Paperclip, Smile, Image as ImageIcon,
    Clock, ChevronRight, MessageSquare, ShieldCheck
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getTripById } from '../data/trips'
import { db } from '../firebase'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore'
import VerifiedBadge from '../components/VerifiedBadge'

/* ──────────────────── Mock Chat Data ──────────────────── */
const INITIAL_MESSAGES = [
    { id: 1, sender: { name: 'Trip Leader', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' }, text: "Hi everyone! Welcome to the group. I'm so excited to lead this adventure with you all!", time: '10:30 AM', role: 'AGENT' },
]

export default function TripHubPage() {
    const { id } = useParams()
    const { currentUser, userProfile } = useAuth()
    const navigate = useNavigate()
    const trip = getTripById(id)
    const [messages, setMessages] = useState([])
    const [participants, setParticipants] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [showSidebar, setShowSidebar] = useState(true)
    const chatEndRef = useRef(null)

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (!id) return;

        // Listen for messages
        const msgsQuery = query(
            collection(db, `groups/${id}/messages`),
            orderBy('createdAt', 'asc')
        );
        const unsubscribeMsgs = onSnapshot(msgsQuery, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isMe: doc.data().senderId === currentUser?.uid
            }));
            setMessages(msgs);
        });

        // Listen for participants
        const participantsQuery = query(
            collection(db, 'bookings'),
            where('tripId', '==', parseInt(id)),
            where('status', '==', 'CONFIRMED')
        );
        const unsubscribeParticipants = onSnapshot(participantsQuery, (snapshot) => {
            const parts = snapshot.docs.map(doc => ({
                id: doc.id,
                uid: doc.data().userId,
                name: doc.data().userName,
                avatar: doc.data().userPhoto
            }));
            setParticipants(parts);
        });

        return () => {
            unsubscribeMsgs();
            unsubscribeParticipants();
        }
    }, [id, currentUser]);

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !currentUser) return

        try {
            await addDoc(collection(db, `groups/${id}/messages`), {
                senderId: currentUser.uid,
                senderName: userProfile?.displayName || currentUser.displayName || 'Me',
                senderAvatar: userProfile?.profilePhoto || currentUser.photoURL || '',
                text: newMessage,
                createdAt: serverTimestamp(),
                role: userProfile?.role || 'TRAVELLER'
            });
            setNewMessage('')
        } catch (err) {
            console.error("Error sending message:", err);
        }
    }

    const handleDirectMessage = async (participant) => {
        if (!currentUser) return;

        // Use a consistent ID for the DM chat based on UIDs
        const chatParticipants = [currentUser.uid, participant.uid].sort();
        const chatId = `dm_${chatParticipants[0]}_${chatParticipants[1]}`;

        navigate(`/messages/${chatId}`);
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* ════════ HEADER ════════ */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-white z-20">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-base font-bold text-navy-900 leading-none">{trip.title} Chat</h1>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Trip Support Active
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex -space-x-2 mr-4">
                        {participants.slice(0, 3).map(p => (
                            <div key={p.uid} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200">
                                <img src={p.avatar} className="w-full h-full rounded-full object-cover" />
                            </div>
                        ))}
                        {participants.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-navy-900 text-[10px] text-white flex items-center justify-center font-bold">
                                +{participants.length - 3}
                            </div>
                        )}
                        {participants.length === 0 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-400">
                                <Users size={12} />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className={`p-2 rounded-xl transition ${showSidebar ? 'bg-navy-900 text-white shadow-lg shadow-navy-200' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                        <Info size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </header>

            <main className="flex flex-1 overflow-hidden relative">
                {/* ════════ CHAT AREA ════════ */}
                <div className="flex-1 flex flex-col bg-[#F8F9FA]">
                    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
                        {/* Date Divider */}
                        <div className="flex justify-center">
                            <span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">Today</span>
                        </div>

                        {messages.map((msg, i) => (
                            <div key={msg.id} className={`flex items-start gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                                {!msg.isMe && (
                                    <img src={msg.senderAvatar} className="w-9 h-9 rounded-2xl object-cover bg-gray-200 shadow-sm" />
                                )}
                                <div className={`max-w-[70%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                    {!msg.isMe && (
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className="text-xs font-bold text-navy-900">{msg.senderName}</span>
                                            {msg.role === 'AGENT' && <span className="text-[8px] bg-amber-400 text-navy-900 font-black px-1.5 py-0.5 rounded-sm">LEADER</span>}
                                        </div>
                                    )}
                                    <div className={`p-4 rounded-3xl text-sm leading-relaxed ${msg.isMe
                                        ? 'bg-navy-900 text-white rounded-tr-none shadow-lg shadow-navy-100'
                                        : 'bg-white text-navy-900 rounded-tl-none border border-white shadow-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <div className="mt-1.5 flex items-center gap-2 px-1">
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                        </span>
                                        {msg.isMe && <Check size={12} className="text-emerald-500" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* INPUT AREA */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-3">
                            <button type="button" className="p-2 text-gray-400 hover:text-navy-900 transition flex-shrink-0">
                                <Paperclip size={20} />
                            </button>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="w-full py-3 px-5 pr-12 rounded-2xl bg-gray-50 border border-gray-100 text-sm focus:bg-white focus:outline-none focus:border-navy-200 transition-all"
                                />
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-900 transition">
                                    <Smile size={18} />
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="w-11 h-11 rounded-2xl bg-amber-400 text-navy-900 flex items-center justify-center transition-all hover:bg-amber-500 hover:scale-105 shadow-md shadow-amber-100 disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:cursor-not-allowed"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* ════════ SIDEBAR (Trip Info) ════════ */}
                <aside className={`w-[320px] bg-white border-l border-gray-100 flex flex-col transition-all duration-300 absolute lg:relative inset-y-0 right-0 z-10 shadow-xl lg:shadow-none ${showSidebar ? 'translate-x-0' : 'translate-x-full lg:hidden'}`}>
                    <div className="p-6 overflow-y-auto">
                        <div className="mb-8">
                            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Itinerary Highlights</h2>
                            <div className="space-y-4">
                                {trip.itinerary?.slice(0, 3).map(item => (
                                    <div key={item.day} className="flex gap-4 group">
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-navy-900">D{item.day}</p>
                                            <div className="w-[1px] h-full bg-gray-100 mx-auto mt-2" />
                                        </div>
                                        <div className="pb-4">
                                            <p className="text-sm font-bold text-navy-900 group-hover:text-amber-600 transition truncate w-48">{item.title}</p>
                                            <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                                <Link to={`/trip/${trip.id}`} className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 text-[11px] font-bold text-gray-400 hover:border-navy-900 hover:text-navy-900 transition-all flex items-center justify-center gap-2 no-underline">
                                    Full Itinerary <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Trip Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <MapPin size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Destination</p>
                                        <p className="text-xs font-bold text-navy-900">{trip.destination}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Calendar size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Dates</p>
                                        <p className="text-xs font-bold text-navy-900">{trip.dates}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                        <Users size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Group Size</p>
                                        <p className="text-xs font-bold text-navy-900">{trip.groupSize} Travellers</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <ShieldCheck size={18} className="text-amber-400" />
                                <h3 className="text-sm font-bold">Booking Protection</h3>
                            </div>
                            <p className="text-[11px] text-navy-200 leading-relaxed mb-4">
                                Your trip is fully covered by our Traveller Guarantee. Funds are held securely until the trip ends.
                            </p>
                            <button className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition text-[11px] font-bold">View Policy</button>
                        </div>
                        <div className="mb-8 pt-8 border-t border-gray-100">
                            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Who's Joined ({participants.length})</h2>
                            <div className="space-y-3">
                                {participants.filter(p => p.uid !== currentUser?.uid).map(user => (
                                    <div key={user.uid} className="flex items-center justify-between group/user">
                                        <Link to={`/profile/${user.uid}`} className="flex items-center gap-3 no-underline">
                                            <img src={user.avatar || 'https://i.pravatar.cc/150'} className="w-8 h-8 rounded-full border border-gray-100" />
                                            <span className="text-xs font-bold text-navy-900 group-hover/user:text-amber-600 transition">{user.name}</span>
                                        </Link>
                                        <button
                                            onClick={() => handleDirectMessage(user)}
                                            className="p-1.5 text-gray-400 hover:text-navy-900 hover:bg-gray-50 rounded-lg transition"
                                        >
                                            <MessageSquare size={14} />
                                        </button>
                                    </div>
                                ))}
                                {participants.length <= 1 && (
                                    <p className="text-[10px] text-gray-400 italic">No other participants yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    )
}
