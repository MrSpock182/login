import { createContext, useContext, useMemo, useState } from 'react';

import { Product } from '@/@types/product';

export interface CartItem {
    product: Product;
    quantity: number;
}

type CartContextData = {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    addItem: (product: Product, quantity?: number) => void;
    setQuantity: (productId: string, quantity: number) => void;
    removeItem: (productId: string) => void;
    clear: () => void;
};

const CartContext = createContext<CartContextData | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    function addItem(product: Product, quantity: number = 1) {
        setItems((current) => {
            const existing = current.find((item) => item.product.id === product.id);
            const stockLimit = product.stock;

            if (existing) {
                const nextQuantity = Math.min(existing.quantity + quantity, stockLimit);
                return current.map((item) =>
                    item.product.id === product.id ? { ...item, quantity: nextQuantity } : item,
                );
            }

            return [...current, { product, quantity: Math.min(quantity, stockLimit) }];
        });
    }

    function setQuantity(productId: string, quantity: number) {
        setItems((current) =>
            current
                .map((item) => {
                    if (item.product.id !== productId) {
                        return item;
                    }
                    const clamped = Math.max(0, Math.min(quantity, item.product.stock));
                    return { ...item, quantity: clamped };
                })
                .filter((item) => item.quantity > 0),
        );
    }

    function removeItem(productId: string) {
        setItems((current) => current.filter((item) => item.product.id !== productId));
    }

    function clear() {
        setItems([]);
    }

    const { totalItems, totalPrice } = useMemo(() => {
        return items.reduce(
            (acc, item) => ({
                totalItems: acc.totalItems + item.quantity,
                totalPrice: acc.totalPrice + item.quantity * item.product.price,
            }),
            { totalItems: 0, totalPrice: 0 },
        );
    }, [items]);

    return (
        <CartContext.Provider
            value={{ items, totalItems, totalPrice, addItem, setQuantity, removeItem, clear }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }

    return context;
}
