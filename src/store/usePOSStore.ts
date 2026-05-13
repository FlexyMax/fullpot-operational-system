import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    id: string; // This should be the unico of the invoice_box (line)
    name: string;
    price: number;
    quantity: number;
}

interface InvoiceInfo {
    id: string;
    customerName: string;
    date: string;
}

interface POSState {
    activeInvoice: InvoiceInfo | null;
    cart: CartItem[];

    setActiveInvoice: (invoice: InvoiceInfo | null) => void;
    setCart: (items: CartItem[]) => void;
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, qty: number) => void;
    clearCart: () => void;
}

export const usePOSStore = create<POSState>()(
    persist(
        (set) => ({
            activeInvoice: null,
            cart: [],

            setActiveInvoice: (invoice) => set({ activeInvoice: invoice }),

            setCart: (items) => set({ cart: items }),

            addToCart: (item) => set((state) => {
                const existing = state.cart.find(i => i.id === item.id);
                if (existing) {
                    return {
                        cart: state.cart.map(i => i.id === item.id
                            ? { ...i, quantity: i.quantity + item.quantity }
                            : i
                        )
                    };
                }
                return { cart: [...state.cart, item] };
            }),

            removeFromCart: (itemId) => set((state) => ({
                cart: state.cart.filter(i => i.id !== itemId)
            })),

            updateQuantity: (itemId, qty) => set((state) => ({
                cart: state.cart.map(i => i.id === itemId
                    ? { ...i, quantity: qty }
                    : i
                )
            })),

            clearCart: () => set({ cart: [], activeInvoice: null }),
        }),
        {
            name: 'pos-storage',
        }
    )
);
