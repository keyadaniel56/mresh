import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Service, Booking, Review, BlogPost, ChatMessage, LogEntry, MpesaTransaction, GiftCard, GalleryItem, Voucher, VoucherRedemption } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  services: Service[];
  bookings: Booking[];
  reviews: Review[];
  blogs: BlogPost[];
  chats: ChatMessage[];
  logs: LogEntry[];
  payments: MpesaTransaction[];
  giftcards: GiftCard[];
  gallery: GalleryItem[];
  vouchers: Voucher[];
  voucherRedemptions?: VoucherRedemption[];
}

// In-memory cache synced with the disk
let dbCache: DatabaseSchema = {
  users: [],
  services: [],
  bookings: [],
  reviews: [],
  blogs: [],
  chats: [],
  logs: [],
  payments: [],
  giftcards: [],
  gallery: [],
  vouchers: []
};

// Seed Data
const defaultServices: Service[] = [
  {
    id: 's-1',
    name: 'Luxury Silk Press & Blowout',
    category: 'hair',
    price: 1500,
    duration: 60,
    description: 'A deep conditioning wash, thermal blowout, and flat iron press that leaves hair silky, bouncy, and shiny.',
    image: '/src/assets/images/african_silk_press_1785327747183.jpg'
  },
  {
    id: 's-2',
    name: 'Knotless Box Braids',
    category: 'hair',
    price: 1400,
    duration: 180,
    description: 'Lightweight, tension-free braids starting directly from your natural hair for a seamless look. Lasts 6-8 weeks.',
    image: '/src/assets/images/knotless_braids_1784461356341.jpg'
  },
  {
    id: 's-3',
    name: 'Butterfly Locs',
    category: 'hair',
    price: 2800,
    duration: 150,
    description: 'Bohemian-textured faux locs styled with unique, bubbly distress patterns for a beautiful rustic look.',
    image: '/src/assets/images/butterfly_locs_1784461341414.jpg'
  },
  {
    id: 's-4',
    name: 'Fulani Tribal Braids & Afro',
    category: 'hair',
    price: 1700,
    duration: 120,
    description: 'Exquisite traditional braided patterns adorned with beads, shells, and rings, paired with a gorgeous afro volume.',
    image: '/src/assets/images/fulani_braids_afro_1784461381991.jpg'
  },
  {
    id: 's-5',
    name: 'French-Tip Acrylic Nails',
    category: 'nails',
    price: 800,
    duration: 60,
    description: 'Elegant pink French tips on professional acrylics, decorated with hand-painted red cherry blossom flowers with gold accents.',
    image: '/src/assets/images/pink_flower_nails_1784461367686.jpg'
  },
  {
    id: 's-6',
    name: 'Gel Polish & Manicure',
    category: 'nails',
    price: 400,
    duration: 30,
    description: 'Nail shaping, cuticle grooming, and premium gel polish cured under UV LED for a long-lasting shine.',
    image: 'https://images.unsplash.com/photo-1604654894610-df4906b197ae?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 's-7',
    name: 'Sculpted Acrylic Extensions',
    category: 'nails',
    price: 1000,
    duration: 90,
    description: 'Full sculpted acrylic set crafted precisely on form tips, customized to your desired length and nail shape.',
    image: 'https://images.unsplash.com/photo-1632345031435-8797b2d58045?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 's-8',
    name: 'Brightening Hydrafacial',
    category: 'skincare',
    price: 4500,
    duration: 60,
    description: 'Deep suction vacuum pore extraction, custom micro-exfoliation peel, and high-pressure antioxidant infusion.',
    image: '/src/assets/images/african_hydrafacial_glow_1785327761616.jpg'
  },
  {
    id: 's-9',
    name: 'Microblading Eyebrows',
    category: 'skincare',
    price: 6000,
    duration: 120,
    description: 'Precision semi-permanent hairstroke tattooing to sculpt fuller, beautifully defined natural eyebrow arches.',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 's-10',
    name: 'Soft Glam Makeup',
    category: 'makeup',
    price: 500,
    duration: 45,
    description: 'Seamless skin-match foundation, light eye detailing, elegant lashes, and setting spray for a perfect clean finish.',
    image: '/src/assets/images/african_soft_glam_1785327776930.jpg'
  },
  {
    id: 's-11',
    name: 'Luxury Mani-Pedi Offer Package',
    category: 'nails',
    price: 1300,
    duration: 90,
    description: 'Our supreme package: Full soothing foot pedicure, premium gel polish on toe nails, and a full, clean hand manicure.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 's-12',
    name: 'Soothing Swedish Massage',
    category: 'makeup',
    price: 2500,
    duration: 60,
    description: 'Unwind with a full-body relaxation massage using premium aromatherapy oils and muscle-melting strokes.',
    image: 'https://images.unsplash.com/photo-1605497746444-051d5330a3a4?auto=format&fit=crop&q=80&w=600'
  }
];

const defaultBlogs: BlogPost[] = [
  {
    id: 'b-1',
    title: '5 Secrets to Keeping Your Silk Press Silky in Humid Weather',
    excerpt: 'Is the heat threatening your silk press? Here are five expert recommendations from our top stylists to lock in that bounce.',
    content: `A luxury silk press feels incredible—it gives your hair unparalleled body, shine, and swing. But the moment you step outside into humid air, you might feel like your hard-earned straight hair is destined to frizz back up. 

At Mresh Salon, our stylists use advanced thermal guards and deep hydration procedures, but how you manage it at home is equally critical. Here are five simple rules:

1. **Protect It in the Shower:** A regular shower cap is not enough. The humidity in your bathroom can seep through. We recommend wrapping your hair in a silk scarf first, and then putting a high-quality terry-cloth lined shower cap on top.
2. **Pineapple Your Hair at Night:** Gather your hair loosely at the very top of your head (like a pineapple) and secure it with a soft satin scrunchie. Wrap your edges in a silk scarf and sleep on a satin pillowcase.
3. **Say No to Daily Flat Ironing:** It can be tempting to touch up crimps every morning, but this leads directly to permanent heat damage and dry ends. Trust the wrap! Wrapping your hair at night is the safest way to maintain straightness.
4. **Use anti-humidity serums sparingly:** Apply a pea-sized drop of lightweight silicone-based serum once every three days. Too much product will weigh the hair down, destroying its natural bounce.
5. **Workout Wisely:** Keep your hair wrapped tightly in an athletic, moisture-wicking headband during workouts. Do not take the headband off until your scalp is completely dry.

Follow these tips and enjoy 2-3 weeks of premium silk press bounce!`,
    category: 'Hair Care',
    author: 'Faith Mresh (Founder)',
    image: '/src/assets/images/african_silk_press_1785327747183.jpg',
    readTime: '3 min read',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'b-2',
    title: 'The Ultimate Guide: Acrylic vs Gel Overlay on Natural Nails',
    excerpt: 'Are you torn between acrylic extensions and a direct gel overlay? Let’s break down the durability, safety, and aesthetic differences.',
    content: `When you sit in our luxury manicure chairs, one of the most common questions is: "Should I get a gel overlay or acrylics?" 

The answer depends on your natural nails, your daily habits, and your aesthetic goals. Let’s break down the comparisons:

### 1. Sculpted Acrylic Extensions
* **Best for:** Adding dramatic length, reshaping short or bitten nails, and maximum durability.
* **The Process:** Acrylic is a mixture of liquid monomer and powder polymer that is sculpted onto forms to lengthen the nail.
* **Maintenance:** Requires a fill-in every 2 to 3 weeks as your natural nails grow.
* **Pros:** Extremely tough, can withstand physical labor, and provides a perfect thick canvas for 3D art.

### 2. Gel Overlay
* **Best for:** Strengthening your natural nails, flexible lightweight feel, and a thinner, more organic look.
* **The Process:** Multiple layers of premium structural gel are brushed directly over your natural length and cured under a UV/LED lamp.
* **Maintenance:** Soak-off and fresh application every 3 weeks.
* **Pros:** Highly flexible, looks identical to natural nails, has zero chemical smell during application, and causes less stress on the nail bed.

### Our Recommendation:
If your nails are brittle and you want to grow them out, go with a **BIAB (Builder in a Bottle) Gel Overlay**. If you love long, fierce, stiletto or coffin nails, **Sculpted Acrylics** are your best friend. Book an appointment today and let our nail experts design your perfect set!`,
    category: 'Nail Art',
    author: 'Joy Wambui (Nail Master)',
    image: '/src/assets/images/pink_flower_nails_1784461367686.jpg',
    readTime: '4 min read',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'b-3',
    title: 'Why Brightening Hydrafacials are Essential for Glow and Hydration',
    excerpt: 'Dry patches and dull skin? Understand how the 3-step vacuum hydration of a Hydrafacial resets your skin barrier.',
    content: `Your skin faces a lot of stressors: dust, pollution, sun damage, and leftover makeup build-up. Regular washing only cleanses the top surface. 

This is where the **Brightening Hydrafacial** comes in. Unlike traditional extractions that involve painful pinching and steam, the Hydrafacial uses a patented vortex-suction technology that cleanses, exfoliates, and hydrates simultaneously.

### The 3-Step Hydrafacial Magic:
1. **Cleanse + Peel:** Gentle resurfacing extracts dead skin cells and reveals a new layer of healthy skin, using a highly tolerable nutrient peel.
2. **Extract + Hydrate:** The painless vortex suction vacuum pulls out blackheads, sebum, and deep dirt from pores while simultaneously saturating the skin with intense moisturizers.
3. **Fuse + Protect:** Your fresh, clean skin is infused with premium antioxidants, peptides, and vitamin serums to maximize your glow.

### Who is it for?
Everyone! Whether you are dealing with oily skin, enlarged pores, dry patches, or fine lines, the Hydrafacial is completely customizable. It requires zero downtime, making it the perfect "red-carpet" prep treatment before a major wedding, photo shoot, or dinner event. 

We recommend booking a session once a month to build a perfect, radiant skin barrier!`,
    category: 'Skin Wellness',
    author: 'Dr. Anita Mwangi (Esthetician)',
    image: '/src/assets/images/african_hydrafacial_glow_1785327761616.jpg',
    readTime: '3 min read',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const defaultReviews: Review[] = [
  {
    id: 'r-1',
    userId: 'u-anon-1',
    clientName: 'Daniel Keya',
    rating: 5,
    text: 'Absolute best hair salon in Nairobi! Faith Mresh is a magician with hair. My silk press has never been this straight and bouncy, and the atmosphere is so calm and luxury.',
    serviceId: 's-1',
    approved: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'r-2',
    userId: 'u-anon-2',
    clientName: 'Mercy Wangari',
    rating: 5,
    text: 'I booked the sculpted acrylic set with Joy. She is incredibly detailed! The nails are perfectly thin yet so sturdy. Love the coffee and vibes as well.',
    serviceId: 's-5',
    approved: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'r-3',
    userId: 'u-anon-3',
    clientName: 'Sarah Kamau',
    rating: 4,
    text: 'The Brightening Hydrafacial is worth every shilling. My face was glowing for a whole week. Minor delay in starting my session, but the service was spectacular.',
    serviceId: 's-6',
    approved: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Ensure directories and database file exist
export function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      dbCache = JSON.parse(data);
      console.log('Database loaded successfully from disk.');
      if (!dbCache.gallery) {
        dbCache.gallery = [
          { id: 'g-1', title: 'Signature Butterfly Locs', category: 'Hair Styling', image: '/src/assets/images/butterfly_locs_1784461341414.jpg', createdAt: new Date().toISOString() },
          { id: 'g-2', title: 'Chic Knotless Box Braids', category: 'Hair Styling', image: '/src/assets/images/knotless_braids_1784461356341.jpg', createdAt: new Date().toISOString() },
          { id: 'g-3', title: 'Fulani Tribal Braids & Afro', category: 'Hair Styling', image: '/src/assets/images/fulani_braids_afro_1784461381991.jpg', createdAt: new Date().toISOString() },
          { id: 'g-4', title: 'French-Tip Floral Acrylics', category: 'Nail Artistry', image: '/src/assets/images/pink_flower_nails_1784461367686.jpg', createdAt: new Date().toISOString() },
          { id: 'g-5', title: 'Brightening Hydrafacial Session', category: 'Skin Wellness', image: '/src/assets/images/african_hydrafacial_glow_1785327761616.jpg', createdAt: new Date().toISOString() },
          { id: 'g-6', title: 'Signature Soft Glam Makeup', category: 'Premium Makeup', image: '/src/assets/images/african_soft_glam_1785327776930.jpg', createdAt: new Date().toISOString() }
        ];
        writeDb();
      }
      if (!dbCache.vouchers || dbCache.vouchers.length === 0) {
        dbCache.vouchers = [
          {
            id: 'v-1',
            code: 'MRESH500',
            type: 'fixed',
            value: 500,
            minSpend: 1000,
            usageLimit: 100,
            usedCount: 14,
            validUntil: '2026-12-31',
            status: 'active',
            description: 'KES 500 discount on deposit or total bill for appointments',
            createdAt: new Date().toISOString()
          },
          {
            id: 'v-2',
            code: 'GLAM20',
            type: 'percentage',
            value: 20,
            minSpend: 2000,
            usageLimit: 50,
            usedCount: 8,
            validUntil: '2026-12-31',
            status: 'active',
            description: '20% off all premium treatments and hair styling packages',
            createdAt: new Date().toISOString()
          },
          {
            id: 'v-3',
            code: 'VIPGUEST',
            type: 'fixed',
            value: 1000,
            minSpend: 3000,
            usageLimit: 25,
            usedCount: 3,
            validUntil: '2026-12-31',
            status: 'active',
            description: 'KES 1,000 instant credit for VIP bridal & hair glam bookings',
            createdAt: new Date().toISOString()
          }
        ];
        writeDb();
      }
    } catch (e) {
      console.error('Error loading database, resetting...', e);
      writeDb();
    }
  } else {
    // Seed database
    console.log('Database file not found. Seeding initial records...');
    const hashedAdminPassword = bcrypt.hashSync('admin', 10);
    const hashedClientPassword = bcrypt.hashSync('daniel', 10);

    dbCache.users = [
      {
        id: 'u-admin',
        name: 'Faith Mresh (Admin)',
        email: 'admin@mreshsalon.com',
        password: hashedAdminPassword,
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'u-client-demo',
        name: 'Daniel Keya',
        email: 'daniel@example.com',
        password: hashedClientPassword,
        role: 'client',
        createdAt: new Date().toISOString()
      }
    ];

    dbCache.services = defaultServices;
    dbCache.blogs = defaultBlogs;
    dbCache.reviews = defaultReviews;
    dbCache.bookings = [
      {
        id: 'b-demo-1',
        userId: 'u-client-demo',
        clientName: 'Daniel Keya',
        clientEmail: 'daniel@example.com',
        clientPhone: '0712345678',
        serviceId: 's-1',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days in future
        time: '10:00',
        status: 'confirmed',
        notes: 'Please use extra hydration treatment.',
        remindMethod: 'sms',
        remindStatus: 'pending',
        depositAmount: 500,
        paymentStatus: 'paid',
        transactionId: 'QGR593JKSA',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'b-demo-2',
        userId: 'u-client-demo',
        clientName: 'Daniel Keya',
        clientEmail: 'daniel@example.com',
        clientPhone: '0712345678',
        serviceId: 's-6',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days ago
        time: '14:30',
        status: 'completed',
        remindMethod: 'email',
        remindStatus: 'sent',
        depositAmount: 1000,
        paymentStatus: 'paid',
        transactionId: 'QFM123JDLA',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    dbCache.logs = [
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        action: 'SYSTEM_SEED',
        details: 'Salon default seed database initialized.'
      },
      {
        id: 'log-2',
        timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
        action: 'ADMIN_CREATE',
        details: 'Admin user created (admin@mreshsalon.com).'
      },
      {
        id: 'log-3',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        action: 'BOOKING_CREATE',
        details: 'Booking b-demo-1 created for Daniel Keya (s-1: Silk Press)',
        userId: 'u-client-demo',
        userEmail: 'daniel@example.com'
      }
    ];

    dbCache.payments = [
      {
        id: 'pay-1',
        checkoutRequestID: 'ws_CO_19072026003712345',
        merchantRequestID: '1234-5678-9012',
        amount: 500,
        phone: '254712345678',
        status: 'success',
        resultCode: 0,
        resultDesc: 'The service request processed successfully.',
        transactionDate: new Date().toISOString(),
        bookingId: 'b-demo-1'
      }
    ];

    dbCache.giftcards = [
      {
        id: 'gift-1',
        code: 'MRESH-GIFT-8942',
        buyerName: 'Daniel Keya',
        recipientEmail: 'friend@example.com',
        amount: 5000,
        balance: 5000,
        status: 'active',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    dbCache.chats = [
      {
        id: 'c-1',
        senderId: 'ai-bot',
        senderName: 'Mresh AI Stylist',
        text: 'Hello Daniel! Welcome to Mresh Salon. How can I assist you with your hair, nails, skincare or bridal styling today?',
        recipientId: 'u-client-demo',
        isFromAi: true,
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      {
        id: 'c-2',
        senderId: 'u-client-demo',
        senderName: 'Daniel Keya',
        text: 'Do you offer hair blowouts?',
        recipientId: 'ai-bot',
        isFromAi: false,
        createdAt: new Date(Date.now() - 9 * 60 * 1000).toISOString()
      },
      {
        id: 'c-3',
        senderId: 'ai-bot',
        senderName: 'Mresh AI Stylist',
        text: 'Yes we do! We offer our premium "Luxury Silk Press & Blowout" for KES 1,500. It includes a deep conditioning wash, thermal styling, and flat iron finish. Would you like me to guide you to the booking panel?',
        recipientId: 'u-client-demo',
        isFromAi: true,
        createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      }
    ];

    dbCache.gallery = [
      { id: 'g-1', title: 'Signature Butterfly Locs', category: 'Hair Styling', image: '/src/assets/images/butterfly_locs_1784461341414.jpg', createdAt: new Date().toISOString() },
      { id: 'g-2', title: 'Chic Knotless Box Braids', category: 'Hair Styling', image: '/src/assets/images/knotless_braids_1784461356341.jpg', createdAt: new Date().toISOString() },
      { id: 'g-3', title: 'Fulani Tribal Braids & Afro', category: 'Hair Styling', image: '/src/assets/images/fulani_braids_afro_1784461381991.jpg', createdAt: new Date().toISOString() },
      { id: 'g-4', title: 'French-Tip Floral Acrylics', category: 'Nail Artistry', image: '/src/assets/images/pink_flower_nails_1784461367686.jpg', createdAt: new Date().toISOString() },
      { id: 'g-5', title: 'Brightening Hydrafacial Session', category: 'Skin Wellness', image: '/src/assets/images/african_hydrafacial_glow_1785327761616.jpg', createdAt: new Date().toISOString() },
      { id: 'g-6', title: 'Signature Soft Glam Makeup', category: 'Premium Makeup', image: '/src/assets/images/african_soft_glam_1785327776930.jpg', createdAt: new Date().toISOString() }
    ];

    writeDb();
  }
}

function writeDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing to database on disk:', e);
  }
}

// Database Actions
export const db = {
  // Users
  getUsers: () => dbCache.users,
  addUser: (user: User) => {
    dbCache.users.push(user);
    writeDb();
    return user;
  },
  findUserByEmail: (email: string) => {
    return dbCache.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserById: (id: string) => {
    return dbCache.users.find(u => u.id === id);
  },

  // Services
  getServices: () => dbCache.services,
  addService: (service: Service) => {
    dbCache.services.push(service);
    writeDb();
    return service;
  },
  updateService: (id: string, updates: Partial<Service>) => {
    const idx = dbCache.services.findIndex(s => s.id === id);
    if (idx !== -1) {
      dbCache.services[idx] = { ...dbCache.services[idx], ...updates };
      writeDb();
      return dbCache.services[idx];
    }
    return null;
  },
  deleteService: (id: string) => {
    const initialLen = dbCache.services.length;
    dbCache.services = dbCache.services.filter(s => s.id !== id);
    if (dbCache.services.length !== initialLen) {
      writeDb();
      return true;
    }
    return false;
  },

  // Bookings
  getBookings: () => dbCache.bookings,
  getBookingById: (id: string) => dbCache.bookings.find(b => b.id === id),
  addBooking: (booking: Booking) => {
    dbCache.bookings.push(booking);
    writeDb();
    return booking;
  },
  updateBooking: (id: string, updates: Partial<Booking>) => {
    const idx = dbCache.bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      dbCache.bookings[idx] = { ...dbCache.bookings[idx], ...updates };
      writeDb();
      return dbCache.bookings[idx];
    }
    return null;
  },

  // Reviews
  getReviews: () => dbCache.reviews.filter(r => r.approved),
  getAllReviewsForAdmin: () => dbCache.reviews,
  addReview: (review: Review) => {
    dbCache.reviews.push(review);
    writeDb();
    return review;
  },
  approveReview: (id: string) => {
    const idx = dbCache.reviews.findIndex(r => r.id === id);
    if (idx !== -1) {
      dbCache.reviews[idx].approved = true;
      writeDb();
      return dbCache.reviews[idx];
    }
    return null;
  },

  // Blogs
  getBlogs: () => dbCache.blogs,
  addBlog: (blog: BlogPost) => {
    dbCache.blogs.push(blog);
    writeDb();
    return blog;
  },

  // Chats
  getChats: (userId: string) => {
    return dbCache.chats.filter(c => 
      c.senderId === userId || 
      c.recipientId === userId || 
      (userId === 'admin' && (c.recipientId === 'admin' || c.recipientId === 'owner' || c.senderId === 'admin' || c.senderId !== 'ai-bot'))
    );
  },
  getAllChats: () => dbCache.chats,
  addChatMessage: (msg: ChatMessage) => {
    dbCache.chats.push(msg);
    writeDb();
    return msg;
  },

  // User Logs / History
  getLogs: () => dbCache.logs,
  addLog: (action: string, details: string, userId?: string, userEmail?: string) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      userId,
      userEmail
    };
    dbCache.logs.unshift(newLog); // Newest first
    writeDb();
    return newLog;
  },

  // Payments (M-Pesa)
  getPayments: () => dbCache.payments,
  addPayment: (payment: MpesaTransaction) => {
    dbCache.payments.push(payment);
    writeDb();
    return payment;
  },
  getPaymentByCheckoutID: (checkoutID: string) => {
    return dbCache.payments.find(p => p.checkoutRequestID === checkoutID);
  },
  updatePayment: (checkoutID: string, updates: Partial<MpesaTransaction>) => {
    const idx = dbCache.payments.findIndex(p => p.checkoutRequestID === checkoutID);
    if (idx !== -1) {
      dbCache.payments[idx] = { ...dbCache.payments[idx], ...updates };
      writeDb();
      return dbCache.payments[idx];
    }
    return null;
  },

  // Gift Cards
  getGiftCards: () => dbCache.giftcards,
  addGiftCard: (card: GiftCard) => {
    dbCache.giftcards.push(card);
    writeDb();
    return card;
  },
  getGiftCardByCode: (code: string) => {
    return dbCache.giftcards.find(g => g.code.toUpperCase() === code.toUpperCase());
  },
  updateGiftCard: (code: string, updates: Partial<GiftCard>) => {
    const idx = dbCache.giftcards.findIndex(g => g.code.toUpperCase() === code.toUpperCase());
    if (idx !== -1) {
      dbCache.giftcards[idx] = { ...dbCache.giftcards[idx], ...updates };
      writeDb();
      return dbCache.giftcards[idx];
    }
    return null;
  },

  // Gallery
  getGallery: () => dbCache.gallery || [],
  addGalleryItem: (item: GalleryItem) => {
    if (!dbCache.gallery) dbCache.gallery = [];
    dbCache.gallery.unshift(item); // newest first
    writeDb();
    return item;
  },
  deleteGalleryItem: (id: string) => {
    if (!dbCache.gallery) return false;
    const initialLen = dbCache.gallery.length;
    dbCache.gallery = dbCache.gallery.filter(g => g.id !== id);
    if (dbCache.gallery.length !== initialLen) {
      writeDb();
      return true;
    }
    return false;
  },

  // Vouchers & Discounts
  getVouchers: () => dbCache.vouchers || [],
  getVoucherByCode: (code: string) => {
    if (!dbCache.vouchers) return null;
    return dbCache.vouchers.find(v => v.code.toUpperCase() === code.trim().toUpperCase());
  },
  addVoucher: (voucher: Voucher) => {
    if (!dbCache.vouchers) dbCache.vouchers = [];
    dbCache.vouchers.unshift(voucher);
    writeDb();
    return voucher;
  },
  updateVoucher: (id: string, updates: Partial<Voucher>) => {
    if (!dbCache.vouchers) return null;
    const idx = dbCache.vouchers.findIndex(v => v.id === id);
    if (idx !== -1) {
      dbCache.vouchers[idx] = { ...dbCache.vouchers[idx], ...updates };
      writeDb();
      return dbCache.vouchers[idx];
    }
    return null;
  },
  deleteVoucher: (id: string) => {
    if (!dbCache.vouchers) return false;
    const initialLen = dbCache.vouchers.length;
    dbCache.vouchers = dbCache.vouchers.filter(v => v.id !== id);
    if (dbCache.vouchers.length !== initialLen) {
      writeDb();
      return true;
    }
    return false;
  },
  incrementVoucherUsage: (code: string) => {
    if (!dbCache.vouchers) return null;
    const idx = dbCache.vouchers.findIndex(v => v.code.toUpperCase() === code.trim().toUpperCase());
    if (idx !== -1) {
      const v = dbCache.vouchers[idx];
      v.usedCount = (v.usedCount || 0) + 1;
      if (v.usageLimit && v.usedCount >= v.usageLimit) {
        v.status = 'expired';
      }
      writeDb();
      return v;
    }
    return null;
  }
};
