export type Product = {
  id: number;
  name: string;
  category: string;
  concern: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Vitamin C Face Serum",
    category: "Serum",
    concern: "Dark Spots",
    price: 499,
    originalPrice: 699,
    image: "/images/AGA FP Hair Gel.jpeg",
    rating: 4.6,
    reviews: 128,
    badge: "BESTSELLER",
  },
  {
    id: 2,
    name: "Anti Hair Fall Serum",
    category: "Hair Care",
    concern: "Hair Fall",
    price: 549,
    originalPrice: 799,
    image: "/images/ANTIFALL SER.jpeg",
    rating: 4.5,
    reviews: 96,
    badge: "POPULAR",
  },
  {
    id: 3,
    name: "Anti Dandruff Shampoo",
    category: "Shampoo",
    concern: "Dandruff",
    price: 399,
    originalPrice: 599,
    image: "/images/Antigrety Shampoo.jpeg",
    rating: 4.4,
    reviews: 84,
  },
  {
    id: 4,
    name: "Daily Skin Treatment",
    category: "Skin Care",
    concern: "Dull Skin",
    price: 599,
    originalPrice: 799,
    image: "/images/Aziniv.jpeg",
    rating: 4.7,
    reviews: 152,
    badge: "BESTSELLER",
  },
];