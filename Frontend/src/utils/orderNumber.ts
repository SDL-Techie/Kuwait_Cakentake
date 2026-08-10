export function getDisplayOrderNumber(order: any, offset = 15000, pad = 0): string {
  if (!order) return "";
  // Prefer explicit order_number when present (could be CT-YYYYMMDD-XXXX or any app-specific format)
  if (order.order_number) return String(order.order_number);

  const id = Number(order.id ?? order.orderId ?? 0);
  if (!id || Number.isNaN(id)) return "";

  const display = id + Number(offset || 0);
  const s = String(display);
  if (pad && pad > 0) return s.padStart(pad, "0");
  return s;
}
