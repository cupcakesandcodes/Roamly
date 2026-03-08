import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Info, Calendar, DollarSign, Map, FileText,
    Plus, Pen, Trash, GripVertical, Clock, Eye, Users, Search,
    Sparkles, Loader2, ChevronDown, ChevronUp, MessageSquare, Send,
    Plane, TrainFront, Download, Edit3, Save, X, Bot, Briefcase,
    Settings2, Layers, CheckCircle
} from 'lucide-react';
import AgentNavbar from '../components/AgentNavbar';
import { generateItinerary, updateItinerary } from '../services/AIService';
import { useReactToPrint } from 'react-to-print';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function TripBuilder() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Sidebar navigation
    const [activeSection, setActiveSection] = useState('itinerary');

    // Itinerary mode: 'choose' | 'manual' | 'ai'
    const [itineraryMode, setItineraryMode] = useState('choose');

    // AI states
    const [loading, setLoading] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello Agent! Configure your trip details and I'll design a premium package for your clients." }
    ]);
    const [editingActivity, setEditingActivity] = useState(null);

    // Shared itinerary
    const [itinerary, setItinerary] = useState(null);

    // Trip metadata (shared between sections)
    const [metadata, setMetadata] = useState({
        destination: "Amalfi Coast, Italy",
        numDays: 5,
        numTravelers: 8,
        budget: "Luxury",
        flightCost: "",
        trainCost: "",
        hotelCost: "",
    });

    const printRef = useRef();
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: itinerary ? `AgentPackage-${itinerary.tripName}` : 'Roamly-Agent-Package',
    });

    // --- Publishing logic ---
    const handlePublish = async () => {
        if (!itinerary || !currentUser) return;
        setPublishing(true);
        try {
            // Clean up the budget cost string to get a rough number
            const avgCostString = metadata.flightCost || metadata.hotelCost || "1500";
            const avgCostNum = parseInt(avgCostString.replace(/\D/g, '')) || 1500;

            const newTripData = {
                title: itinerary.tripName || `${metadata.destination} Package`,
                destination: metadata.destination,
                agentId: currentUser.uid,
                agentName: currentUser.displayName || 'Roamly Agent',
                duration: `${metadata.numDays} Days`,
                numDays: metadata.numDays,
                totalSpots: metadata.numTravelers || 10,
                spotsFilled: 0,
                price: avgCostNum,
                priceLabel: "per person",
                description: `A curated ${metadata.budget} experience in ${metadata.destination}.`,
                tags: [metadata.budget, 'Guided', 'Curated'],
                image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80", // Default image, ideally we fetch one based on destination
                features: ["Expert Guide", "Curated Itinerary", "Accommodation"],
                itinerary: itinerary.days, // Include full AI itinerary days
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'trips'), newTripData);
            setMessages(prev => [...prev, { role: 'assistant', text: `Success! Trip published. Navigating to Dashboard...` }]);

            setTimeout(() => {
                navigate('/dashboard'); // or /agent/dashboard if that's the intended route
            }, 1500);

        } catch (error) {
            console.error("Error publishing trip:", error);
            setMessages(prev => [...prev, { role: 'assistant', text: `Error publishing trip: ${error.message}` }]);
        } finally {
            setPublishing(false);
        }
    };

    // --- AI Handlers ---
    const handleAIGenerate = async () => {
        if (!metadata.destination.trim()) return;
        setLoading(true);

        const configSummary = `Design a ${metadata.numDays}-day group package to ${metadata.destination} for ${metadata.numTravelers} travelers. Budget: ${metadata.budget}.${metadata.flightCost ? ` Flights: ${metadata.flightCost}/pp.` : ''}${metadata.trainCost ? ` Trains: ${metadata.trainCost}/pp.` : ''}${metadata.hotelCost ? ` Hotels: ${metadata.hotelCost}/night.` : ''}`;
        setMessages(prev => [...prev, { role: 'user', text: configSummary }]);

        try {
            const result = await generateItinerary(metadata.destination, metadata.numDays, metadata.numTravelers, metadata.budget, "agent");
            setItinerary(result);
            setMessages(prev => [...prev, { role: 'assistant', text: `Package "${result.tripName}" is ready! Refine it via chat or edit activities directly.` }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Generation failed. Please check your API key." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !itinerary) return;
        const userMsg = chatInput;
        setChatInput("");
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);
        try {
            const updated = await updateItinerary(itinerary, userMsg);
            setItinerary(updated);
            setMessages(prev => [...prev, { role: 'assistant', text: "Package updated!" }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', text: "Couldn't process that. Try rephrasing." }]);
        } finally {
            setLoading(false);
        }
    };

    // --- Manual Handlers ---
    const addDay = () => {
        const days = itinerary?.days || [];
        const nextDay = days.length + 1;
        setItinerary({
            tripName: itinerary?.tripName || `${metadata.destination} Trip`,
            days: [...days, { id: Date.now(), dayNumber: nextDay, title: `Day ${nextDay}`, activities: [] }]
        });
    };

    const addActivity = (dayIdx) => {
        const newIt = { ...itinerary, days: [...itinerary.days] };
        newIt.days[dayIdx] = { ...newIt.days[dayIdx], activities: [...newIt.days[dayIdx].activities, { id: Date.now(), name: "New Activity", time: "10:00", duration: "1 hour", location: "", notes: "" }] };
        setItinerary(newIt);
    };

    const deleteDay = (dayIdx) => {
        const newIt = { ...itinerary, days: itinerary.days.filter((_, i) => i !== dayIdx) };
        setItinerary(newIt);
    };

    const deleteActivity = (dayIdx, actIdx) => {
        const newIt = { ...itinerary, days: [...itinerary.days] };
        newIt.days[dayIdx] = { ...newIt.days[dayIdx], activities: newIt.days[dayIdx].activities.filter((_, i) => i !== actIdx) };
        setItinerary(newIt);
    };

    const updateActivityField = (dayIdx, actIdx, field, value) => {
        const newIt = { ...itinerary, days: [...itinerary.days] };
        newIt.days[dayIdx] = { ...newIt.days[dayIdx], activities: [...newIt.days[dayIdx].activities] };
        newIt.days[dayIdx].activities[actIdx] = { ...newIt.days[dayIdx].activities[actIdx], [field]: value };
        setItinerary(newIt);
    };

    const budgetOptions = ["Budget", "Moderate", "Premium", "Luxury", "Ultra-Luxury"];

    const navItems = [
        { id: 'info', icon: <Info size={18} />, label: "Basic Info" },
        { id: 'dates', icon: <Calendar size={18} />, label: "Dates & Group" },
        { id: 'pricing', icon: <DollarSign size={18} />, label: "Pricing" },
        { id: 'itinerary', icon: <Map size={18} />, label: "Itinerary" },
        { id: 'policies', icon: <FileText size={18} />, label: "Policies" },
    ];

    return (
        <div className="min-h-screen bg-surface flex flex-col">
            <AgentNavbar />

            <div className="flex-1 flex pt-16 h-screen overflow-hidden">
                {/* Left Sidebar — Agent Workflow Nav */}
                <aside className="w-64 bg-white border-r border-neutral-100 flex flex-col justify-between overflow-y-auto flex-shrink-0">
                    <div className="p-6">
                        <h2 className="text-lg font-bold font-heading text-primary-dark">Trip Builder</h2>
                        <p className="text-sm text-secondary truncate">{itinerary?.tripName || metadata.destination}</p>

                        <nav className="mt-8 space-y-2">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => { setActiveSection(item.id); if (item.id === 'itinerary' && itineraryMode !== 'choose' && !itinerary) setItineraryMode('choose'); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                                        ${activeSection === item.id
                                            ? 'bg-neutral-100/80 text-primary-dark border-l-4 border-primary-dark shadow-sm'
                                            : 'text-secondary hover:bg-neutral-50 hover:text-primary-dark border-l-4 border-transparent'
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6 bg-neutral-50/50">
                        <div className="flex justify-between text-xs font-medium text-secondary mb-2">
                            <span>COMPLETION</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-1.5 mb-2">
                            <div className="bg-primary-dark h-1.5 rounded-full" style={{ width: itinerary ? '85%' : '40%' }}></div>
                        </div>
                        <p className="text-xs text-secondary">{itinerary ? '85% — Looking great!' : '40% — Add itinerary'}</p>
                    </div>
                </aside>

                {/* Center Content */}
                <main className="flex-1 bg-surface-muted overflow-y-auto relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                            <Loader2 size={48} className="text-primary-dark animate-spin mb-4" />
                            <p className="text-lg font-bold text-primary-dark font-heading">Roamly AI is crafting your package...</p>
                        </div>
                    )}

                    {/* ===== BASIC INFO ===== */}
                    {activeSection === 'info' && (
                        <div className="max-w-2xl mx-auto p-8 space-y-6">
                            <h1 className="text-3xl font-bold font-heading text-primary-dark">Basic Info</h1>
                            <p className="text-secondary">Set the destination and core details for this package.</p>
                            <div>
                                <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block">Destination</label>
                                <div className="relative">
                                    <Map size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                                    <input type="text" value={metadata.destination} onChange={(e) => setMetadata({ ...metadata, destination: e.target.value })} placeholder="e.g., Bali, Indonesia" className="w-full pl-9 pr-3 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block">Package Name (optional)</label>
                                <input type="text" value={itinerary?.tripName || ""} onChange={(e) => setItinerary(it => it ? { ...it, tripName: e.target.value } : null)} placeholder="Auto-generated by AI" className="w-full px-3 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400" />
                            </div>
                        </div>
                    )}

                    {/* ===== DATES & GROUP ===== */}
                    {activeSection === 'dates' && (
                        <div className="max-w-2xl mx-auto p-8 space-y-6">
                            <h1 className="text-3xl font-bold font-heading text-primary-dark">Dates & Group</h1>
                            <p className="text-secondary">Define the trip duration and group size.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block">Number of Days</label>
                                    <div className="relative">
                                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                                        <input type="number" min="1" max="30" value={metadata.numDays} onChange={(e) => setMetadata({ ...metadata, numDays: parseInt(e.target.value) || 1 })} className="w-full pl-9 pr-3 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block">Total People</label>
                                    <div className="relative">
                                        <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                                        <input type="number" min="1" max="200" value={metadata.numTravelers} onChange={(e) => setMetadata({ ...metadata, numTravelers: parseInt(e.target.value) || 1 })} className="w-full pl-9 pr-3 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== PRICING ===== */}
                    {activeSection === 'pricing' && (
                        <div className="max-w-2xl mx-auto p-8 space-y-6">
                            <h1 className="text-3xl font-bold font-heading text-primary-dark">Pricing</h1>
                            <p className="text-secondary">Set the budget tier and transport cost estimates.</p>
                            <div>
                                <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block">Budget Tier</label>
                                <div className="relative">
                                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                                    <select value={metadata.budget} onChange={(e) => setMetadata({ ...metadata, budget: e.target.value })} className="w-full pl-9 pr-8 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 appearance-none">
                                        {budgetOptions.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-100">
                                <div>
                                    <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1"><Plane size={12} /> Flight Cost/pp</label>
                                    <input type="text" value={metadata.flightCost} onChange={(e) => setMetadata({ ...metadata, flightCost: e.target.value })} placeholder="e.g., $500" className="w-full px-3 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1"><TrainFront size={12} /> Train Cost/pp</label>
                                    <input type="text" value={metadata.trainCost} onChange={(e) => setMetadata({ ...metadata, trainCost: e.target.value })} placeholder="e.g., $80" className="w-full px-3 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1"><DollarSign size={12} /> Hotel/night</label>
                                    <input type="text" value={metadata.hotelCost} onChange={(e) => setMetadata({ ...metadata, hotelCost: e.target.value })} placeholder="e.g., $150" className="w-full px-3 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== ITINERARY — MODE CHOOSER ===== */}
                    {activeSection === 'itinerary' && itineraryMode === 'choose' && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 min-h-[70vh]">
                            <h1 className="text-3xl font-black text-navy-900 mb-3 font-heading tracking-tight">Build Your Itinerary</h1>
                            <p className="text-secondary mb-10 max-w-md leading-relaxed">Choose how you want to create the daily plan for this package.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
                                {/* Manual Option */}
                                <button
                                    onClick={() => { setItineraryMode('manual'); if (!itinerary) addDay(); }}
                                    className="group bg-white border-2 border-neutral-200 hover:border-primary-dark rounded-2xl p-8 text-left transition-all hover:shadow-xl hover:-translate-y-1"
                                >
                                    <div className="w-14 h-14 bg-neutral-100 group-hover:bg-primary-dark/10 rounded-2xl flex items-center justify-center mb-5 transition-colors">
                                        <Pen size={28} className="text-primary-dark" />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary-dark mb-2 font-heading">Manual Builder</h3>
                                    <p className="text-sm text-secondary leading-relaxed">Add days and activities manually with full control over every detail.</p>
                                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary-dark uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Layers size={14} /> Start Building →
                                    </div>
                                </button>

                                {/* AI Option */}
                                <button
                                    onClick={() => setItineraryMode('ai')}
                                    className="group bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 hover:border-sky-500 rounded-2xl p-8 text-left transition-all hover:shadow-xl hover:-translate-y-1"
                                >
                                    <div className="w-14 h-14 bg-sky-100 group-hover:bg-sky-500/20 rounded-2xl flex items-center justify-center mb-5 transition-colors">
                                        <Sparkles size={28} className="text-sky-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-sky-700 mb-2 font-heading">AI Itinerary Builder</h3>
                                    <p className="text-sm text-secondary leading-relaxed">Let AI design the itinerary based on your trip config, with chat refinements.</p>
                                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Sparkles size={14} /> Generate with AI →
                                    </div>
                                </button>
                            </div>

                            {/* Show if itinerary already exists */}
                            {itinerary && (
                                <p className="mt-8 text-sm text-secondary">
                                    You already have an itinerary: <strong className="text-primary-dark">{itinerary.tripName}</strong>.
                                    Choosing a mode will let you continue editing it.
                                </p>
                            )}
                        </div>
                    )}

                    {/* ===== ITINERARY — MANUAL MODE ===== */}
                    {activeSection === 'itinerary' && itineraryMode === 'manual' && (
                        <div className="p-8">
                            <div className="max-w-3xl mx-auto space-y-8 pb-16">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <button onClick={() => setItineraryMode('choose')} className="text-xs font-bold text-secondary hover:text-primary-dark uppercase tracking-widest flex items-center gap-1">← Back</button>
                                            <span className="text-xs bg-neutral-100 text-primary-dark px-2 py-0.5 rounded-full font-bold uppercase">Manual Mode</span>
                                        </div>
                                        <h1 className="text-3xl font-bold font-heading text-primary-dark">Itinerary Builder</h1>
                                        <p className="text-secondary mt-1">Add days and stops manually.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {itinerary && (
                                            <button onClick={handlePrint} className="bg-slate-900 text-white font-medium text-sm px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-800 shadow-md">
                                                <Download size={16} /> Export PDF
                                            </button>
                                        )}
                                        <button onClick={addDay} className="bg-white border border-neutral-200 text-primary-dark font-medium text-sm px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-neutral-50">
                                            <Plus size={16} /> Add Day
                                        </button>
                                    </div>
                                </div>

                                <div ref={printRef} className="space-y-6 print:p-8">
                                    {itinerary?.days.map((day, dIdx) => (
                                        <div key={day.id || dIdx} className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
                                            <div className="p-5 flex items-center justify-between border-b border-neutral-50">
                                                <div className="flex items-center gap-3">
                                                    <GripVertical size={18} className="text-neutral-300 cursor-grab" />
                                                    <h3 className="text-base font-bold text-primary-dark">Day {day.dayNumber}: {day.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-2 text-secondary">
                                                    <button className="hover:text-primary-dark"><Pen size={14} /></button>
                                                    <button onClick={() => deleteDay(dIdx)} className="hover:text-accent-terracotta"><Trash size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="p-5 space-y-4">
                                                {day.activities.map((act, aIdx) => (
                                                    <div key={act.id || aIdx} className="border border-neutral-100 rounded-xl p-4 bg-neutral-50/30 flex gap-3">
                                                        <div className="flex flex-col items-center pt-1">
                                                            <div className="w-7 h-7 rounded-full bg-neutral-200 text-secondary font-bold text-xs flex items-center justify-center">{aIdx + 1}</div>
                                                        </div>
                                                        <div className="flex-1 space-y-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                                <div className="md:col-span-2">
                                                                    <label className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1 block">Activity</label>
                                                                    <input type="text" value={act.name} onChange={(e) => updateActivityField(dIdx, aIdx, 'name', e.target.value)} className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400" />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1 block">Time</label>
                                                                        <input type="text" value={act.time} onChange={(e) => updateActivityField(dIdx, aIdx, 'time', e.target.value)} className="w-full bg-white border border-neutral-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-sky-400" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1 block">Duration</label>
                                                                        <input type="text" value={act.duration} onChange={(e) => updateActivityField(dIdx, aIdx, 'duration', e.target.value)} className="w-full bg-white border border-neutral-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-sky-400" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1 block">Location</label>
                                                                <input type="text" value={act.location} onChange={(e) => updateActivityField(dIdx, aIdx, 'location', e.target.value)} className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1 block">Notes</label>
                                                                <textarea value={act.notes} onChange={(e) => updateActivityField(dIdx, aIdx, 'notes', e.target.value)} className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400 min-h-[50px]" />
                                                            </div>
                                                            <div className="flex justify-end pt-1 border-t border-neutral-100">
                                                                <button onClick={() => deleteActivity(dIdx, aIdx)} className="text-secondary hover:text-accent-terracotta flex items-center gap-1 text-xs font-bold uppercase tracking-wider"><Trash size={12} /> Remove</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={() => addActivity(dIdx)} className="w-full py-4 border-2 border-dashed border-neutral-200 rounded-xl flex items-center justify-center gap-2 text-secondary hover:border-sky-400 hover:text-sky-500 transition-colors text-sm font-medium">
                                                    <Plus size={16} /> Add Stop
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== ITINERARY — AI MODE ===== */}
                    {activeSection === 'itinerary' && itineraryMode === 'ai' && (
                        <div className="flex h-full">
                            {/* AI Chat Panel */}
                            <div className="w-[380px] bg-white border-r border-neutral-100 flex flex-col flex-shrink-0">
                                <div className="p-4 border-b border-neutral-100 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setItineraryMode('choose')} className="text-white/60 hover:text-white text-xs font-bold">← Back</button>
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-sky-500 rounded-lg flex items-center justify-center">
                                                <Sparkles size={14} className="text-white" />
                                            </div>
                                            <span className="text-white text-sm font-bold">AI Builder</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold uppercase">Pro</span>
                                </div>

                                {/* Config summary */}
                                <div className="p-3 bg-sky-50 border-b border-sky-100 text-xs text-sky-800 flex items-center gap-3 flex-wrap">
                                    <span className="font-bold flex items-center gap-1"><Map size={12} /> {metadata.destination}</span>
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {metadata.numDays}d</span>
                                    <span className="flex items-center gap-1"><Users size={12} /> {metadata.numTravelers}</span>
                                    <span className="flex items-center gap-1"><DollarSign size={12} /> {metadata.budget}</span>
                                </div>

                                {/* Generate button */}
                                {!itinerary && (
                                    <div className="p-4 border-b border-neutral-100">
                                        <button onClick={handleAIGenerate} disabled={loading || !metadata.destination.trim()} className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all">
                                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                            {loading ? "Generating..." : "Generate AI Package"}
                                        </button>
                                        <p className="text-[10px] text-center text-secondary mt-2">Uses config from Basic Info, Dates & Pricing sections</p>
                                    </div>
                                )}

                                {/* Chat messages */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-neutral-50/30">
                                    {messages.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${m.role === 'user' ? 'bg-sky-500 text-white rounded-tr-none font-medium' : 'bg-white text-secondary border border-neutral-100 rounded-tl-none leading-relaxed'}`}>
                                                {m.text}
                                            </div>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-neutral-100 shadow-sm flex items-center gap-2">
                                                <Loader2 size={16} className="animate-spin text-sky-500" />
                                                <span className="text-xs text-secondary animate-pulse font-medium">Building...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Chat input */}
                                <form onSubmit={handleChatSubmit} className="p-3 border-t border-neutral-100 bg-white">
                                    <div className="relative">
                                        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Refine package..." className="w-full pl-4 pr-12 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 shadow-inner" />
                                        <button type="submit" disabled={loading || !chatInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50">
                                            <Send size={14} />
                                        </button>
                                    </div>
                                    {itinerary && (
                                        <button type="button" onClick={handleAIGenerate} disabled={loading} className="w-full mt-2 text-[10px] font-bold text-sky-500 hover:text-sky-700 flex items-center justify-center gap-1 uppercase tracking-widest">
                                            <MessageSquare size={12} /> Regenerate Full Package
                                        </button>
                                    )}
                                </form>
                            </div>

                            {/* AI Itinerary Preview */}
                            <div className="flex-1 overflow-y-auto">
                                {itinerary ? (
                                    <div>
                                        <div className="p-5 bg-white border-b border-neutral-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-sky-50 p-2 rounded-lg"><Briefcase size={16} className="text-sky-600" /></div>
                                                <div>
                                                    <h1 className="text-base font-bold text-primary-dark">{itinerary.tripName}</h1>
                                                    <p className="text-[10px] text-secondary uppercase tracking-widest font-bold">{metadata.numDays} Days · {metadata.numTravelers} Travelers · {metadata.budget}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border border-neutral-200 text-secondary rounded-full text-xs font-bold hover:bg-neutral-50 active:scale-95 transition-all shadow-sm">
                                                    <Download size={14} /> Export PDF
                                                </button>
                                                <button
                                                    onClick={handlePublish}
                                                    disabled={publishing}
                                                    className="flex items-center gap-2 px-6 py-2 bg-amber-400 text-navy-900 rounded-full text-xs font-bold hover:bg-amber-500 active:scale-95 transition-all shadow-md disabled:opacity-50"
                                                >
                                                    {publishing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                    {publishing ? 'Publishing...' : 'Publish Trip'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-8" ref={printRef}>
                                            <div className="max-w-3xl mx-auto space-y-8 print:p-8">
                                                {/* Cost badges */}
                                                {(metadata.flightCost || metadata.trainCost || metadata.hotelCost) && (
                                                    <div className="flex gap-3 flex-wrap">
                                                        {metadata.flightCost && <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold"><Plane size={12} /> Flights: {metadata.flightCost}/pp</div>}
                                                        {metadata.trainCost && <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold"><TrainFront size={12} /> Trains: {metadata.trainCost}/pp</div>}
                                                        {metadata.hotelCost && <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold"><DollarSign size={12} /> Hotels: {metadata.hotelCost}/night</div>}
                                                    </div>
                                                )}

                                                {itinerary.days.map((day, dIdx) => (
                                                    <div key={dIdx} className="space-y-4 border-l-2 border-sky-200 ml-3">
                                                        <div className="flex items-center gap-3 -ml-[11px]">
                                                            <div className="w-5 h-5 rounded-full bg-sky-500 outline outline-6 outline-white flex items-center justify-center shadow"><span className="text-[9px] font-black text-white">{day.dayNumber}</span></div>
                                                            <h3 className="text-lg font-black text-navy-900 font-heading uppercase tracking-tighter">{day.title}</h3>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-6">
                                                            {day.activities.map((act, aIdx) => (
                                                                <div key={aIdx} className="group bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all relative overflow-hidden">
                                                                    <div className="flex items-center gap-2 text-[10px] font-black text-sky-600 uppercase tracking-widest bg-sky-50 px-2.5 py-0.5 rounded-full w-fit mb-2"><Clock size={10} /> {act.time}</div>
                                                                    <h4 className="font-bold text-navy-900 text-sm leading-tight mb-1 group-hover:text-sky-600 transition-colors">{act.name}</h4>
                                                                    <p className="text-[11px] text-secondary leading-relaxed line-clamp-2 mb-3">{act.notes}</p>
                                                                    <div className="pt-2 border-t border-neutral-50 flex items-center justify-between">
                                                                        <span className="text-[10px] font-bold text-secondary uppercase flex items-center gap-1"><Map size={10} /> {act.location}</span>
                                                                        <span className="text-[10px] font-black text-neutral-300">{act.duration}</span>
                                                                    </div>

                                                                    {/* Edit overlay */}
                                                                    {editingActivity?.dIdx === dIdx && editingActivity?.aIdx === aIdx && (
                                                                        <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-20 p-4 flex flex-col justify-between">
                                                                            <div className="space-y-2">
                                                                                <input className="w-full text-sm font-bold border-b border-sky-200 focus:outline-none bg-transparent py-1" value={act.name} onChange={(e) => updateActivityField(dIdx, aIdx, 'name', e.target.value)} />
                                                                                <input className="w-full text-[10px] border-b border-sky-100 focus:outline-none bg-transparent py-1" value={act.location} onChange={(e) => updateActivityField(dIdx, aIdx, 'location', e.target.value)} />
                                                                                <textarea className="w-full text-[10px] border border-neutral-100 p-2 rounded-lg bg-white mt-1 h-14 focus:outline-none focus:ring-1 focus:ring-sky-200" value={act.notes} onChange={(e) => updateActivityField(dIdx, aIdx, 'notes', e.target.value)} />
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                <button onClick={() => setEditingActivity(null)} className="flex-1 bg-slate-900 text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1"><Save size={10} /> Done</button>
                                                                                <button onClick={() => setEditingActivity(null)} className="p-1.5 border border-neutral-100 rounded-lg hover:bg-neutral-50 text-secondary"><X size={10} /></button>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <button onClick={() => setEditingActivity({ dIdx, aIdx })} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-50 rounded-full transition-all text-secondary"><Edit3 size={12} /></button>
                                                                </div>
                                                            ))}
                                                            <button onClick={() => { const nI = { ...itinerary, days: [...itinerary.days] }; nI.days[dIdx] = { ...nI.days[dIdx], activities: [...nI.days[dIdx].activities, { name: "New Stop", time: "12:00", duration: "1 hour", location: "TBD", notes: "" }] }; setItinerary(nI); }}
                                                                className="border-2 border-dashed border-neutral-200 rounded-2xl p-4 flex flex-col items-center justify-center text-secondary hover:border-sky-400 hover:text-sky-500 hover:bg-sky-50 transition-all group min-h-[120px]">
                                                                <Plus size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Add Stop</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 min-h-[60vh]">
                                        <div className="w-20 h-20 bg-sky-50 rounded-3xl flex items-center justify-center mb-6 animate-bounce">
                                            <Sparkles size={40} className="text-sky-400" />
                                        </div>
                                        <h2 className="text-2xl font-black text-navy-900 mb-3 font-heading">Ready to Generate</h2>
                                        <p className="text-secondary max-w-sm text-sm leading-relaxed">Click "Generate AI Package" on the left to create a professional itinerary based on your trip configuration.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ===== POLICIES ===== */}
                    {activeSection === 'policies' && (
                        <div className="max-w-2xl mx-auto p-8 space-y-6">
                            <h1 className="text-3xl font-bold font-heading text-primary-dark">Policies</h1>
                            <p className="text-secondary">Define cancellation, refund, and booking policies for this package.</p>
                            <div>
                                <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block">Cancellation Policy</label>
                                <textarea placeholder="e.g., Free cancellation up to 14 days before departure..." className="w-full px-3 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 min-h-[120px]" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block">Terms & Conditions</label>
                                <textarea placeholder="e.g., All prices are per person unless stated otherwise..." className="w-full px-3 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 min-h-[120px]" />
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
