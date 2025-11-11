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

interface DesignClothingEntity {
  id: number;
  quantity_available: number;
  color: Color;
  size: Size;
  design: Design & {
    clothing: Clothing & {
      typeClothing: TypeClothing;
      category: Category;
    };
  };
}
export interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  gender: "MASCULINO" | "FEMENINO" | "UNISEX";
  description: string;
  designClothing: DesignClothingEntity;
}
