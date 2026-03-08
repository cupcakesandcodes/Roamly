import { Star } from 'lucide-react'

export default function StarRating({ rating = 0, size = 14, showValue = true }) {
    const full = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5
    const empty = 5 - full - (hasHalf ? 1 : 0)

    return (
        <span className="inline-flex items-center gap-1">
            <span className="flex items-center gap-0.5">
                {[...Array(full)].map((_, i) => (
                    <Star key={`f-${i}`} size={size} className="fill-amber-400 text-amber-400" />
                ))}
                {hasHalf && (
                    <span className="relative" style={{ width: size, height: size }}>
                        <Star size={size} className="absolute text-gray-300" />
                        <span className="absolute overflow-hidden" style={{ width: size / 2, height: size }}>
                            <Star size={size} className="fill-amber-400 text-amber-400" />
                        </span>
                    </span>
                )}
                {[...Array(empty)].map((_, i) => (
                    <Star key={`e-${i}`} size={size} className="text-gray-300" />
                ))}
            </span>
            {showValue && <span className="text-xs font-medium text-text-secondary ml-0.5">{rating.toFixed(1)}</span>}
        </span>
    )
}
