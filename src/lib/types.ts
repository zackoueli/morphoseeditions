export type Issue = {
  id: string;
  slug: string;
  title: string;
  issueNumber: number;
  description: string;
  description2: string;
  coverImageUrl: string;
  backgroundImageUrl: string;
  buttonColor: string;
  pageImageUrls: string[];
  priceCents: number;
  stock: number;
  published: boolean;
  createdAt: number;
  updatedAt: number;
};

export type NewsPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  published: boolean;
  publishedAt: number;
  createdAt: number;
  updatedAt: number;
};

export type Author = {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  published: boolean;
  createdAt: number;
  updatedAt: number;
};

export type AboutPage = {
  content: string;
  updatedAt: number;
};

export type OrderItem = {
  issueId: string;
  title: string;
  priceCents: number;
  quantity: number;
};

export type ShippingAddress = {
  name: string;
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
};

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "shipped"
  | "cancelled";

export type Order = {
  id: string;
  items: OrderItem[];
  amountTotalCents: number;
  shippingCents: number;
  shippingAddress: ShippingAddress;
  customerEmail: string;
  status: OrderStatus;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  createdAt: number;
  updatedAt: number;
};

export type Donation = {
  id: string;
  amountCents: number;
  donorEmail: string | null;
  stripeSessionId: string;
  createdAt: number;
};
