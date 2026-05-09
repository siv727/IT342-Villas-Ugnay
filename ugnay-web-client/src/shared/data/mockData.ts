export interface Manufacturer {
  id: number;
  businessName: string;
  category: string;
  province: string;
  city: string;
  description: string;
  saved: boolean;
}

export interface Product {
  id: number;
  manufacturerId: number;
  name: string;
  category?: string;
  price: number;
  unit: string;
  stock: number;
  active: boolean;
  description: string;
  image: string;
}

export interface VendorRequest {
  id: number;
  productId: number;
  manufacturerId: number;
  productName: string;
  manufacturerName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  sampleFee: number;
  shippingFee: number;
  total: number;
  status: string;
  createdAt: string;
  notes: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentProof?: string;
  vendorName?: string;
}

export interface Shipment {
  id: number;
  requestId: number;
  vendorName: string;
  productName: string;
  courier: string;
  trackingNumber: string;
  status: string;
  estimatedDelivery: string;
  proofOfDelivery: string | null;
}

// ==================== MANUFACTURERS ====================
export const mockManufacturers: Manufacturer[] = [
  { id: 101, businessName: 'Visayan Food Corp.', category: 'Food Products', province: 'Cebu', city: 'Cebu City', description: 'Premium food manufacturer specializing in dried goods and condiments. Serving businesses across the Philippines since 2005.', saved: true },
  { id: 102, businessName: 'Manila Packing Co.', category: 'Manufacturing Supplies', province: 'Manila', city: 'Manila', description: 'Industrial packaging solutions — corrugated boxes, bubble wrap, and custom packaging for B2B clients.', saved: false },
  { id: 103, businessName: 'Davao Fresh Produce', category: 'Food Products', province: 'Davao', city: 'Davao City', description: 'Farm-to-business fresh fruits and vegetables. Direct sourcing from Mindanao farms.', saved: true },
  { id: 104, businessName: 'TechParts PH', category: 'Electronics', province: 'Manila', city: 'Makati', description: 'Electronic components supplier for manufacturers and repair shops. Capacitors, resistors, PCBs, and more.', saved: false },
  { id: 105, businessName: 'Cebu Retail Goods', category: 'Retail Goods', province: 'Cebu', city: 'Mandaue City', description: 'Wholesale retail goods — household items, personal care, and general merchandise.', saved: true },
  { id: 106, businessName: 'Quezon Textiles', category: 'Manufacturing Supplies', province: 'Manila', city: 'Quezon City', description: 'Premium textiles and fabrics for garment manufacturers and upholstery businesses.', saved: false },
  { id: 107, businessName: 'Southern Snacks Inc.', category: 'Food Products', province: 'Davao', city: 'Tagum', description: 'Snack food manufacturer — chips, crackers, and cookies for retail distribution.', saved: true },
  { id: 108, businessName: 'Lapu-Lapu Hardware Supply', category: 'Manufacturing Supplies', province: 'Cebu', city: 'Lapu-Lapu City', description: 'Industrial hardware and tools supplier for construction and manufacturing businesses.', saved: false },
  { id: 109, businessName: 'Green Valley Organics', category: 'Food Products', province: 'Cebu', city: 'Cebu City', description: 'Certified organic food products — oils, vinegars, and health supplements for health-conscious retailers.', saved: true },
  { id: 110, businessName: 'DigiCom Electronics', category: 'Electronics', province: 'Manila', city: 'Quezon City', description: 'Consumer electronics and accessories for retail chains and online sellers.', saved: false },
];

// ==================== PRODUCTS ====================
export const mockProducts: Product[] = [
  { id: 201, manufacturerId: 101, name: 'Dried Mango Strips', price: 150, unit: 'kg', stock: 500, active: true, description: 'Premium quality dried mango strips made from Cebu mangoes. Naturally sweet with no added sugar. Perfect for retail packaging or as food service ingredients.', image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400' },
  { id: 202, manufacturerId: 101, name: 'Coconut Vinegar', price: 85, unit: 'bottle', stock: 300, active: true, description: 'Traditional Filipino coconut vinegar, fermented for 6 months. Available in 350ml and 750ml bottles.', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400' },
  { id: 203, manufacturerId: 101, name: 'Fish Sauce (Patis)', price: 65, unit: 'bottle', stock: 0, active: true, description: 'Authentic Filipino fish sauce made from anchovies. Rich umami flavor for cooking and dipping.', image: 'https://images.unsplash.com/photo-1534483509719-8b0110e4e498?w=400' },
  { id: 204, manufacturerId: 101, name: 'Calamansi Concentrate', price: 120, unit: 'bottle', stock: 200, active: true, description: 'Pure calamansi juice concentrate, no preservatives. Makes 5 liters of juice per bottle.', image: 'https://images.unsplash.com/photo-1582106245687-cbb466a9930d?w=400' },
  { id: 205, manufacturerId: 101, name: 'Banana Chips', price: 95, unit: 'kg', stock: 150, active: true, description: 'Crispy banana chips with light caramel coating. Popular snack item for retail stores.', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400' },
  { id: 206, manufacturerId: 101, name: 'Turmeric Powder', price: 200, unit: 'kg', stock: 80, active: false, description: 'Organic turmeric powder sourced from local farms. Rich golden color and earthy flavor.', image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400' },
  { id: 207, manufacturerId: 102, name: 'Corrugated Box (Medium)', price: 25, unit: 'piece', stock: 5000, active: true, description: 'Standard corrugated shipping box. 12x10x8 inches. Durable for up to 15kg products.', image: 'https://images.unsplash.com/photo-1607166452427-7e4477bfbe13?w=400' },
  { id: 208, manufacturerId: 102, name: 'Bubble Wrap Roll', price: 350, unit: 'roll', stock: 200, active: true, description: 'Standard bubble wrap, 20 inches wide, 100 meters per roll. Ideal for fragile items.', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400' },
  { id: 209, manufacturerId: 103, name: 'Fresh Durian Pack', price: 450, unit: 'kg', stock: 50, active: true, description: 'Freshly harvested Davao durian, vacuum-packed for extended freshness.', image: 'https://images.unsplash.com/photo-1558818477-b4860e5bb7c3?w=400' },
  { id: 210, manufacturerId: 104, name: 'Capacitor Set 100pcs', price: 180, unit: 'set', stock: 300, active: true, description: 'Assorted ceramic capacitors, 100 pieces per set. Various capacitances from 1pF to 100µF.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400' },
  { id: 211, manufacturerId: 105, name: 'Bathroom Soap Pack', price: 240, unit: 'pack', stock: 400, active: true, description: '12-piece bathroom soap pack, assorted scents. Budget-friendly for retail stores.', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400' },
  { id: 212, manufacturerId: 107, name: 'Cassava Chips', price: 110, unit: 'kg', stock: 250, active: true, description: 'Crispy cassava chips with sea salt seasoning. A popular Mindanao snack.', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400' },
];

// ==================== SAMPLE REQUESTS ====================
export const mockVendorRequests: VendorRequest[] = [
  { id: 1, productId: 201, manufacturerId: 101, productName: 'Dried Mango Strips', manufacturerName: 'Visayan Food Corp.', quantity: 10, unit: 'kg', unitPrice: 150, sampleFee: 1500, shippingFee: 100, total: 1600, status: 'Completed', createdAt: '2026-02-15', notes: 'Please ensure vacuum-sealed packaging.', paymentMethod: 'gcash', paymentStatus: 'Paid', paymentProof: 'https://placehold.co/400x300/0070E0/FFFFFF?text=GCash+Receipt' },
  { id: 2, productId: 202, manufacturerId: 101, productName: 'Coconut Vinegar', manufacturerName: 'Visayan Food Corp.', quantity: 20, unit: 'bottle', unitPrice: 85, sampleFee: 1700, shippingFee: 100, total: 1800, status: 'In Transit', createdAt: '2026-02-20', notes: '', paymentMethod: 'bank', paymentStatus: 'Paid', paymentProof: 'https://placehold.co/400x300/1a5276/FFFFFF?text=Bank+Transfer+Receipt' },
  { id: 3, productId: 204, manufacturerId: 101, productName: 'Calamansi Concentrate', manufacturerName: 'Visayan Food Corp.', quantity: 5, unit: 'bottle', unitPrice: 120, sampleFee: 600, shippingFee: 100, total: 700, status: 'Approved', createdAt: '2026-02-24', notes: 'Need samples for taste testing.', paymentMethod: 'cod', paymentStatus: 'Unpaid' },
  { id: 4, productId: 209, manufacturerId: 103, productName: 'Fresh Durian Pack', manufacturerName: 'Davao Fresh Produce', quantity: 3, unit: 'kg', unitPrice: 450, sampleFee: 1350, shippingFee: 500, total: 1850, status: 'Pending', createdAt: '2026-02-27', notes: 'Freshest available please.', paymentMethod: 'cod', paymentStatus: 'Pending' },
  { id: 5, productId: 207, manufacturerId: 102, productName: 'Corrugated Box (Medium)', manufacturerName: 'Manila Packing Co.', quantity: 100, unit: 'piece', unitPrice: 25, sampleFee: 2500, shippingFee: 250, total: 2750, status: 'Rejected', createdAt: '2026-02-22', notes: 'Bulk order for holiday season.', paymentMethod: 'bank', paymentStatus: 'Pending' },
  { id: 6, productId: 211, manufacturerId: 105, productName: 'Bathroom Soap Pack', manufacturerName: 'Cebu Retail Goods', quantity: 15, unit: 'pack', unitPrice: 240, sampleFee: 3600, shippingFee: 250, total: 3850, status: 'Pending', createdAt: '2026-02-26', notes: '', paymentMethod: 'gcash', paymentStatus: 'Pending' },
  { id: 7, productId: 205, manufacturerId: 101, productName: 'Banana Chips', manufacturerName: 'Visayan Food Corp.', quantity: 8, unit: 'kg', unitPrice: 95, sampleFee: 760, shippingFee: 100, total: 860, status: 'Completed', createdAt: '2026-02-10', notes: '', paymentMethod: 'gcash', paymentStatus: 'Paid', paymentProof: 'https://placehold.co/400x300/0070E0/FFFFFF?text=GCash+Receipt' },
  { id: 8, productId: 210, manufacturerId: 104, productName: 'Capacitor Set 100pcs', manufacturerName: 'TechParts PH', quantity: 5, unit: 'set', unitPrice: 180, sampleFee: 900, shippingFee: 500, total: 1400, status: 'Approved', createdAt: '2026-02-25', notes: 'For testing purposes.', paymentMethod: 'bank', paymentStatus: 'Paid', paymentProof: 'https://placehold.co/400x300/1a5276/FFFFFF?text=Bank+Transfer+Receipt' },
  { id: 9, productId: 212, manufacturerId: 107, productName: 'Cassava Chips', manufacturerName: 'Southern Snacks Inc.', quantity: 12, unit: 'kg', unitPrice: 110, sampleFee: 1320, shippingFee: 500, total: 1820, status: 'In Transit', createdAt: '2026-02-18', notes: 'Urgent order.', paymentMethod: 'cod', paymentStatus: 'Paid', paymentProof: 'https://placehold.co/400x300/6b7280/FFFFFF?text=COD+Payment+Confirmed' },
  { id: 10, productId: 208, manufacturerId: 102, productName: 'Bubble Wrap Roll', manufacturerName: 'Manila Packing Co.', quantity: 6, unit: 'roll', unitPrice: 350, sampleFee: 2100, shippingFee: 250, total: 2350, status: 'Pending', createdAt: '2026-02-28', notes: '', paymentMethod: 'bank', paymentStatus: 'Pending' },
  { id: 11, productId: 201, manufacturerId: 101, productName: 'Dried Mango Strips', manufacturerName: 'Visayan Food Corp.', quantity: 25, unit: 'kg', unitPrice: 150, sampleFee: 3750, shippingFee: 100, total: 3850, status: 'Completed', createdAt: '2026-01-15', notes: '', paymentMethod: 'gcash', paymentStatus: 'Paid', paymentProof: 'https://placehold.co/400x300/0070E0/FFFFFF?text=GCash+Receipt' },
  { id: 12, productId: 204, manufacturerId: 101, productName: 'Calamansi Concentrate', manufacturerName: 'Visayan Food Corp.', quantity: 10, unit: 'bottle', unitPrice: 120, sampleFee: 1200, shippingFee: 100, total: 1300, status: 'Completed', createdAt: '2026-01-20', notes: '', paymentMethod: 'bank', paymentStatus: 'Paid', paymentProof: 'https://placehold.co/400x300/1a5276/FFFFFF?text=Bank+Transfer+Receipt' },
];

export const mockManufacturerRequests: VendorRequest[] = mockVendorRequests
  .filter(r => r.manufacturerId === 101)
  .map(r => ({ ...r, vendorName: 'Metro Retail Solutions' }));

// ==================== SHIPMENTS ====================
export const mockShipments: Shipment[] = [
  { id: 1, requestId: 1, vendorName: 'Metro Retail Solutions', productName: 'Dried Mango Strips', courier: 'J&T Express', trackingNumber: 'JT-7723891', status: 'Delivered', estimatedDelivery: '2026-02-18', proofOfDelivery: 'https://placehold.co/400x300/16a34a/FFFFFF?text=Delivery+Photo' },
  { id: 2, requestId: 2, vendorName: 'Metro Retail Solutions', productName: 'Coconut Vinegar', courier: 'LBC Express', trackingNumber: 'LBC-9912345', status: 'In Transit', estimatedDelivery: '2026-02-25', proofOfDelivery: null },
  { id: 3, requestId: 7, vendorName: 'Metro Retail Solutions', productName: 'Banana Chips', courier: 'J&T Express', trackingNumber: 'JT-6654321', status: 'Delivered', estimatedDelivery: '2026-02-13', proofOfDelivery: 'https://placehold.co/400x300/16a34a/FFFFFF?text=Delivery+Photo' },
  { id: 4, requestId: 11, vendorName: 'Metro Retail Solutions', productName: 'Dried Mango Strips', courier: 'J&T Express', trackingNumber: 'JT-1234567', status: 'Delivered', estimatedDelivery: '2026-01-18', proofOfDelivery: 'https://placehold.co/400x300/16a34a/FFFFFF?text=Delivery+Photo' },
  { id: 5, requestId: 12, vendorName: 'Metro Retail Solutions', productName: 'Calamansi Concentrate', courier: 'LBC Express', trackingNumber: 'LBC-9988776', status: 'Delivered', estimatedDelivery: '2026-01-23', proofOfDelivery: 'https://placehold.co/400x300/16a34a/FFFFFF?text=Delivery+Photo' },
];

// ==================== PSGC LOCATION DATA ====================
export const psgcData: Record<string, string[]> = {
  Cebu: ['Cebu City', 'Mandaue City', 'Lapu-Lapu City'],
  Manila: ['Manila', 'Makati', 'Quezon City'],
  Davao: ['Davao City', 'Tagum'],
};

// ==================== CATEGORIES ====================
export const categories: string[] = ['All', 'Food Products', 'Retail Goods', 'Manufacturing Supplies', 'Electronics'];
