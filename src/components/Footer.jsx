import { Link } from 'react-router-dom'
import { Instagram, Twitter, Facebook, MapPin, Mail, Phone } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-navy-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                                <span className="text-navy-900 font-bold text-sm">R</span>
                            </div>
                            <span className="text-xl font-bold font-[var(--font-heading)]">Roamly</span>
                        </div>
                        <p className="text-sm text-navy-300 leading-relaxed mb-4">
                            Connecting travellers with trusted local agents for unforgettable group travel experiences across the globe.
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="#" className="w-9 h-9 rounded-full bg-navy-800 hover:bg-amber-400 hover:text-navy-900 flex items-center justify-center transition-all duration-200 text-navy-300">
                                <Instagram size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-navy-800 hover:bg-amber-400 hover:text-navy-900 flex items-center justify-center transition-all duration-200 text-navy-300">
                                <Twitter size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-navy-800 hover:bg-amber-400 hover:text-navy-900 flex items-center justify-center transition-all duration-200 text-navy-300">
                                <Facebook size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Explore */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-4">Explore</h4>
                        <ul className="space-y-2.5">
                            {['Browse Trips', 'Last Minute Deals', 'Adventure Trips', 'Luxury Trips', 'Last Minute Deals'].map((item, i) => (
                                <li key={i}>
                                    <a href="#" className="text-sm text-navy-300 hover:text-white transition-colors no-underline">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* For Agents */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-4">For Agents</h4>
                        <ul className="space-y-2.5">
                            {['Join as Agent', 'Agent Dashboard', 'Success Stories', 'Pricing', 'Resources'].map((item, i) => (
                                <li key={i}>
                                    <a href="#" className="text-sm text-navy-300 hover:text-white transition-colors no-underline">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-4">Support</h4>
                        <ul className="space-y-2.5">
                            {['Help Center', 'Safety Info', 'Trust & Safety', 'Cancellation Policy', 'Privacy Policy'].map((item, i) => (
                                <li key={i}>
                                    <a href="#" className="text-sm text-navy-300 hover:text-white transition-colors no-underline">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-navy-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-navy-400">
                        © 2026 Roamly. Redefining how the world connects through curated group travel experiences.
                    </p>
                    <p className="text-xs text-navy-500">
                        Connecting explorers with verified agents for unforgettable trips worldwide.
                    </p>
                </div>
            </div>
        </footer>
    )
}
