import {
    CheckoutItem,
    CheckoutResult,
    Page,
    Product,
    SalesReport,
    SalesReportRow,
} from '@/@types/product';

import mockData from './mocks/productsMock.json';

export const MOCK_ENABLED: boolean = mockData.enabled;
export const PAGE_SIZE: number = mockData.pageSize;

// Catálogo em memória, semeado a partir do arquivo .json. O estoque vive aqui
// para que checkout() possa dar baixa e os alunos observarem controle de
// estoque e concorrência sem depender de um backend real.
const catalog: Product[] = (mockData.products as Product[]).map((product) => ({
    ...product,
    images: [...product.images],
    reviews: product.reviews.map((review) => ({ ...review, photos: [...review.photos] })),
}));

interface OrderLine {
    productId: string;
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    date: string;
    total: number;
    items: OrderLine[];
}

function sleep(ms: number = mockData.latencyMs): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone(product: Product): Product {
    return {
        ...product,
        images: [...product.images],
        reviews: product.reviews.map((review) => ({ ...review, photos: [...review.photos] })),
    };
}

// Vendas históricas fictícias, para o relatório não nascer vazio. Cada linha
// também dá baixa no estoque do catálogo, mantendo os números coerentes.
function seedOrders(): Order[] {
    const spec: { date: string; items: [string, number][] }[] = [
        { date: '2026-08-30', items: [['1', 1], ['6', 2]] },
        { date: '2026-09-01', items: [['2', 1], ['10', 3]] },
        { date: '2026-09-02', items: [['13', 1], ['9', 1]] },
        { date: '2026-09-03', items: [['6', 1], ['16', 2], ['10', 1]] },
        { date: '2026-09-04', items: [['4', 1], ['20', 1]] },
        { date: '2026-09-05', items: [['17', 2], ['2', 1]] },
        { date: '2026-09-06', items: [['3', 2], ['12', 1], ['16', 1]] },
        { date: '2026-09-07', items: [['8', 1], ['15', 1], ['6', 1]] },
    ];

    return spec.map((entry, index) => {
        const lines: OrderLine[] = entry.items.map(([productId, quantity]) => {
            const product = catalog.find((candidate) => candidate.id === productId)!;
            product.stock = Math.max(0, product.stock - quantity);
            return { productId, name: product.name, quantity, price: product.price };
        });

        return {
            id: `ORD-SEED-${String(index + 1).padStart(3, '0')}`,
            date: entry.date,
            total: lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
            items: lines,
        };
    });
}

const orders: Order[] = seedOrders();

export async function listProducts(page: number = 1, pageSize: number = PAGE_SIZE): Promise<Page<Product>> {
    await sleep();

    const total = catalog.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, Math.trunc(page)), totalPages);
    const start = (safePage - 1) * pageSize;
    const items = catalog.slice(start, start + pageSize).map(clone);

    return { items, page: safePage, pageSize, total, totalPages };
}

export async function getProduct(id: string): Promise<Product> {
    await sleep();

    const product = catalog.find((candidate) => candidate.id === id);

    if (!product) {
        throw new Error('Produto não encontrado.');
    }

    return clone(product);
}

// Serializa as compras para simular uma seção crítica: cada checkout só começa
// depois que o anterior termina, evitando venda de estoque inexistente.
let checkoutQueue: Promise<unknown> = Promise.resolve();

export async function checkout(items: CheckoutItem[]): Promise<CheckoutResult> {
    const run = checkoutQueue.then(async () => {
        await sleep(mockData.latencyMs * 2);

        if (items.length === 0) {
            throw new Error('Carrinho vazio.');
        }

        for (const item of items) {
            const product = catalog.find((candidate) => candidate.id === item.productId);

            if (!product) {
                throw new Error(`Produto ${item.productId} não existe mais.`);
            }

            if (item.quantity < 1) {
                throw new Error(`Quantidade inválida para "${product.name}".`);
            }

            if (product.stock < item.quantity) {
                throw new Error(
                    `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}.`,
                );
            }
        }

        const detailed: OrderLine[] = items.map((item) => {
            const product = catalog.find((candidate) => candidate.id === item.productId)!;
            product.stock -= item.quantity;
            return {
                productId: product.id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
            };
        });

        const total = detailed.reduce((sum, entry) => sum + entry.price * entry.quantity, 0);
        const order: Order = {
            id: `ORD-${Date.now().toString(36).toUpperCase()}`,
            date: new Date().toISOString().slice(0, 10),
            total,
            items: detailed,
        };

        orders.push(order);

        return { orderId: order.id, total: order.total, items: order.items };
    });

    checkoutQueue = run.catch(() => undefined);

    return run;
}

export async function getSalesReport(): Promise<SalesReport> {
    await sleep();

    const byProduct = new Map<string, SalesReportRow>();

    for (const product of catalog) {
        byProduct.set(product.id, {
            productId: product.id,
            name: product.name,
            unitsSold: 0,
            revenue: 0,
            stock: product.stock,
        });
    }

    const dailyMap = new Map<string, { orders: number; revenue: number }>();

    for (const order of orders) {
        const day = dailyMap.get(order.date) ?? { orders: 0, revenue: 0 };
        day.orders += 1;
        day.revenue += order.total;
        dailyMap.set(order.date, day);

        for (const line of order.items) {
            const row = byProduct.get(line.productId);
            if (row) {
                row.unitsSold += line.quantity;
                row.revenue += line.quantity * line.price;
            }
        }
    }

    const rows = [...byProduct.values()]
        .filter((row) => row.unitsSold > 0)
        .sort((a, b) => b.revenue - a.revenue);

    const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
    const totalUnits = rows.reduce((sum, row) => sum + row.unitsSold, 0);
    const totalOrders = orders.length;

    const lowStock = [...byProduct.values()]
        .filter((row) => row.stock <= 5)
        .sort((a, b) => a.stock - b.stock);

    const daily = [...dailyMap.entries()]
        .map(([date, value]) => ({ date, orders: value.orders, revenue: value.revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
        generatedAt: new Date().toISOString(),
        totalRevenue,
        totalOrders,
        totalUnits,
        averageTicket: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        unitsInStock: catalog.reduce((sum, product) => sum + product.stock, 0),
        rows,
        lowStock,
        daily,
    };
}

// Restaura o estoque original — útil para reiniciar demonstrações em aula.
export async function resetStock(): Promise<void> {
    await sleep(50);
    (mockData.products as Product[]).forEach((seed) => {
        const product = catalog.find((candidate) => candidate.id === seed.id);
        if (product) {
            product.stock = seed.stock;
        }
    });
}
