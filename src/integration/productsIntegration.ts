export const PRODUCTS_API_URL = 'http://localhost:8082/fatec/store/v1';

import { CheckoutItem, CheckoutResult, Page, Product, SalesReport } from '@/@types/product';

import * as productsMock from './productsMock';

// Enquanto o backend da loja não existe, o mock em ./mocks/productsMock.json
// responde no lugar da API. Defina "enabled": false naquele arquivo para voltar
// a bater no backend real.
const USE_MOCK = productsMock.MOCK_ENABLED;

export const PAGE_SIZE = productsMock.PAGE_SIZE;

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || `Erro na requisição (${response.status})`);
    }
    return response.json();
}

export async function listProducts(page: number = 1, pageSize: number = PAGE_SIZE): Promise<Page<Product>> {
    if (USE_MOCK) {
        return productsMock.listProducts(page, pageSize);
    }

    const response = await fetch(`${PRODUCTS_API_URL}/products?page=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        credentials: 'include',
    });

    return handleResponse<Page<Product>>(response);
}

export async function getProduct(id: string): Promise<Product> {
    if (USE_MOCK) {
        return productsMock.getProduct(id);
    }

    const response = await fetch(`${PRODUCTS_API_URL}/products/${id}`, {
        method: 'GET',
        credentials: 'include',
    });

    return handleResponse<Product>(response);
}

export async function checkout(items: CheckoutItem[]): Promise<CheckoutResult> {
    if (USE_MOCK) {
        return productsMock.checkout(items);
    }

    const response = await fetch(`${PRODUCTS_API_URL}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items }),
    });

    return handleResponse<CheckoutResult>(response);
}

export async function getSalesReport(): Promise<SalesReport> {
    if (USE_MOCK) {
        return productsMock.getSalesReport();
    }

    const response = await fetch(`${PRODUCTS_API_URL}/reports/sales`, {
        method: 'GET',
        credentials: 'include',
    });

    return handleResponse<SalesReport>(response);
}
