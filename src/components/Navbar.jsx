import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Sparkles, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const [open, setOpen] = useState(false)
    const { currentUser, userProfile, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        setOpen(false)
        navigate('/')
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 no-underline">
                        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">R</span>
                        </div>
                        <span className="text-xl font-bold text-navy-900 font-[var(--font-heading)]">Roamly</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/discover" className="text-sm font-medium text-text-secondary hover:text-navy-900 transition-colors no-underline">
                            Browse Trips
                        </Link>
                        <Link to="/ai-planner" className="text-sm font-medium text-amber-500 hover:text-amber-600 transition-colors no-underline flex items-center gap-1">
                            <Sparkles size={16} /> Plan with AI
                        </Link>

                        {/* Auth Section */}
                        {currentUser ? (
                            <div className="flex items-center gap-4">
                                <Link to="/dashboard" className="text-sm font-medium text-text-secondary hover:text-navy-900 transition-colors no-underline">
                                    Dashboard
                                </Link>
                                <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                                    <Link to="/profile/me" className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-neutral-100 transition-colors no-underline border border-transparent hover:border-neutral-200">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden border border-amber-200">
                                            {userProfile?.profilePhoto || currentUser.photoURL ? (
                                                <img src={userProfile?.profilePhoto || currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={16} className="text-amber-600" />
                                            )}
                                        </div>
                                        <span className="text-sm font-bold text-navy-900">
                                            {userProfile?.displayName?.split(' ')[0] || currentUser.displayName?.split(' ')[0] || 'Profile'}
                                        </span>
                                    </Link>
                                    <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Log out">
                                        <LogOut size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link to="/become-agent" className="text-sm font-medium text-text-secondary hover:text-navy-900 transition-colors no-underline">
                                    Become an Agent
                                </Link>
                                <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-navy-900 transition-colors no-underline">
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-500 text-navy-900 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md no-underline"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-surface-muted transition-colors">
                        {open ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {open && (
                    <div className="md:hidden pb-4 pt-2 border-t border-border mt-2 space-y-2">
                        <Link to="/discover" className="block px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted transition no-underline">
                            Browse Trips
                        </Link>
                        <Link to="/ai-planner" className="block px-3 py-2 rounded-lg text-sm font-medium text-amber-500 hover:bg-amber-50 transition no-underline flex items-center gap-2">
                            <Sparkles size={18} /> Plan with AI
                        </Link>

                        {currentUser ? (
                            <>
                                <Link to="/dashboard" className="block px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted transition no-underline">
                                    Dashboard
                                </Link>
                                <Link to="/profile/me" className="block px-3 py-2 rounded-lg text-sm font-bold text-navy-900 bg-amber-50 border border-amber-100 transition no-underline flex items-center gap-2 mt-2">
                                    <User size={16} className="text-amber-600" /> My Profile
                                </Link>
                                <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition no-underline flex items-center gap-2">
                                    <LogOut size={16} /> Log out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/become-agent" className="block px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted transition no-underline">
                                    Become an Agent
                                </Link>
                                <Link to="/login" className="block px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted transition no-underline">
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="block mx-3 text-center px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-500 text-navy-900 text-sm font-semibold transition no-underline"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}

