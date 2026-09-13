export interface ProductReview {
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
    photos: string[];
}

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    rating: number;
    ratingCount: number;
    stock: number;
    thumbnail: string;
    images: string[];
    description: string;
    reviews: ProductReview[];
}

export interface Page<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export interface CheckoutItem {
    productId: string;
    quantity: number;
}

export interface CheckoutResult {
    orderId: string;
    total: number;
    items: { productId: string; name: string; quantity: number; price: number }[];
}

export interface SalesReportRow {
    productId: string;
    name: string;
    unitsSold: number;
    revenue: number;
    stock: number;
}

export interface SalesReportDay {
    date: string;
    orders: number;
    revenue: number;
}

export interface SalesReport {
    generatedAt: string;
    totalRevenue: number;
    totalOrders: number;
    totalUnits: number;
    averageTicket: number;
    unitsInStock: number;
    rows: SalesReportRow[];
    lowStock: SalesReportRow[];
    daily: SalesReportDay[];
}
