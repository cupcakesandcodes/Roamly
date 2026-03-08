import { Heart } from 'lucide-react'
import { useState } from 'react'
import StarRating from './StarRating'
import VerifiedBadge from './VerifiedBadge'
import SpotsBadge from './SpotsBadge'

export default function TripCard({ trip }) {
    const [saved, setSaved] = useState(false)

    return (
        <div className="group bg-white rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={trip.image}
                    alt={trip.destination}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Spots badge */}
                <div className="absolute top-3 left-3">
                    <SpotsBadge spotsLeft={trip.spotsLeft} total={trip.totalSpots} />
                </div>
                {/* Price badge */}
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-navy-900 shadow-sm">
                    from ${trip.price.toLocaleString()}
                </div>
                {/* Save button */}
                <button
                    onClick={() => setSaved(!saved)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-sm"
                >
                    <Heart
                        size={16}
                        className={saved ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                    />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-base font-semibold text-navy-900 mb-1 truncate">
                    {trip.title}
                </h3>
                <p className="text-sm text-text-secondary mb-3">
                    {trip.duration} • {trip.destination}
                </p>

                {/* Agent info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img
                            src={trip.agentAvatar}
                            alt={trip.agentName}
                            className="w-7 h-7 rounded-full object-cover ring-2 ring-surface-muted"
                        />
                        <span className="text-sm font-medium text-text-secondary flex items-center gap-1">
                            {trip.agentName}
                            {trip.agentVerified && <VerifiedBadge size={13} />}
                        </span>
                    </div>
                    <StarRating rating={trip.agentRating} size={12} />
                </div>
            </div>
        </div>
    )
}
