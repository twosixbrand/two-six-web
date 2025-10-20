export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: "HOMBRE" | "MUJER" | "OUTLET";
  description: string;
}
