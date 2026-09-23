import type { RelayPoint } from "@/lib/types";

const API_BASE = "https://panel.sendcloud.sc/api";

/** Poids forfaitaire par revue commandée (grammes) — pas de poids par titre en base. */
export const PARCEL_WEIGHT_PER_ITEM_G = 400;

/**
 * ID de méthode d'expédition Sendcloud "Mondial Relay Point Relais" (commerçant, France),
 * une par tranche de poids — cf. GET /api/v2/shipping_methods sur ce compte.
 */
const POINT_RELAIS_SHIPPING_METHODS: { maxGrams: number; id: number }[] = [
  { maxGrams: 250, id: 28035 },
  { maxGrams: 500, id: 28036 },
  { maxGrams: 1000, id: 28037 },
  { maxGrams: 2000, id: 28038 },
  { maxGrams: 3000, id: 28039 },
  { maxGrams: 5000, id: 28040 },
  { maxGrams: 7000, id: 28041 },
  { maxGrams: 10000, id: 28042 },
  { maxGrams: 15000, id: 28043 },
  { maxGrams: 20000, id: 28044 },
  { maxGrams: 25000, id: 28045 },
  { maxGrams: 30000, id: 28046 },
];

/** ID de méthode d'expédition Sendcloud "Mondial Relay Locker Delivery" (consigne 24/7, France). */
const LOCKER_SHIPPING_METHODS: { maxGrams: number; id: number }[] = [
  { maxGrams: 250, id: 29145 },
  { maxGrams: 500, id: 29146 },
  { maxGrams: 1000, id: 29147 },
  { maxGrams: 2000, id: 29148 },
  { maxGrams: 3000, id: 29149 },
  { maxGrams: 5000, id: 29150 },
  { maxGrams: 7000, id: 29151 },
  { maxGrams: 10000, id: 29152 },
  { maxGrams: 15000, id: 29153 },
  { maxGrams: 20000, id: 29154 },
  { maxGrams: 25000, id: 29155 },
];

export function shippingMethodForWeight(
  grams: number,
  shopType: RelayPoint["shopType"]
): number | null {
  const tiers = shopType === "locker" ? LOCKER_SHIPPING_METHODS : POINT_RELAIS_SHIPPING_METHODS;
  const tier = tiers.find((t) => grams <= t.maxGrams);
  return tier?.id ?? null;
}

function envCreds() {
  const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
  const secretKey = process.env.SENDCLOUD_SECRET_KEY;
  if (!publicKey || !secretKey) return null;
  return { publicKey, secretKey };
}

function authHeader(publicKey: string, secretKey: string) {
  const token = Buffer.from(`${publicKey}:${secretKey}`).toString("base64");
  return `Basic ${token}`;
}

type ServicePointsResponse = {
  data: {
    results: {
      id: number;
      name: string;
      general_shop_type: string;
      address: {
        street: string;
        house_number: string;
        postal_code: string;
        city: string;
        country_code: string;
      };
    }[];
  };
};

/**
 * Recherche les points relais Mondial Relay proches d'un code postal (France).
 * Retourne null si SENDCLOUD_PUBLIC_KEY / SENDCLOUD_SECRET_KEY ne sont pas configurées.
 */
export async function searchRelayPoints(
  postalCode: string,
  country = "FR"
): Promise<RelayPoint[] | null> {
  const creds = envCreds();
  if (!creds) return null;

  const url = new URL(`${API_BASE}/v3/service-points`);
  url.searchParams.set("country_code", country);
  url.searchParams.set("address_postal_code", postalCode);
  url.searchParams.append("carrier_code", "mondial_relay");
  url.searchParams.set("limit", "10");

  const res = await fetch(url, {
    headers: { Authorization: authHeader(creds.publicKey, creds.secretKey) },
  });

  if (!res.ok) {
    throw new Error(`Sendcloud service-points: HTTP ${res.status}`);
  }

  const data = (await res.json()) as ServicePointsResponse;
  return data.data.results.map((p) => ({
    id: String(p.id),
    name: p.name,
    line1: [p.address.street, p.address.house_number].filter(Boolean).join(" "),
    postalCode: p.address.postal_code,
    city: p.address.city,
    country: p.address.country_code,
    shopType: p.general_shop_type === "locker" ? "locker" : "servicepoint",
  }));
}

/**
 * Crée automatiquement le colis dans Sendcloud (avec étiquette) pour un point relais donné.
 * Best-effort : ne jette jamais, retourne null si non configuré ou en cas d'échec (à créer
 * manuellement dans ce cas — le point relais reste visible dans l'admin et l'email).
 */
export async function createRelayParcel(input: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  relayPoint: RelayPoint;
  weightGrams: number;
}): Promise<{ parcelId: number } | null> {
  const creds = envCreds();
  if (!creds) return null;

  const shippingMethodId = shippingMethodForWeight(
    input.weightGrams,
    input.relayPoint.shopType
  );
  if (!shippingMethodId) {
    console.error("createRelayParcel: poids hors tranches supportées", input.weightGrams);
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/v2/parcels`, {
      method: "POST",
      headers: {
        Authorization: authHeader(creds.publicKey, creds.secretKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parcel: {
          name: input.customerName,
          address: input.relayPoint.line1,
          city: input.relayPoint.city,
          postal_code: input.relayPoint.postalCode,
          country: input.relayPoint.country,
          telephone: input.customerPhone,
          email: input.customerEmail,
          to_service_point: Number(input.relayPoint.id),
          weight: (input.weightGrams / 1000).toFixed(3),
          order_number: input.orderNumber,
          shipment: { id: shippingMethodId },
          request_label: true,
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("createRelayParcel: Sendcloud a répondu", res.status, detail);
      return null;
    }

    const data = await res.json();
    const parcelId = data?.parcel?.id;
    return typeof parcelId === "number" ? { parcelId } : null;
  } catch (err) {
    console.error("createRelayParcel: échec de l'appel Sendcloud", err);
    return null;
  }
}
