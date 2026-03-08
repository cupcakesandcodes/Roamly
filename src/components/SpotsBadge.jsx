export default function SpotsBadge({ spotsLeft, total }) {
    const pct = spotsLeft / total
    const color = pct <= 0.2
        ? 'bg-red-50 text-red-600 border-red-200'
        : pct <= 0.5
            ? 'bg-amber-50 text-amber-600 border-amber-200'
            : 'bg-emerald-50 text-emerald-600 border-emerald-200'

    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border ${color}`}>
            {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
        </span>
    )
}
