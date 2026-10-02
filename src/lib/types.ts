export type Issue = {
  id: string;
  slug: string;
  title: string;
  description: string;
  description2: string;
  coverImageUrl: string;
  backgroundImageUrl: string;
  buttonColor: string;
  pageImageUrls: string[];
  /** Affiché dans la rubrique Lecture (faux pour un produit qui ne se lit pas en ligne). Absent sur les anciens produits : voir isReadableOnline. */
  readable?: boolean;
  /** Numéros des pages mises en avant sur la fiche (1 = couverture). Absent sur les revues non réenregistrées. */
  previewPages?: number[];
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
  galleryImageUrls: string[];
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
  portfolioImageUrls: string[];
  email: string;
  website: string;
  instagram: string;
  facebook: string;
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

/** Point relais Mondial Relay choisi par le client au moment de la commande. */
export type RelayPoint = {
  id: string;
  name: string;
  line1: string;
  postalCode: string;
  city: string;
  country: string;
  /** "servicepoint" (commerçant) ou "locker" (consigne 24/7) — détermine la méthode d'expédition Sendcloud. */
  shopType: "servicepoint" | "locker";
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
  /** Nom + téléphone du client (mode point relais : pas d'adresse postale du client). */
  customerName: string;
  customerPhone: string;
  /** Point relais Mondial Relay choisi — seul mode de livraison actuellement proposé. */
  relayPoint: RelayPoint;
  /** ID du colis créé automatiquement dans Sendcloud (étiquette à imprimer côté panel Sendcloud), null si échec/non configuré. */
  sendcloudParcelId: number | null;
  customerEmail: string;
  status: OrderStatus;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  /** Date de passage au statut « expédiée » (absente sur les commandes antérieures au suivi). */
  shippedAt?: number | null;
  /** Lien de suivi Mondial Relay communiqué au client à l'expédition, null si indisponible. */
  trackingUrl?: string | null;
  /** Date d'envoi de l'e-mail « après réception », pour ne l'envoyer qu'une fois. */
  followUpSentAt?: number | null;
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

export type DonationMessage = {
  id: string;
  /** Mot laissé par le donateur (peut être vide si seulement une image). */
  message: string;
  /** Nom / signature optionnel. */
  authorName: string;
  /** URL Storage de la photo ou du dessin, null si message seul. */
  imageUrl: string | null;
  /** Type de média joint. */
  kind: "photo" | "drawing" | null;
  /** Session Stripe du don associé, null si non rattachée. */
  stripeSessionId: string | null;
  createdAt: number;
};
