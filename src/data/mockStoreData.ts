import { Product } from '../types';

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  verified: boolean;
  date: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  count: number;
  icon: string;
  image: string;
}

// Complete Mock Products Database
export const mockAllProducts: Product[] = [
  // Smartphones
  {
    id: 'm-phone-1',
    name: 'iPhone 15 Pro Max',
    description: 'Titanium design, A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.',
    price: 139900,
    compare_at_price: 159900,
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80',
    stock: 8,
    category: 'Smartphones'
  },
  {
    id: 'm-phone-2',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity.',
    price: 129900,
    compare_at_price: 144900,
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80',
    stock: 12,
    category: 'Smartphones'
  },
  {
    id: 'm-phone-3',
    name: 'OnePlus 12 5G',
    description: 'Flowy Emerald design, Snapdragon 8 Gen 3, and next-gen Trinity Engine for pure performance.',
    price: 64999,
    compare_at_price: 69999,
    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80',
    stock: 5,
    category: 'Smartphones'
  },

  // Audio
  {
    id: 'm-audio-1',
    name: 'Sony WH-1000XM5',
    description: 'Industry leading noise cancellation, exceptional sound quality, and crystal clear hands-free calling.',
    price: 29990,
    compare_at_price: 34990,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    stock: 15,
    category: 'Audio'
  },
  {
    id: 'm-audio-2',
    name: 'Apple AirPods Pro (2nd Gen)',
    description: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio.',
    price: 24900,
    compare_at_price: 26900,
    image_url: 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=500&auto=format&fit=crop&q=80',
    stock: 20,
    category: 'Audio'
  },
  {
    id: 'm-audio-3',
    name: 'JBL Charge 5 Speaker',
    description: 'Delivers bold JBL Original Pro Sound, with its optimized long excursion driver, separate tweeter and dual pumping bass radiators.',
    price: 14999,
    compare_at_price: 18999,
    image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=80',
    stock: 9,
    category: 'Audio'
  },

  // Laptops
  {
    id: 'm-laptop-1',
    name: 'MacBook Pro 14" M3',
    description: 'The most advanced chips ever built for a personal computer. Gorgeous Liquid Retina XDR display and up to 22 hours of battery life.',
    price: 169900,
    compare_at_price: 189900,
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80',
    stock: 4,
    category: 'Laptops'
  },
  {
    id: 'm-laptop-2',
    name: 'Dell XPS 13 Plus',
    description: 'Designed with high-quality materials and simplified interiors to deliver premium computing experiences.',
    price: 145900,
    compare_at_price: 169900,
    image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=80',
    stock: 3,
    category: 'Laptops'
  },

  // Gaming
  {
    id: 'm-gaming-1',
    name: 'PlayStation 5 Slim',
    description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers and 3D Audio.',
    price: 44990,
    compare_at_price: 54990,
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=80',
    stock: 10,
    category: 'Gaming'
  },
  {
    id: 'm-gaming-2',
    name: 'Razer Basilisk V3 Pro Mouse',
    description: 'The most advanced wireless gaming mouse yet, customized with 13 programmable buttons and full-spectrum Razer Chroma RGB lighting.',
    price: 14999,
    compare_at_price: 17999,
    image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80',
    stock: 14,
    category: 'Gaming'
  },

  // Smart Watches
  {
    id: 'm-watch-1',
    name: 'Apple Watch Ultra 2',
    description: 'The ultimate sports and adventure watch is back, with a bright Always-on Retina display and advanced tracking metrics.',
    price: 89900,
    compare_at_price: 94900,
    image_url: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500&auto=format&fit=crop&q=80',
    stock: 6,
    category: 'Smart Watches'
  },
  {
    id: 'm-watch-2',
    name: 'Galaxy Watch 6 Classic',
    description: 'Keep your fitness on track with an improved rotating bezel, personalized heart rate zones, and elegant stainless steel design.',
    price: 36999,
    compare_at_price: 42999,
    image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=80',
    stock: 11,
    category: 'Smart Watches'
  },

  // Cameras
  {
    id: 'm-camera-1',
    name: 'Fujifilm X-T5 Mirrorless',
    description: 'The perfect match for photographers who want portable size, lightweight body, and retro design alongside state-of-the-art tech.',
    price: 169999,
    compare_at_price: 189999,
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80',
    stock: 2,
    category: 'Cameras'
  },
  {
    id: 'm-camera-2',
    name: 'DJI Osmo Pocket 3',
    description: 'Pocket-sized gimbal camera with 1-inch CMOS sensor, 4K/120fps recording, and 3-axis mechanical stabilization.',
    price: 44900,
    compare_at_price: 49900,
    image_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=500&auto=format&fit=crop&q=80',
    stock: 7,
    category: 'Cameras'
  },

  // Accessories
  {
    id: 'm-acc-1',
    name: 'Keychron K2 Wireless Keyboard',
    description: '75% layout compact mechanical keyboard with hot-swappable switches, RGB backlight, and Mac/Windows compatibility.',
    price: 7999,
    compare_at_price: 9999,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
    stock: 22,
    category: 'Accessories'
  },
  {
    id: 'm-acc-2',
    name: 'Anker Prime 20000mAh Power Bank',
    description: 'Ultra-high-capacity power bank with smart digital display and 200W total output charging.',
    price: 12999,
    compare_at_price: 14999,
    image_url: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=500&auto=format&fit=crop&q=80',
    stock: 19,
    category: 'Accessories'
  },

  // Home Appliances
  {
    id: 'm-app-1',
    name: 'Dyson V15 Cordless Vacuum',
    description: 'The most powerful, intelligent cordless vacuum. Laser reveals microscopic dust, count and measure dust particles.',
    price: 65900,
    compare_at_price: 72900,
    image_url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&auto=format&fit=crop&q=80',
    stock: 4,
    category: 'Home Appliances'
  },
  {
    id: 'm-app-2',
    name: 'Marshall Acton III Speaker',
    description: 'Compact home speaker with room-filling Marshall signature sound, re-engineered for an even more immersive experience.',
    price: 24999,
    compare_at_price: 29999,
    image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=80',
    stock: 8,
    category: 'Home Appliances'
  }
];

// Flash Sale Dedicated Items
export const flashSaleProducts: Product[] = [
  {
    id: 'fs-1',
    name: 'Sony WH-1000XM5 (Silver)',
    description: 'Limited edition Premium Over-ear noise cancelling headphones.',
    price: 23990,
    compare_at_price: 34990,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    stock: 4,
    category: 'Audio'
  },
  {
    id: 'fs-2',
    name: 'OnePlus 12 (16GB RAM)',
    description: 'Flagship Emerald Green model at special flash pricing.',
    price: 58999,
    compare_at_price: 69999,
    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80',
    stock: 3,
    category: 'Smartphones'
  },
  {
    id: 'fs-3',
    name: 'Galaxy Watch 6 Classic 47mm',
    description: 'Smartwatch with LTE and physical rotating bezel.',
    price: 29999,
    compare_at_price: 42999,
    image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=80',
    stock: 5,
    category: 'Smart Watches'
  },
  {
    id: 'fs-4',
    name: 'DJI Osmo Pocket 3 Creator Combo',
    description: 'Pocket Gimbal with extra mic, battery handle and wide lens.',
    price: 39900,
    compare_at_price: 49900,
    image_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=500&auto=format&fit=crop&q=80',
    stock: 2,
    category: 'Cameras'
  },
  {
    id: 'fs-5',
    name: 'Keychron K2 Hot-Swappable RGB',
    description: 'Aluminum frame mechanical keyboard with brown switches.',
    price: 6999,
    compare_at_price: 9999,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
    stock: 6,
    category: 'Accessories'
  }
];

// Today's Deals (4 special items for right side)
export const todaysDeals = [
  {
    id: 'td-1',
    title: 'Wireless Headphones',
    badge: 'Save 25%',
    price: '₹14,999',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=250&auto=format&fit=crop&q=80',
    category: 'Audio'
  },
  {
    id: 'td-2',
    title: 'Bluetooth Speakers',
    badge: 'Hot Deal',
    price: '₹4,999',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=250&auto=format&fit=crop&q=80',
    category: 'Audio'
  },
  {
    id: 'td-3',
    title: 'Gaming Mouse',
    badge: 'Best Seller',
    price: '₹2,499',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=250&auto=format&fit=crop&q=80',
    category: 'Gaming'
  },
  {
    id: 'td-4',
    title: 'Smartwatches',
    badge: 'Flat 30% Off',
    price: '₹12,999',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=250&auto=format&fit=crop&q=80',
    category: 'Smart Watches'
  }
];

// Brands List
export const popularBrands = [
  { name: 'Apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=120&auto=format&fit=crop&q=80' },
  { name: 'Samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=120&auto=format&fit=crop&q=80' },
  { name: 'Sony', logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80' },
  { name: 'JBL', logo: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=120&auto=format&fit=crop&q=80' },
  { name: 'Logitech', logo: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=120&auto=format&fit=crop&q=80' },
  { name: 'Dell', logo: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=120&auto=format&fit=crop&q=80' },
  { name: 'Lenovo', logo: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=120&auto=format&fit=crop&q=80' },
  { name: 'boAt', logo: 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=120&auto=format&fit=crop&q=80' }
];

// Feature Cards List
export const featuresList = [
  {
    icon: '🚚',
    title: 'Free Shipping',
    desc: 'On all orders with premium dispatch handling and fast tracked delivery.'
  },
  {
    icon: '🔒',
    title: 'Secure Payment',
    desc: 'Fully encrypted SSL gateways including Razorpay and Cash on Delivery.'
  },
  {
    icon: '↩',
    title: 'Easy Returns',
    desc: 'No questions asked 14-day replacement and fast automated refunds.'
  },
  {
    icon: '🛡',
    title: 'Warranty',
    desc: '1-year complete protection warranty on all premium electronic gadgets.'
  },
  {
    icon: '⚡',
    title: 'Fast Delivery',
    desc: 'Dispatched within 24 hours with express delivery to major metro locations.'
  },
  {
    icon: '💬',
    title: '24/7 Support',
    desc: 'Direct hotline access to support managers and live assistance.'
  }
];

// Customer Reviews List
export const customerReviews: Testimonial[] = [
  {
    id: 'rev-1',
    name: 'Aishwarya Roy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Sovereign transformed into OGhaitong and the service remains unmatched! The delivery was lightning fast, and my iPhone 15 Pro Max arrived in pristine premium packaging. Pure class.',
    verified: true,
    date: 'Yesterday'
  },
  {
    id: 'rev-2',
    name: 'Rajesh Kumar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Immensely impressed with the Bose and Sony collections. Ordered the WH-1000XM5 from OGhaitong and got it within 24 hours. Authentic product, proper invoice, and super simple payment process.',
    verified: true,
    date: '3 days ago'
  },
  {
    id: 'rev-3',
    name: 'Pooja Sharma',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'The glassmorphic design of the store is breathtaking and shopping here is extremely fluid. I highly recommend buying your premium gaming accessories from OGhaitong!',
    verified: true,
    date: '1 week ago'
  },
  {
    id: 'rev-4',
    name: 'Vikram Malhotra',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Exceptional customer service. Had a query regarding the MacBook M3 configuration and they cleared it within minutes on live chat. OGhaitong is my absolute favorite store now!',
    verified: true,
    date: '2 weeks ago'
  }
];

// Category Icons list
export const categoryDataList: CategoryItem[] = [
  { id: 'cat-1', name: 'Smartphones', count: 48, icon: '📱', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80' },
  { id: 'cat-2', name: 'Audio', count: 72, icon: '🎧', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80' },
  { id: 'cat-3', name: 'Laptops', count: 35, icon: '💻', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80' },
  { id: 'cat-4', name: 'Gaming', count: 29, icon: '🎮', image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&auto=format&fit=crop&q=80' },
  { id: 'cat-5', name: 'Smart Watches', count: 42, icon: '⌚', image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=300&auto=format&fit=crop&q=80' },
  { id: 'cat-6', name: 'Cameras', count: 18, icon: '📷', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&auto=format&fit=crop&q=80' },
  { id: 'cat-7', name: 'Accessories', count: 94, icon: '🔌', image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=300&auto=format&fit=crop&q=80' },
  { id: 'cat-8', name: 'Home Appliances', count: 21, icon: '🏠', image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=300&auto=format&fit=crop&q=80' }
];
