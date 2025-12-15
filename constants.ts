import { GarmentCategory } from "./types";

export const CATEGORIES = Object.values(GarmentCategory);

export const COLORS = [
  { name: 'Black', hex: '#000000', class: 'bg-black border-gray-700' },
  { name: 'White', hex: '#FFFFFF', class: 'bg-white border-gray-200' },
  { name: 'Red', hex: '#EF4444', class: 'bg-red-500 border-red-600' },
  { name: 'Blue', hex: '#3B82F6', class: 'bg-blue-500 border-blue-600' },
  { name: 'Beige', hex: '#D2B48C', class: 'bg-[#D2B48C] border-[#C1A37B]' },
  { name: 'Green', hex: '#22C55E', class: 'bg-green-500 border-green-600' },
];

export const SEARCH_SUGGESTIONS = [
  "Cafe in Hanoi",
  "Pagoda in Hanoi",
  "Travel place in Hanoi",
  "Street art in Hanoi"
];

export const DEFAULT_WARDROBE = [
  {
    id: 'gemini-sweat',
    name: 'Gemini Sweat',
    category: GarmentCategory.TOPS,
    url: 'https://raw.githubusercontent.com/ammaarreshi/app-images/refs/heads/main/gemini-sweat-2.png',
    color: '#000000'
  },
  {
    id: 'gemini-tee',
    name: 'Gemini Tee',
    category: GarmentCategory.TOPS,
    url: 'https://raw.githubusercontent.com/ammaarreshi/app-images/refs/heads/main/Gemini-tee.png',
    color: '#FFFFFF'
  }
];