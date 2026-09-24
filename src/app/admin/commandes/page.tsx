"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { formatPrice } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "En attente de paiement",
  paid: "Payée — à expédier",
  shipped: "Expédiée",
  cancelled: "Annulée",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  function reload() {
    adminFetch("/api/admin/orders")
      .then((res) => res.json())
      .then(setOrders);
  }

  useEffect(reload, []);

  async function updateStatus(id: string, status: OrderStatus) {
    await adminFetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    reload();
  }

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide">COMMANDES</h1>

      {!orders ? (
        <p className="mt-8 text-ink/50">Chargement...</p>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-ink/50">Aucune commande pour l&apos;instant.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border-2 border-ink/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{order.customerEmail}</p>
                  <p className="text-xs text-ink/40">
                    {new Date(order.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatus(order.id, e.target.value as OrderStatus)
                  }
                  className="rounded-md border-2 border-ink/15 px-2 py-1 text-sm"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <ul className="mt-3 text-sm text-ink/70">
                {order.items.map((item) => (
                  <li key={item.issueId}>
                    {item.quantity}× {item.title} —{" "}
                    {formatPrice(item.priceCents * item.quantity)}
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-sm text-ink/60">
                {order.customerName || order.customerEmail} — {order.customerPhone}
              </p>
              {order.relayPoint ? (
                <p className="mt-1 text-sm text-ink/60">
                  <span className="text-ink/40">Point relais : </span>
                  {order.relayPoint.name}
                  <br />
                  {order.relayPoint.line1}
                  <br />
                  {order.relayPoint.postalCode} {order.relayPoint.city}
                </p>
              ) : (
                <p className="mt-1 text-sm text-ink/40">
                  Commande passée avant la mise en place des points relais — pas d&apos;infos de livraison structurées.
                </p>
              )}

              <p className="mt-3 font-display text-lg text-red">
                {formatPrice(order.amountTotalCents)}
              </p>

              {order.sendcloudParcelId ? (
                <a
                  href="https://panel.sendcloud.sc/parcels"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-teal underline"
                >
                  Colis créé dans Sendcloud (n°{order.sendcloudParcelId}) — imprimer l&apos;étiquette →
                </a>
              ) : (
                <p className="mt-3 text-sm text-ink/40">
                  Colis non créé automatiquement — à créer manuellement dans Sendcloud.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
