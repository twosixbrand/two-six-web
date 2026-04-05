export interface StoreDesign {
    id_design: number;
    name: string;
    description: string | null;
    id_product: number;
    slug?: string;
    price: number;
    image_url: string | null;
    is_outlet: boolean;
    gender: string;
}
