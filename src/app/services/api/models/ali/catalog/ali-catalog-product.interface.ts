export interface AliCatalogProduct {
  id: string;
  imgSrc: string;
  productUrl: string;
  productTitle: string;
  storeUrl: string;
  storeTitle: string;
  userTags: any[];
  fullPrice: string;
  discount: number;
  finalPrice: string;
  freeDelivery: boolean;
  sales: string;
  salesLink: string;
  rating: number;
  ratingLink: string;
  marketingBadge: string;
  ad: boolean;
  hot: boolean;
  isWished: boolean;
  imgGallery: string[];
  affTraceInfo: string;
  trace: string;
}
