let brl: Intl.NumberFormat | null = null;

try {
    brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
} catch {
    brl = null;
}

export function formatBRL(value: number): string {
    if (brl) {
        return brl.format(value);
    }

    // Fallback caso o runtime não tenha suporte completo a Intl.
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}
