
export const TRIPS = [
    {
        id: "1",
        title: 'Amalfi Coast Wonders & Hidden Grottoes',
        destination: 'Amalfi Coast, Italy',
        tagline: 'Amalfi Coast, Italy',
        dates: 'July 14 – July 21, 2024',
        duration: '8 Days',
        price: 2450,
        type: 'Adventure',
        image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=1400&q=80',
        spotsLeft: 3,
        totalSpots: 12,
        status: 'CONFIRMED',
        agentName: 'Marco Polo Tours',
        agentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
        agentRating: 4.9,
        agentReviews: 124,
        agentVerified: true,
        groupSize: '5-10',
        badge: 'ONLY 3 SPOTS LEFT',
        badgeColor: 'bg-red-500',
        description: `Discover the breathtaking Amalfi Coast, where dramatic cliffs plunge into the sparkling Tyrrhenian Sea. This 8-day adventure takes you through colorful coastal villages, hidden sea grottoes, and historic ruins. Enjoy authentic Italian cuisine, sail along the rugged coastline, and hike the famous Path of the Gods.`,
        included: [
            'Local expert guides',
            'Boutique Mediterranean sea-view hotels',
            'Daily breakfast & 4 authentic dinners',
            'Private boat tour to Capri & grottoes',
            'Cooking class in Positano',
        ],
        excluded: [
            'Flights to/from Naples',
            'Optional wine tasting tours',
            'Travel Insurance',
        ],
        itinerary: [
            {
                day: 1, title: 'Arrival in Naples & Transfer to Amalfi', tag: 'ARRIVAL', tagColor: 'text-gray-600',
                time: '3:00 PM', location: 'Amalfi', description: 'Arrive in Naples and take a scenic private transfer to your sea-view hotel in Amalfi. Welcome dinner with the group.'
            },
            {
                day: 2, title: 'Hiking the Path of the Gods', tag: 'HIKING', tagColor: 'text-blue-600',
                time: '8:00 AM', location: 'Bomerano to Nocelle', description: 'Walk the spectacular Sentiero degli Dei, offering some of the most stunning coastal views in the world.',
                image: 'https://images.unsplash.com/photo-1542640244-7e672d6cb466?w=600&q=80'
            },
            {
                day: 3, title: 'Capri & the Blue Grotto', tag: 'PREMIUM EXPERIENCE', tagColor: 'text-amber-600',
                time: '9:00 AM', location: 'Capri', description: 'Private boat charter to the glamorous island of Capri. We will explore hidden coves and the magical Blue Grotto.'
            }
        ],
        agent: {
            name: 'Marco Polo Tours', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
            bio: 'Specialists in authentic Italian luxury and adventure travel. We design trips that let you experience Italy like a local.',
            totalTrips: 87, responseRate: '98%', rating: 4.9, totalReviews: 124, verified: true,
        },
        reviewBreakdown: { 5: 110, 4: 10, 3: 4, 2: 0, 1: 0 },
        reviews: [
            { name: 'Alice W.', rating: 5, text: 'Absolutely breathtaking! The Path of the Gods was life-changing.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
            { name: 'Bob M.', rating: 4, text: 'Great trip, Marco was a fantastic guide. Wish we had more time in Capri.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }
        ]
    },
    {
        id: "2",
        title: 'Golden Triangle: Essence of Rajasthan',
        destination: 'Rajasthan, India',
        tagline: 'Rajasthan, India',
        dates: 'August 05 – August 18, 2024',
        duration: '14 Days',
        price: 1890,
        type: 'Cultural',
        image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1400&q=80',
        spotsLeft: 7,
        totalSpots: 15,
        status: 'PENDING',
        agentName: 'Sahara Nomads',
        agentAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&q=80',
        agentRating: 4.8,
        agentReviews: 312,
        agentVerified: true,
        groupSize: '10-20',
        badge: 'FEATURED TRIP',
        badgeColor: 'bg-navy-800',
        description: `Immerse yourself in the vibrant colors, rich history, and majestic architecture of India's Golden Triangle and Rajasthan. From the iconic Taj Mahal to the pink city of Jaipur and the romantic lakes of Udaipur, experience the royal heritage and bustling bazaars of incredible India.`,
        included: [
            'English-speaking tour director',
            'Heritage hotel & palace stays',
            'All breakfasts and 6 special dinners',
            'AC transport between cities',
            'Entrance fees to all monuments',
        ],
        excluded: [
            'International flights to New Delhi',
            'Visa fees',
            'Camera/video fees at monuments',
        ],
        itinerary: [
            {
                day: 1, title: 'Welcome to New Delhi', tag: 'ARRIVAL', tagColor: 'text-gray-600',
                time: '2:00 PM', location: 'New Delhi', description: 'Arrive in India’s capital. Rest at your luxury hotel.'
            }
        ],
        agent: {
            name: 'Sahara Nomads', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&q=80',
            bio: 'Crafting unforgettable cultural journeys across Asia and Africa.',
            totalTrips: 205, responseRate: '95%', rating: 4.8, totalReviews: 312, verified: true,
        },
        reviewBreakdown: { 5: 280, 4: 20, 3: 10, 2: 2, 1: 0 },
        reviews: [
            { name: 'John D.', rating: 5, text: 'Rajasthan is magical. The palaces were incredible.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' }
        ]
    },
    {
        id: "3",
        title: 'Swiss Alpine Adventure & Luxury Resorts',
        destination: 'Interlaken, Switzerland',
        tagline: 'Interlaken, Switzerland',
        dates: 'September 10 – September 22, 2024',
        duration: '12 Days',
        price: 3120,
        type: 'Luxury',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80',
        spotsLeft: 5,
        totalSpots: 12,
        status: 'CONFIRMED',
        agentName: 'Marco Stein',
        agentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
        agentRating: 4.9,
        agentReviews: 20,
        agentVerified: true,
        groupSize: '5-10',
        badge: 'BEST SELLER',
        badgeColor: 'bg-emerald-500',
        description: `Experience the majesty of the Swiss Alps on this curated journey. High-altitude adventure meets boutique luxury.`,
        included: [
            'Mountain guides',
            '4-star hotel stays',
            'All regional transport',
        ],
        excluded: [
            'International flights',
        ],
        itinerary: [
            { day: 1, title: 'Arrival in Interlaken', tag: 'START', tagColor: 'text-gray-600', time: '12:00 PM', location: 'Interlaken', description: 'Check-in and orientation.' }
        ],
        agent: {
            name: 'Marco Stein', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
            bio: 'Expert mountain guide with 15 years experience.',
            totalTrips: 142, responseRate: '100%', rating: 4.9, totalReviews: 20, verified: true,
        },
        reviewBreakdown: { 5: 18, 4: 2, 3: 0, 2: 0, 1: 0 },
        reviews: [
            { name: 'Sarah L.', rating: 5, text: 'The Best experience in the Alps. Worth every penny.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' }
        ]
    }
];

export const getTripById = (id) => TRIPS.find(t => t.id === String(id)) || TRIPS[0];
