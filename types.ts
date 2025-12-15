export enum Tab {
  SQUAD = 'SQUAD',
  CLOSET = 'CLOSET',
  STUDIO = 'STUDIO',
}

export enum GarmentCategory {
  ALL = 'All',
  TOPS = 'Tops',
  BOTTOMS = 'Bottoms',
  OUTERWEAR = 'Outerwear',
  SHOES = 'Shoes',
  ACCESSORIES = 'Accessories',
}

export interface Member {
  id: string;
  name: string;
  photoData: string; // Base64 string
  createdAt: number;
}

export interface Garment {
  id: string;
  category: GarmentCategory;
  imageUrl: string; // Base64 string
  name: string;
  color?: string;
  tags?: string[];
  createdAt: number;
}

export interface OutfitAssignment {
  memberId: string;
  garmentId: string | null;
}

export interface RenderResult {
  originalImage: string;
  generatedImage: string;
}

export interface MapLocation {
  lat: number;
  lng: number;
  zoom: number;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  imageUrls: string[]; // List of real images
  suggestedAttire: string;
  bestTime: string;
  tips: string;
}