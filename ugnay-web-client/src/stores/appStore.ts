import { create } from 'zustand';
import { mockManufacturers, mockProducts, mockVendorRequests, mockManufacturerRequests, mockShipments } from '../data/mockData';
import type { Manufacturer, Product, VendorRequest, Shipment } from '../data/mockData';

interface AppState {
  manufacturers: Manufacturer[];
  products: Product[];
  vendorRequests: VendorRequest[];
  manufacturerRequests: VendorRequest[];
  shipments: Shipment[];

  toggleSaveManufacturer: (id: number) => void;
  addProduct: (product: Omit<Product, 'id' | 'active'>) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  toggleProductActive: (id: number) => void;
  addRequest: (request: Partial<VendorRequest> & { vendorName?: string }) => void;
  updateRequestStatus: (id: number, status: string) => void;
  approveRequest: (id: number) => void;
  rejectRequest: (id: number) => void;
  createShipment: (params: { requestId: number; vendorName?: string; productName?: string }) => void;
  updateShipmentStatus: (id: number, status: string) => void;
  uploadProofOfDelivery: (id: number, proof: string) => void;
  markDelivered: (id: number) => void;
}

const useAppStore = create<AppState>((set) => ({
  manufacturers: [...mockManufacturers],
  products: [...mockProducts],
  vendorRequests: [...mockVendorRequests],
  manufacturerRequests: [...mockManufacturerRequests],
  shipments: [...mockShipments],

  toggleSaveManufacturer: (id) => set((state) => ({
    manufacturers: state.manufacturers.map(m => m.id === id ? { ...m, saved: !m.saved } : m),
  })),

  addProduct: (product) => set((state) => ({
    products: [...state.products, { ...product, id: 200 + state.products.length + 1, active: true }],
  })),

  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updates } : p),
  })),

  toggleProductActive: (id) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, active: !p.active } : p),
  })),

  addRequest: (request) => {
    const newReq: VendorRequest = {
      id: Date.now(),
      productId: request.productId ?? 0,
      manufacturerId: request.manufacturerId ?? 0,
      productName: request.productName ?? '',
      manufacturerName: request.manufacturerName ?? '',
      quantity: request.quantity ?? 0,
      unit: request.unit ?? '',
      unitPrice: request.unitPrice ?? 0,
      sampleFee: request.sampleFee ?? 0,
      shippingFee: request.shippingFee ?? 0,
      total: request.total ?? 0,
      status: 'Pending',
      createdAt: new Date().toISOString().slice(0, 10),
      notes: request.notes ?? '',
      paymentMethod: request.paymentMethod ?? '',
      paymentStatus: 'Pending',
    };
    set((state) => ({
      vendorRequests: [newReq, ...state.vendorRequests],
      manufacturerRequests: newReq.manufacturerId === 101
        ? [{ ...newReq, vendorName: request.vendorName || 'Metro Retail Solutions' } as VendorRequest, ...state.manufacturerRequests]
        : state.manufacturerRequests,
    }));
  },

  updateRequestStatus: (id, status) => set((state) => ({
    vendorRequests: state.vendorRequests.map(r => r.id === id ? { ...r, status } : r),
    manufacturerRequests: state.manufacturerRequests.map(r => r.id === id ? { ...r, status } : r),
  })),

  approveRequest: (id) => set((state) => ({
    vendorRequests: state.vendorRequests.map(r => r.id === id ? { ...r, status: 'Approved' } : r),
    manufacturerRequests: state.manufacturerRequests.map(r => r.id === id ? { ...r, status: 'Approved' } : r),
  })),

  rejectRequest: (id) => set((state) => ({
    vendorRequests: state.vendorRequests.map(r => r.id === id ? { ...r, status: 'Rejected' } : r),
    manufacturerRequests: state.manufacturerRequests.map(r => r.id === id ? { ...r, status: 'Rejected' } : r),
  })),

  createShipment: ({ requestId, vendorName, productName }) => set((state) => {
    const newShipment: Shipment = {
      id: state.shipments.length + 1,
      requestId,
      vendorName: vendorName || 'Metro Retail Solutions',
      productName: productName || '',
      courier: 'J&T Express',
      trackingNumber: `JT-${Math.random().toString().slice(2, 9)}`,
      status: 'Processing',
      estimatedDelivery: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      proofOfDelivery: null,
    };
    return {
      shipments: [...state.shipments, newShipment],
      vendorRequests: state.vendorRequests.map(r =>
        r.id === requestId ? { ...r, status: 'In Transit' } : r
      ),
      manufacturerRequests: state.manufacturerRequests.map(r =>
        r.id === requestId ? { ...r, status: 'In Transit' } : r
      ),
    };
  }),

  updateShipmentStatus: (id, status) => set((state) => ({
    shipments: state.shipments.map(s => s.id === id ? { ...s, status } : s),
  })),

  uploadProofOfDelivery: (id, proof) => set((state) => ({
    shipments: state.shipments.map(s => s.id === id ? { ...s, proofOfDelivery: proof } : s),
  })),

  markDelivered: (id) => set((state) => {
    const shipment = state.shipments.find(s => s.id === id);
    return {
      shipments: state.shipments.map(s => s.id === id ? { ...s, status: 'Delivered' } : s),
      vendorRequests: state.vendorRequests.map(r =>
        r.id === shipment?.requestId ? { ...r, status: 'Completed' } : r
      ),
      manufacturerRequests: state.manufacturerRequests.map(r =>
        r.id === shipment?.requestId ? { ...r, status: 'Completed' } : r
      ),
    };
  }),
}));

export default useAppStore;
