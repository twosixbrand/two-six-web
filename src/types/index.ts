export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  gender: "HOMBRE" | "MUJER";
  description: string;
}
