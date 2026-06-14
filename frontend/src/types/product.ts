export interface Product {
  id: number;
  image: string;
  title: string;
  description: string;
  price: string;
  rating: number;
  badge?: string;
  category: string;
  stock: number;
  images?: string[];
  longDescription?: string;
  benefits?: string[];
  ingredients?: string[];
  usage?: string;
  warnings?: string;
  nutritionalInfo?: {
    servingSize: string;
    servingsPerContainer: number;
    nutrients: {
      name: string;
      amount: string;
      dailyValue?: string;
    }[];
  };
  reviews?: {
    id: number;
    author: string;
    rating: number;
    date: string;
    comment: string;
    verified: boolean;
  }[];
}
