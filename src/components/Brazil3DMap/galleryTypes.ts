export interface CityGalleryItem {
  file: string;
  city: string;
  label: string;
  coordinates: [number, number] | null;
}

export type GalleryManifest = Record<string, CityGalleryItem[]>;
