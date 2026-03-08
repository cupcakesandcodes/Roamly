import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Search, User, Menu, X, Globe, Settings, LogOut, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AgentNavbar({ customActions }) {
    const [open, setOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const { currentUser, userProfile, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (err) {
            console.error("Logout failed:", err)
        }
    }

    const isActive = (path) => location.pathname === path

    // Agency Data
    const agencyName = userProfile?.displayName || currentUser?.displayName || 'My Agency'
    const agencyEmail = currentUser?.email || ''
    const agencyPhoto = userProfile?.profilePhoto || currentUser?.photoURL || ''
    const initials = agencyName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-100 shadow-sm">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo & Agent Badge */}
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-baseline gap-1 no-underline">
                            <span className="text-xl font-black font-heading text-navy-900 tracking-tight">Roamly</span>
                            <span className="text-amber-500 text-2xl leading-none">.</span>
                        </Link>

                        <Link to="/agent/dashboard" className="hidden md:flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-100 no-underline hover:bg-neutral-100 transition-colors">
                            <ShieldCheck size={14} className="text-amber-500" />
                            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Agent Portal</span>
                        </Link>
                    </div>

                    {/* Desktop Nav Actions */}
                    <div className="hidden md:flex items-center gap-8">

                        {/* Custom Actions (e.g. Onboarding progress) */}
                        {customActions && (
                            <div className="flex items-center">
                                {customActions}
                            </div>
                        )}

                        {!customActions && (
                            <>
                                <div className="flex items-center gap-6">
                                    <Link
                                        to="/agent/dashboard"
                                        className={`text-sm font-bold tracking-tight no-underline transition-colors ${isActive('/agent/dashboard') ? 'text-navy-900' : 'text-secondary hover:text-navy-900'}`}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/agent/trip-builder"
                                        className={`text-sm font-bold tracking-tight no-underline transition-colors flex items-center gap-1.5 ${isActive('/agent/trip-builder') ? 'text-amber-600' : 'text-secondary hover:text-amber-600'}`}
                                    >
                                        <Sparkles size={16} /> AI Builder
                                    </Link>
                                    <Link
                                        to="/discover"
                                        className="text-secondary hover:text-navy-900 transition-colors no-underline"
                                        title="View Traveller Site"
                                    >
                                        <Globe size={18} />
                                    </Link>
                                </div>

                                <div className="w-px h-6 bg-neutral-100"></div>

                                <button className="text-secondary hover:text-navy-900 relative transition-colors bg-transparent border-none p-0 cursor-pointer">
                                    <Bell size={20} />
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 text-[9px] font-black text-white items-center justify-center">0</span>
                                    </span>
                                </button>
                            </>
                        )}

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-3 hover:bg-neutral-50 p-1 rounded-full px-2 transition-all border border-transparent hover:border-neutral-100 bg-transparent cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-xl bg-navy-900 text-white flex items-center justify-center font-black text-xs shadow-md overflow-hidden">
                                    {agencyPhoto ? <img src={agencyPhoto} className="w-full h-full object-cover" /> : initials}
                                </div>
                                <div className="text-left hidden lg:block">
                                    <p className="text-[11px] font-black text-navy-900 leading-none uppercase tracking-wider">{agencyName}</p>
                                    <p className="text-[9px] text-amber-600 font-bold uppercase mt-1">Verified Agent</p>
                                </div>
                                <ChevronDown size={14} className={`text-secondary transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-neutral-100 py-2 top-full animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-5 py-4 border-b border-neutral-50 mb-2">
                                        <p className="text-xs font-black text-navy-900 uppercase tracking-widest">{agencyName}</p>
                                        <p className="text-[10px] text-secondary mt-1 truncate">{agencyEmail}</p>
                                    </div>
                                    <Link to="/profile/me" className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-secondary hover:bg-neutral-50 hover:text-navy-900 transition-colors no-underline">
                                        <User size={16} className="text-amber-500" /> My Agency Profile
                                    </Link>
                                    <Link to="/agent/settings" className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-secondary hover:bg-neutral-50 hover:text-navy-900 transition-colors no-underline">
                                        <Settings size={16} /> Account Settings
                                    </Link>
                                    <div className="h-px bg-neutral-50 my-2"></div>
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors bg-transparent border-none cursor-pointer">
                                        <LogOut size={16} /> Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile toggle */}
                    <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-secondary hover:bg-neutral-50 rounded-lg transition-colors border border-transparent hover:border-neutral-100">
                        {open ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {open && (
                    <div className="md:hidden py-4 border-t border-neutral-100 space-y-4">
                        <div className="relative px-2">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary" size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <Link to="/agent/dashboard" className="block px-4 py-2.5 text-sm font-medium text-primary-dark bg-neutral-50 rounded-xl no-underline">
                                Dashboard Overview
                            </Link>
                            <Link to="/agent/trip-builder" className="block px-4 py-2.5 text-sm font-bold text-accent-blue hover:bg-accent-blue/5 rounded-xl no-underline flex items-center gap-2">
                                <Sparkles size={18} /> AI Trip Builder
                            </Link>
                            <Link to="/agent/trips" className="block px-4 py-2.5 text-sm font-medium text-secondary hover:bg-neutral-50 hover:text-primary-dark rounded-xl transition-colors no-underline">
                                Manage Trips
                            </Link>
                            <Link to="/agent/bookings" className="block px-4 py-2.5 text-sm font-medium text-secondary hover:bg-neutral-50 hover:text-primary-dark rounded-xl transition-colors no-underline flex items-center justify-between">
                                Booking Requests
                                <span className="bg-accent-terracotta text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3 New</span>
                            </Link>
                        </div>
                        <div className="h-px bg-neutral-100 my-2 mx-2"></div>
                        <div className="flex items-center gap-3 px-4 py-2">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                                EK
                            </div>
                            <div>
                                <p className="text-sm font-bold text-primary-dark leading-tight">Elevate Travels</p>
                                <p className="text-xs text-secondary">Pro Agent</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Link to="/profile/me" className="block px-4 py-2.5 text-sm font-medium text-secondary hover:bg-neutral-50 hover:text-primary-dark rounded-xl transition-colors no-underline">
                                My Agency Profile
                            </Link>
                            <button className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-accent-terracotta hover:bg-accent-terracotta/5 rounded-xl transition-colors">
                                Sign out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
