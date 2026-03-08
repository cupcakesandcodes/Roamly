import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Users,
    Map as MapIcon,
    Star,
    DollarSign,
    TrendingUp,
    Calendar,
    MessageSquare,
    MoreVertical,
    Plus,
    Loader2
} from 'lucide-react'
import AgentNavbar from '../components/AgentNavbar'
import { db } from '../firebase'
import { collection, query, where, onSnapshot, doc, updateDoc, increment, getDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

const AgentDashboard = () => {
    const { currentUser } = useAuth();
    const [trips, setTrips] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingRequest, setProcessingRequest] = useState(null);
    const [stats, setStats] = useState({
        totalTrips: 0,
        activeTravellers: 0,
        totalRevenue: 0,
        averageRating: 4.8 // Mock rating for now
    });

    useEffect(() => {
        if (!currentUser) return;

        // 1. Fetch Agent's Trips
        const qTrips = query(collection(db, 'trips'), where('agentId', '==', currentUser.uid));

        const unsubscribeTrips = onSnapshot(qTrips, (snapshot) => {
            const fetchedTrips = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTrips(fetchedTrips);

            // Calculate base stats
            const totalTrips = fetchedTrips.length;
            let activeTravellers = 0;
            let totalRevenue = 0;

            // Aggregate stats based on spotsFilled and price
            fetchedTrips.forEach(trip => {
                activeTravellers += (trip.spotsFilled || 0);
                totalRevenue += ((trip.spotsFilled || 0) * (trip.price || 0));
            });

            setStats(prev => ({
                ...prev,
                totalTrips,
                activeTravellers,
                totalRevenue
            }));
        });

        // 2. Fetch Pending Requests
        const qRequests = query(collection(db, 'bookings'), where('status', '==', 'PENDING'));

        const unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
            const fetchedRequests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setPendingRequests(fetchedRequests);
            setLoading(false);
        });

        return () => {
            unsubscribeTrips();
            unsubscribeRequests();
        };
    }, [currentUser]);

    // Handle Accept/Decline
    const handleUpdateRequestStatus = async (requestId, tripId, newStatus, guests) => {
        try {
            setProcessingRequest(requestId);

            // 1. Update the booking status
            const bookingRef = doc(db, 'bookings', requestId);
            await updateDoc(bookingRef, { status: newStatus });

            // 2. If CONFIRMED, update the trip's spotsFilled
            if (newStatus === 'CONFIRMED') {
                const tripRef = doc(db, 'trips', tripId);
                await updateDoc(tripRef, {
                    spotsFilled: increment(guests || 1)
                });
            }
        } catch (error) {
            console.error(`Error updating request to ${newStatus}:`, error);
            alert(`Failed to update request: ${error.message}`);
        } finally {
            setProcessingRequest(null);
        }
    };

    // Filter pending requests to only show those for the agent's trips
    const agentPendingRequests = pendingRequests.filter(req => trips.some(t => t.id === req.tripId));

    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-500" size={48} />
            </div>
        );
    }

    return (
        <>
            <AgentNavbar />
            <div className="pt-24 pb-16 min-h-screen bg-surface">
                <div className="container mx-auto px-4 max-w-7xl">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold font-heading text-primary-dark">Agent Dashboard</h1>
                            <p className="text-secondary mt-1">Welcome back! Here's an overview of your trips.</p>
                        </div>
                        <Link to="/agent/trip-builder" className="btn-primary flex items-center gap-2">
                            <Plus size={20} />
                            Create New Trip
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={<MapIcon className="text-white" size={24} />}
                            label="Total Trips"
                            value={stats.totalTrips}
                            trend="Active listings"
                            bgColor="bg-sky-500"
                        />
                        <StatCard
                            icon={<Users className="text-white" size={24} />}
                            label="Active Travellers"
                            value={stats.activeTravellers}
                            trend="Total booked"
                            bgColor="bg-rose-500"
                        />
                        <StatCard
                            icon={<DollarSign className="text-white" size={24} />}
                            label="Total Revenue"
                            value={`$${stats.totalRevenue.toLocaleString()}`}
                            trend="Expected revenue"
                            bgColor="bg-amber-500"
                        />
                        <StatCard
                            icon={<Star className="text-white" size={24} />}
                            label="Average Rating"
                            value={stats.averageRating}
                            trend="Based on reviews"
                            bgColor="bg-emerald-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Active Trips Table */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                                <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                                    <h2 className="text-xl font-bold font-heading">Active Trips</h2>
                                    <button className="text-accent-blue font-medium text-sm hover:underline">View All</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-neutral-50 text-secondary text-sm font-medium text-left">
                                            <tr>
                                                <th className="py-4 px-6">Trip Name</th>
                                                <th className="py-4 px-6">Status</th>
                                                <th className="py-4 px-6">Spots Filled</th>
                                                <th className="py-4 px-6">Price</th>
                                                <th className="py-4 px-6"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 text-sm">
                                            {trips.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="py-12 text-center text-secondary">
                                                        No active trips found. Create one to get started!
                                                    </td>
                                                </tr>
                                            ) : trips.map((trip) => {
                                                const filled = trip.spotsFilled || 0;
                                                const total = trip.totalSpots || 10;
                                                const isFull = filled >= total;
                                                const status = isFull ? 'Full' : (filled > 0 ? 'Enrolling' : 'Upcoming');

                                                return (
                                                    <tr key={trip.id} className="hover:bg-neutral-50 transition-colors">
                                                        <td className="py-4 px-6">
                                                            <Link to={`/trip/${trip.id}`} className="font-bold text-primary-dark hover:text-sky-600 transition-colors">{trip.title}</Link>
                                                            <p className="text-secondary text-xs mt-1">{trip.duration}</p>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                                ${status === 'Enrolling' ? 'bg-accent-blue/10 text-accent-blue' : ''}
                                ${status === 'Full' ? 'bg-accent-terracotta/10 text-accent-terracotta' : ''}
                                ${status === 'Upcoming' ? 'bg-primary/10 text-primary-dark' : ''}
                              `}>
                                                                {status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-full bg-neutral-100 rounded-full h-2 max-w-[80px]">
                                                                    <div
                                                                        className="bg-primary rounded-full h-2"
                                                                        style={{ width: `${(filled / total) * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-secondary text-xs">{filled}/{total}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 font-medium text-primary-dark">
                                                            ${(trip.price || 0).toLocaleString()}
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <button className="text-secondary hover:text-primary-dark transition-colors">
                                                                <MoreVertical size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar / Pending Requests */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold font-heading">Pending Requests</h2>
                                    <span className="bg-accent-terracotta text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {agentPendingRequests.length}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {agentPendingRequests.length === 0 ? (
                                        <div className="text-center py-6 text-sm text-secondary bg-neutral-50 rounded-xl border border-neutral-100 border-dashed">
                                            No pending booking requests.
                                        </div>
                                    ) : (
                                        agentPendingRequests.map((request) => {
                                            const tripName = trips.find(t => t.id === request.tripId)?.title || 'Unknown Trip';
                                            // Format timestamp if it exists, else show 'Just now'
                                            const timeAgo = request.createdAt?.toDate
                                                ? new Date(request.createdAt.toDate()).toLocaleDateString()
                                                : 'Recently';

                                            return (
                                                <div key={request.id} className="flex items-start gap-4 p-4 rounded-xl border border-neutral-100 hover:border-accent-blue/30 transition-colors">
                                                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                                                        <Users size={18} className="text-secondary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <p className="text-sm font-bold text-primary-dark">{request.userName || 'Traveller'}</p>
                                                            <span className="text-[10px] text-secondary">{timeAgo}</span>
                                                        </div>
                                                        <p className="text-xs text-secondary mt-0.5 max-w-[140px] truncate" title={tripName}>req. {tripName}</p>
                                                        <div className="flex items-center justify-between mt-3">
                                                            <span className="text-xs font-medium text-primary-dark bg-neutral-50 px-2 py-1 rounded-md">
                                                                {request.guests || 1} Guest(s)
                                                            </span>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleUpdateRequestStatus(request.id, request.tripId, 'CONFIRMED', request.guests)}
                                                                    disabled={processingRequest === request.id}
                                                                    className="text-[10px] px-2 py-1 font-bold text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                                                >
                                                                    {processingRequest === request.id ? '...' : 'Accept'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateRequestStatus(request.id, request.tripId, 'DECLINED', request.guests)}
                                                                    disabled={processingRequest === request.id}
                                                                    className="text-[10px] px-2 py-1 font-bold text-rose-600 bg-rose-50 rounded hover:bg-rose-100 transition-colors disabled:opacity-50"
                                                                >
                                                                    {processingRequest === request.id ? '...' : 'Decline'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                {agentPendingRequests.length > 0 && (
                                    <button className="w-full mt-6 text-sm font-medium text-accent-blue hover:text-accent-blue-dark transition-colors">
                                        View All Requests
                                    </button>
                                )}
                            </div>

                            <div className="bg-primary text-white rounded-2xl shadow-sm p-6 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="font-bold font-heading text-lg mb-2">Grow Your Business</h3>
                                    <p className="text-sm text-white/80 mb-6">Learn how to optimize your trip listings to attract more travellers.</p>
                                    <button className="bg-white text-primary-dark font-bold text-sm px-4 py-2 rounded-full hover:bg-neutral-50 transition-colors">
                                        Read Guide
                                    </button>
                                </div>
                                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute top-4 -right-2 w-16 h-16 bg-accent-gold/20 rounded-full blur-xl"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

const StatCard = ({ icon, label, value, trend, bgColor }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bgColor}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-secondary mb-1">{label}</p>
            <h3 className="text-2xl font-bold font-heading text-primary-dark">{value}</h3>
            <p className="text-xs font-medium text-primary mt-1 flex items-center gap-1">
                <TrendingUp size={12} />
                {trend}
            </p>
        </div>
    </div>
)

export default AgentDashboard
