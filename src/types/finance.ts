export interface Tag {
    id: string;
    nome: string;
    cor: string;
}

export interface FinanceItem {
    id: string;
    nome: string;
    valor: number;
    data: string;
    recorrente: boolean;
    financeGroupId: string;
    tags: Tag[]; // Adicionado
}

export interface FinanceGroup {
    id: string;
    nome: string;
    cor: string;
    ordem: number; // Adicionado
    valorTotal: number;
    totalEntrada: number;
    totalGasto: number;
    itens: FinanceItem[];
}