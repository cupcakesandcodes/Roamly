import { BadgeCheck } from 'lucide-react'

export default function VerifiedBadge({ size = 14 }) {
    return (
        <span className="inline-flex items-center" title="Verified Agent">
            <BadgeCheck size={size} className="text-blue-500 fill-blue-100" />
        </span>
    )
}
