export interface Color {
  id: number;
  name: string;
  hex: string;
}
export interface Size {
  id: number;
  name: string;
  description: string;
}
interface TypeClothing {
  id: number;
  name: string;
}
interface Category {
  id: number;
  name: string;
}
interface Clothing {
  id_type_clothing: number;
  name: string;
  description: string;
  id_category: number;
  gender: "MASCULINO" | "FEMENINO" | "UNISEX";
}
interface Design {
  id: number;
  name: string;
  reference: string;
  description: string;
}


interface ClothingSizeEntity {
  id: number;
  quantity_available: number;
  // quantity_produced, sold, etc if needed
  size: Size;
  clothingColor: {
    id: number;
    image_url: string | null;
    color: Color;
    design: Design & {
      clothing: Clothing & {
        typeClothing: TypeClothing;
        category: Category;
      };
    };
  };
}

export interface Product {
  id: number;
  name: string;
  price: number;
  gender: "MASCULINO" | "FEMENINO" | "UNISEX";
  description: string;
  clothingSize: ClothingSizeEntity;
}
