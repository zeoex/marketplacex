import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  currency: string;
  quantity: number;
  imageUrl?: string;
  slug: string;
  sellerId: string;
  sellerName: string;
  variantId?: string;
  variantName?: string;
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed
  total: number;
  itemCount: number;
  subtotal: number;
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      immer((set, get) => ({
        items: [],
        isOpen: false,

        addItem: (item) =>
          set((state) => {
            const key = item.variantId ? `${item.productId}-${item.variantId}` : item.productId;
            const existing = state.items.find(
              (i) => i.productId === item.productId && i.variantId === item.variantId,
            );

            if (existing) {
              const newQty = Math.min(existing.quantity + (item.quantity || 1), item.maxStock);
              existing.quantity = newQty;
            } else {
              state.items.push({ ...item, quantity: item.quantity || 1 });
            }
            state.isOpen = true;
          }),

        removeItem: (productId, variantId) =>
          set((state) => {
            state.items = state.items.filter(
              (i) => !(i.productId === productId && i.variantId === variantId),
            );
          }),

        updateQuantity: (productId, quantity, variantId) =>
          set((state) => {
            const item = state.items.find(
              (i) => i.productId === productId && i.variantId === variantId,
            );
            if (item) {
              if (quantity <= 0) {
                state.items = state.items.filter(
                  (i) => !(i.productId === productId && i.variantId === variantId),
                );
              } else {
                item.quantity = Math.min(quantity, item.maxStock);
              }
            }
          }),

        clear: () => set((state) => { state.items = []; }),
        openCart: () => set((state) => { state.isOpen = true; }),
        closeCart: () => set((state) => { state.isOpen = false; }),
        toggleCart: () => set((state) => { state.isOpen = !state.isOpen; }),

        get total() {
          return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        },
        get subtotal() {
          return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        },
        get itemCount() {
          return get().items.reduce((sum, i) => sum + i.quantity, 0);
        },
      })),
      { name: 'mpx-cart', version: 1 },
    ),
  ),
);
