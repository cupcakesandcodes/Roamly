import React, { useState, useEffect, useRef } from 'react';
import {
    Sparkles, Send, Map, Calendar, Clock, Download,
    ChevronRight, Trash2, Plus, Loader2, User, Bot,
    ArrowLeft, Edit3, Save, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateItinerary, updateItinerary } from '../services/AIService';
import { useReactToPrint } from 'react-to-print';
import AgentNavbar from '../components/AgentNavbar';

export default function AIPlanner() {
    const [loading, setLoading] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I'm your Roamly AI. Where would you like to go, and for how many days?" }
    ]);
    const [itinerary, setItinerary] = useState(null);
    const [editingActivity, setEditingActivity] = useState(null);

    const printRef = useRef();
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: itinerary ? `Itinerary-${itinerary.tripName}` : 'Roamly-Itinerary',
    });

    const handleInitialGenerate = async (destination, days) => {
        setLoading(true);
        setMessages(prev => [...prev, { role: 'user', text: `Plan a trip to ${destination} for ${days} days.` }]);

        try {
            const result = await generateItinerary(destination, days, 2, "Moderate", "traveler");
            setItinerary(result);
            setMessages(prev => [...prev, { role: 'assistant', text: "I've created a custom plan for you! You can refine it by chatting with me or by editing activities manually." }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I had trouble generating that plan. Please check your connection or API key." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatInput("");
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

        if (!itinerary) {
            // Basic heuristic for simple generation if no itinerary exists
            const match = userMsg.match(/(?:to\s+)?([a-zA-Z\s]+)\s+(?:for\s+)?(\d+)\s+days/i);
            if (match) {
                handleInitialGenerate(match[1], match[2]);
                return;
            }
            setMessages(prev => [...prev, { role: 'assistant', text: "Please tell me the destination and number of days (e.g., 'Paris for 3 days')." }]);
            return;
        }

        setLoading(true);
        try {
            const updated = await updateItinerary(itinerary, userMsg);
            setItinerary(updated);
            setMessages(prev => [...prev, { role: 'assistant', text: "I've updated the itinerary based on your feedback!" }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "I couldn't process that update. Could you try rephrasing?" }]);
        } finally {
            setLoading(false);
        }
    };

    const updateActivityField = (dayIdx, actIdx, field, value) => {
        const newItinerary = { ...itinerary };
        newItinerary.days[dayIdx].activities[actIdx][field] = value;
        setItinerary(newItinerary);
    };

    return (
        <div className="h-screen bg-surface flex flex-col overflow-hidden">
            <AgentNavbar />

            <div className="flex-1 flex pt-16 overflow-hidden">
                {/* Sidebar - Chat Interface */}
                <aside className="w-96 bg-white border-r border-neutral-200 flex flex-col shadow-xl z-20">
                    <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                        <div className="flex items-center gap-2">
                            <Bot size={20} className="text-amber-500" />
                            <h2 className="text-sm font-black text-navy-900 uppercase tracking-widest leading-none">AI Planner</h2>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/30">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${m.role === 'user'
                                    ? 'bg-amber-400 text-navy-900 rounded-tr-none font-medium'
                                    : 'bg-white text-secondary border border-neutral-100 rounded-tl-none leading-relaxed'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-neutral-100 shadow-sm flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-amber-500" />
                                    <span className="text-xs text-secondary animate-pulse font-medium">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleChatSubmit} className="p-4 border-t border-neutral-100 bg-white">
                        <div className="relative">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Refine plan, add stops..."
                                className="w-full pl-4 pr-12 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all shadow-inner"
                            />
                            <button
                                type="submit"
                                disabled={loading || !chatInput.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-amber-400 text-navy-900 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 shadow-sm"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-secondary mt-3 font-medium uppercase tracking-wider">Powered by Roamly AI</p>
                    </form>
                </aside>

                {/* Main Content - Preview & Export */}
                <main className="flex-1 overflow-y-auto relative flex flex-col">
                    {itinerary && (
                        <div className="p-6 bg-white border-b border-neutral-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="bg-neutral-100 p-2 rounded-lg">
                                    <Calendar size={18} className="text-primary-dark" />
                                </div>
                                <h1 className="text-lg font-bold text-primary-dark tracking-tight">{itinerary.tripName}</h1>
                            </div>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-navy-900/10"
                            >
                                <Download size={16} /> Export to PDF
                            </button>
                        </div>
                    )}

                    {itinerary ? (
                        <div className="p-12">
                            <div ref={printRef} className="max-w-4xl mx-auto space-y-12 print:p-8">
                                <div className="text-center space-y-4">
                                    <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                                        <Bot size={14} /> AI-Generated Trip
                                    </div>
                                    <h2 className="text-5xl font-black text-navy-900 font-heading tracking-tight leading-tight">{itinerary.tripName}</h2>
                                    <div className="flex items-center justify-center gap-6 text-sm font-bold text-secondary uppercase tracking-widest">
                                        <div className="flex items-center gap-2 border-r border-neutral-200 pr-6"><Map size={16} /> Destination</div>
                                        <div className="flex items-center gap-2 pr-6 border-r border-neutral-200 "><Calendar size={16} /> {itinerary.days.length} Days</div>
                                        <div className="flex items-center gap-2"><User size={16} /> Group Plan</div>
                                    </div>
                                </div>

                                {itinerary.days.map((day, dIdx) => (
                                    <div key={dIdx} className="space-y-6 relative border-l-2 border-amber-200 ml-4 print:ml-0">
                                        <div className="flex items-center gap-4 -ml-[13px] relative z-10">
                                            <div className="w-6 h-6 rounded-full bg-amber-400 outline outline-8 outline-neutral-50 flex items-center justify-center shadow-md">
                                                <span className="text-[10px] font-black text-navy-900">{day.dayNumber}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-navy-900 font-heading uppercase tracking-tighter">{day.title}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pl-8">
                                            {day.activities.map((activity, aIdx) => (
                                                <div
                                                    key={aIdx}
                                                    className="group bg-white border border-neutral-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden flex flex-col justify-between h-full"
                                                >
                                                    <div className="mb-4">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">
                                                                <Clock size={12} /> {activity.time}
                                                            </div>
                                                            <button
                                                                onClick={() => setEditingActivity({ dIdx, aIdx })}
                                                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-neutral-50 rounded-full transition-all text-secondary"
                                                            >
                                                                <Edit3 size={14} />
                                                            </button>
                                                        </div>

                                                        <h4 className="font-black text-navy-900 leading-tight mb-2 group-hover:text-amber-500 transition-colors">{activity.name}</h4>
                                                        <p className="text-xs text-secondary leading-relaxed line-clamp-3">{activity.notes}</p>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-neutral-50 flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-secondary uppercase tracking-tight">
                                                            <Map size={12} className="text-neutral-400" /> {activity.location}
                                                        </div>
                                                        <span className="text-[10px] font-black text-neutral-300">{activity.duration}</span>
                                                    </div>

                                                    {/* Inline Edit Modal/Overlay */}
                                                    {editingActivity?.dIdx === dIdx && editingActivity?.aIdx === aIdx && (
                                                        <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-20 p-6 flex flex-col justify-between">
                                                            <div className="space-y-3">
                                                                <input
                                                                    className="w-full text-sm font-bold border-b border-amber-200 focus:outline-none bg-transparent py-1"
                                                                    value={activity.name}
                                                                    onChange={(e) => updateActivityField(dIdx, aIdx, 'name', e.target.value)}
                                                                />
                                                                <input
                                                                    className="w-full text-[10px] border-b border-amber-100 focus:outline-none bg-transparent py-1"
                                                                    value={activity.location}
                                                                    onChange={(e) => updateActivityField(dIdx, aIdx, 'location', e.target.value)}
                                                                />
                                                                <textarea
                                                                    className="w-full text-[10px] border border-neutral-100 p-2 rounded-lg bg-white mt-2 h-20 focus:outline-none focus:ring-1 focus:ring-amber-200"
                                                                    value={activity.notes}
                                                                    onChange={(e) => updateActivityField(dIdx, aIdx, 'notes', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => setEditingActivity(null)} className="flex-1 bg-navy-900 text-white text-[10px] font-bold py-2 rounded-xl flex items-center justify-center gap-1 shadow-md">
                                                                    <Save size={12} /> Done
                                                                </button>
                                                                <button onClick={() => setEditingActivity(null)} className="p-2 border border-neutral-100 rounded-xl hover:bg-neutral-50 text-secondary">
                                                                    <X size={12} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const newItinerary = { ...itinerary };
                                                    newItinerary.days[dIdx].activities.push({
                                                        name: "New Activity",
                                                        time: "12:00",
                                                        duration: "1 hour",
                                                        location: "Add Location",
                                                        notes: "Add some notes here..."
                                                    });
                                                    setItinerary(newItinerary);
                                                }}
                                                className="border-2 border-dashed border-neutral-200 rounded-[2rem] p-6 flex flex-col items-center justify-center text-secondary hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50 transition-all group"
                                            >
                                                <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Add Stop</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <footer className="text-center pt-16 border-t font-medium border-neutral-100">
                                    <p className="text-xs text-secondary/40 uppercase tracking-[0.3em]">Generated with the Roamly Pro AI Intelligence Engine</p>
                                </footer>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white">
                            <div className="w-24 h-24 bg-amber-50 rounded-3xl flex items-center justify-center mb-8 animate-bounce transition-all">
                                <Sparkles size={48} className="text-amber-400" />
                            </div>
                            <h2 className="text-4xl font-black text-navy-900 mb-4 font-heading tracking-tight leading-tight">Start Your Adventure</h2>
                            <p className="text-secondary mb-8 max-w-md leading-relaxed font-medium">Use the chat on the left to tell our AI your destination. "Paris for 3 days" or "A surf trip in Bali".</p>
                            <div className="flex gap-4">
                                <button onClick={() => handleInitialGenerate("Tokyo, Japan", 5)} className="px-6 py-3 bg-neutral-100 text-primary-dark rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors shadow-sm">
                                    Try "Tokyo"
                                </button>
                                <button onClick={() => handleInitialGenerate("Swiss Alps", 4)} className="px-6 py-3 bg-neutral-100 text-primary-dark rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors shadow-sm">
                                    Try "Swiss Alps"
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
