export interface IStoreJson {
  hashId?: string;
  brand?: string;
  name?: string;
  street?: string;
  city?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}
