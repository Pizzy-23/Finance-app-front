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
    ordem: number;
    tags: Tag[];
}

export interface FinanceGroup {
    id: string;
    nome: string;
    cor: string;
    ordem: number;
    entrada: boolean;
    itens: FinanceItem[];
}