// src/lib/data/mockData.ts
export type Photographer = {
    id: string;
    name: string;
    location: string;
    profilePicture: string;
    verified: boolean;
    bio: string;
    services: string[];
    portfolio: { id: string; url: string; caption: string }[];
    rating: number;
    reviews: Review[];
    cameraKit: string;
};

export type Project = {
    id: string;
    title: string;
    location: string;
    budget: number;
    currency: string; // e.g., 'USD', 'GBP', 'EUR'
    deadline: string;
    description: string;
    status: 'open' | 'in progress' | 'completed';
    referenceImages: string[];
    clientName: string;
    collaborative: boolean;
    assignedPhotographers: string[];
    photographyType: string;
    hours: number;
    includeTransportationFee: boolean;
    projectDate: string;
    projectTime: string;
    clientId: string;
};

export type Offer = {
    photographerId: string;
    projectId: string;
    price: number;
    notes: string;
    status: 'pending' | 'accepted' | 'rejected';
};

export type Message = {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: number;
};

export type Review = {
    id: string;
    author: string;
    rating: number;
    comment: string;
    createdAt: number;
};

export const MOCK_PHOTOGRAPHERS: Photographer[] = [
    {
        id: '1',
        name: 'Alice Smith',
        location: 'London, UK',
        profilePicture: 'https://source.unsplash.com/random/100x100/?woman,face,1',
        verified: true,
        bio:
            'Experienced wedding and portrait photographer with a passion for capturing beautiful moments. Available for projects in London and surrounding areas.',
        services: ['Wedding Photography', 'Portrait Photography', 'Event Photography'],
        portfolio: [
            { id: 'p1', url: 'https://source.unsplash.com/random/400x300/?wedding', caption: 'Wedding Ceremony' },
            { id: 'p2', url: 'https://source.unsplash.com/random/400x300/?portrait', caption: 'Family Portrait' },
            { id: 'p3', url: 'https://source.unsplash.com/random/400x300/?event', caption: 'Corporate Event' },
            { id: 'p4', url: 'https://source.unsplash.com/random/400x300/?bride', caption: 'Bridal Portrait' },
        ],
        rating: 4.8,
        reviews: [
            { id: 'r1', author: 'John Doe', rating: 5, comment: 'Alice was amazing! She captured our wedding day perfectly.', createdAt: Date.now() - 86400000 },
            { id: 'r2', author: 'Jane Smith', rating: 4, comment: 'Great photos, very professional.', createdAt: Date.now() - 172800000 },
        ],
        cameraKit: 'Canon EOS R5, RF 24-70mm f/2.8L, RF 70-200mm f/2.8L'
    },
    {
        id: '2',
        name: 'Bob Johnson',
        location: 'Manchester, UK',
        profilePicture: 'https://source.unsplash.com/random/100x100/?man,face,1',
        verified: false,
        bio:
            'Specializes in commercial and product photography. Based in Manchester but willing to travel for the right project.',
        services: ['Commercial Photography', 'Product Photography', 'Real Estate Photography'],
        portfolio: [
            { id: 'p5', url: 'https://source.unsplash.com/random/400x300/?product,1', caption: 'Product Shot 1' },
            { id: 'p6', url: 'https://source.unsplash.com/random/400x300/?product,2', caption: 'Product Shot 2' },
            { id: 'p7', url: 'https://source.unsplash.com/random/400x300/?commercial', caption: 'Office Space' },
        ],
        rating: 4.5,
        reviews: [
            { id: 'r3', author: 'Company A', rating: 5, comment: 'Bob delivered high-quality images for our marketing campaign.', createdAt: Date.now() - 259200000 },
        ],
        cameraKit: 'Sony A7 IV, FE 50mm f/1.2 GM, FE 24-105mm f/4 G'
    },
    {
        id: '3',
        name: 'Sarah Williams',
        location: 'Edinburgh, UK',
        profilePicture: 'https://source.unsplash.com/random/100x100/?woman,face,2',
        verified: true,
        bio:
            "Passionate about capturing the beauty of Scotland through landscape and travel photography. Also available for portrait sessions.",
        services: ["Landscape Photography", "Travel Photography", "Portrait Photography"],
        portfolio: [
            { id: "p8", url: "https://source.unsplash.com/random/400x300/?scotland", caption: "Scottish Highlands" },
            { id: "p9", url: "https://source.unsplash.com/random/400x300/?travel", caption: "Cityscape" },
            { id: "p10", url: "https://source.unsplash.com/random/400x300/?portrait,2", caption: "Outdoor Portrait" },
        ],
        rating: 4.9,
        reviews: [
            { id: 'r4', author: 'David M.', rating: 5, comment: 'Sarah is a true artist. Her landscape photos are breathtaking.', createdAt: Date.now() - 604800000 },
        ],
        cameraKit: 'Nikon Z7 II, Z 14-30mm f/4 S, Z 24-70mm f/2.8 S'
    },
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: '1',
        title: 'Wedding Photography',
        location: 'London, UK',
        budget: 2000,
        currency: 'GBP',
        deadline: '2025-12-31',
        description:
            'Looking for a professional photographer to capture our wedding day. We want a mix of candid and posed shots.',
        status: 'open',
        referenceImages: [
            'https://source.unsplash.com/random/600x400/?wedding,ceremony',
            'https://source.unsplash.com/random/600x400/?wedding,reception',
        ],
        clientName: "Emily Brown",
        collaborative: true,
        assignedPhotographers: [],
        photographyType: 'Wedding Photography',
        hours: 8,
        includeTransportationFee: true,
        projectDate: '2025-12-20',
        projectTime: '10:00',
        clientId: 'c1'
    },
    {
        id: '2',
        title: 'Product Photography for E-commerce',
        location: 'Manchester, UK',
        budget: 1000,
        currency: 'USD',
        deadline: '2025-11-30',
        description:
            'Need a photographer to take high-quality photos of our new product line for our e-commerce website. Focus on clean, well-lit shots with white background.',
        status: 'open',
        referenceImages: [
            'https://source.unsplash.com/random/600x400/?product,tech,1',
            'https://source.unsplash.com/random/600x400/?product,tech,2',
        ],
        clientName: "TechCorp Ltd",
        collaborative: false,
        assignedPhotographers: [],
        photographyType: 'Product Photography',
        hours: 4,
        includeTransportationFee: false,
        projectDate: '2025-11-15',
        projectTime: '14:00',
        clientId: 'c2'
    },
    {
        id: "3",
        title: "Family Portrait Session - Outdoor",
        location: "Edinburgh, UK",
        budget: 500,
        currency: 'GBP',
        deadline: "2025-12-15",
        description: "Looking for a photographer to capture some family portraits, preferably outdoors in a scenic park setting.",
        status: "open",
        referenceImages: [
            "https://source.unsplash.com/random/600x400/?family,portrait",
            "https://source.unsplash.com/random/600x400/?outdoor,family",
        ],
        clientName: "The Robertsons",
        collaborative: false,
        assignedPhotographers: [],
        photographyType: 'Portrait Photography',
        hours: 2,
        includeTransportationFee: false,
        projectDate: '2025-12-05',
        projectTime: '11:00',
        clientId: 'c1'
    },
    {
        id: '4',
        title: 'Corporate Event Coverage',
        location: 'London, UK',
        budget: 3500,
        currency: 'GBP',
        deadline: '2025-10-20',
        description: 'Need two photographers to cover our annual corporate gala, including keynote speakers, networking, and candid shots. Full-day coverage required.',
        status: 'open',
        referenceImages: ['https://source.unsplash.com/random/600x400/?corporate,event,gala'],
        clientName: 'Global Solutions Inc.',
        collaborative: true,
        assignedPhotographers: [],
        photographyType: 'Event Photography',
        hours: 10,
        includeTransportationFee: true,
        projectDate: '2025-10-18',
        projectTime: '09:00',
        clientId: 'c3'
    }
];

export const MOCK_OFFERS: Offer[] = [
    { photographerId: '1', projectId: '1', price: 1800, notes: 'I would love to photograph your wedding! Please see my portfolio for examples of my work.', status: 'pending' },
    { photographerId: '2', projectId: '2', price: 900, notes: 'I have extensive experience in product photography. I can provide high-resolution images for your website.', status: 'pending' },
];

export const MOCK_MESSAGES: Message[] = [
    { id: 'm1', senderId: '1', senderName: 'Alice Smith', text: 'Hello! I am interested in your wedding photography project.', timestamp: Date.now() - 3600000 },
    { id: 'm2', senderId: 'c1', senderName: 'Emily Brown', text: 'Hi Alice, thanks for your interest! Could you tell me more about your style?', timestamp: Date.now() - 1800000 },
    { id: 'm3', senderId: '1', senderName: 'Alice Smith', text: 'Of course! I specialize in capturing candid moments with a touch of artistry. You can see examples in my portfolio on my profile.', timestamp: Date.now() - 600000 },
];