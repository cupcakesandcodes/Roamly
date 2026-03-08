import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    Send, Info, ArrowLeft, MoreVertical, Check,
    Paperclip, Smile, Search, MessageSquare, ShieldCheck, User
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import {
    collection, query, onSnapshot, addDoc, serverTimestamp,
    orderBy, doc, getDoc, setDoc
} from 'firebase/firestore'

export default function DirectMessagePage() {
    const { chatId } = useParams()
    const { currentUser, userProfile } = useAuth()
    const navigate = useNavigate()
    const [messages, setMessages] = useState([])
    const [otherUser, setOtherUser] = useState(null)
    const [newMessage, setNewMessage] = useState('')
    const chatEndRef = useRef(null)

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (!chatId || !currentUser) return;

        // Extract other user's UID from chatId
        const uids = chatId.replace('dm_', '').split('_');
        const otherUid = uids.find(uid => uid !== currentUser.uid);

        if (otherUid) {
            // Fetch other user's profile
            const fetchOtherUser = async () => {
                const userDoc = await getDoc(doc(db, 'users', otherUid));
                if (userDoc.exists()) {
                    setOtherUser({ uid: otherUid, ...userDoc.data() });

                    // Ensure chat metadata exists for listing on dashboard
                    await setDoc(doc(db, 'chats', chatId), {
                        participants: [currentUser.uid, otherUid],
                        lastUpdatedAt: serverTimestamp(),
                        type: 'direct'
                    }, { merge: true });
                }
            };
            fetchOtherUser();
        }

        // Listen for messages
        const msgsQuery = query(
            collection(db, `chats/${chatId}/messages`),
            orderBy('createdAt', 'asc')
        );
        const unsubscribeMsgs = onSnapshot(msgsQuery, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isMe: doc.data().senderId === currentUser.uid
            }));
            setMessages(msgs);
        });

        return () => unsubscribeMsgs();
    }, [chatId, currentUser]);

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !currentUser) return

        try {
            await addDoc(collection(db, `chats/${chatId}/messages`), {
                senderId: currentUser.uid,
                senderName: userProfile?.displayName || currentUser.displayName || 'Me',
                senderAvatar: userProfile?.profilePhoto || currentUser.photoURL || '',
                text: newMessage,
                createdAt: serverTimestamp()
            });

            // Update last message in chat metadata
            await setDoc(doc(db, 'chats', chatId), {
                lastMessage: newMessage,
                lastUpdatedAt: serverTimestamp()
            }, { merge: true });

            setNewMessage('')
        } catch (err) {
            console.error("Error sending message:", err);
        }
    }

    if (!otherUser) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-navy-900/10 border-t-navy-900 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Opening conversation...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* ════════ HEADER ════════ */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-white z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400">
                        <ArrowLeft size={20} />
                    </button>
                    <Link to={`/profile/${otherUser.uid}`} className="flex items-center gap-3 no-underline group">
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                            <img src={otherUser.profilePhoto || otherUser.photoURL || 'https://i.pravatar.cc/150'} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-navy-900 leading-none group-hover:text-amber-600 transition">{otherUser.displayName || 'User'}</h1>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Always Active
                            </p>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition">
                        <Search size={20} />
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
                        {/* Start of convo info */}
                        <div className="flex flex-col items-center py-10 text-center max-w-sm mx-auto">
                            <div className="w-20 h-20 rounded-full bg-navy-50 flex items-center justify-center mb-4">
                                <MessageSquare size={32} className="text-navy-900" />
                            </div>
                            <h3 className="text-lg font-bold text-navy-900">Your conversation with {otherUser.displayName}</h3>
                            <p className="text-xs text-secondary mt-2 leading-relaxed">
                                Conversations on Roamly are protected with trip coordination security.
                                Only you and {otherUser.displayName} can see these messages.
                            </p>
                        </div>

                        {messages.map((msg, i) => (
                            <div key={msg.id} className={`flex items-start gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                                {!msg.isMe && (
                                    <img src={msg.senderAvatar || 'https://i.pravatar.cc/150'} className="w-9 h-9 rounded-2xl object-cover bg-gray-200 shadow-sm" />
                                )}
                                <div className={`max-w-[70%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
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
                                    placeholder="Type your message..."
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

                {/* Info Sidebar (Simple version) */}
                <aside className="hidden lg:flex w-[320px] bg-white border-l border-gray-100 flex-col p-6 overflow-y-auto">
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 rounded-3xl mx-auto mb-4 bg-gray-100 overflow-hidden shadow-lg border-4 border-white">
                            <img src={otherUser.profilePhoto || otherUser.photoURL || 'https://i.pravatar.cc/150'} className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-lg font-bold text-navy-900">{otherUser.displayName}</h2>
                        <p className="text-xs text-gray-400 mt-1">{otherUser.role || 'Traveller'}</p>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">About {otherUser.displayName}</h3>
                            <p className="text-xs text-navy-900 leading-relaxed italic">
                                "{otherUser.bio || 'Traveling the world, one story at a time.'}"
                            </p>
                        </div>

                        <Link
                            to={`/profile/${otherUser.uid}`}
                            className="w-full py-3 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition flex items-center justify-center gap-2 no-underline"
                        >
                            <ShieldCheck size={14} className="text-amber-400" /> View Full Profile
                        </Link>
                    </div>
                </aside>
            </main>
        </div>
    )
}
