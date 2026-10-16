import React, { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnimatePresence, motion } from 'framer-motion';
import { Printer, X } from 'lucide-react';
import {
  formatOrderDate,
  formatOrderMoney,
  paymentLabel,
  toOrderView,
  type OrderView,
} from '../../utils/orderView';
import './OrderView.css';

/* ==========================================================================
   OrderReceipt — the one receipt used by Sales Staff, Kitchen, Admin, Shop
   Manager and Agents.

   Client corrections covered:
     • Area shown (it was missing while other address fields showed)
     • Customer address shown
     • Delivery / pickup date shown (only the order date used to show)
     • Ordered items shown — including custom cakes — with product image
     • Writing (cake message) shown per item and for the order
   ========================================================================== */

const RECEIPT_CSS = `
  .rc{font-family:Inter,Arial,sans-serif;color:#1f2a1b;max-width:420px;margin:0 auto;padding:18px 18px 22px;background:#fff}
  .rc *{box-sizing:border-box}
  .rc-head{text-align:center;border-bottom:2px dashed #cfdcc0;padding-bottom:12px;margin-bottom:12px}
  .rc-brand{font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;color:#2f4626;margin:0}
  .rc-sub{font-size:11px;color:#6b7a63;margin:2px 0 0;letter-spacing:.08em;text-transform:uppercase}
  .rc-no{display:inline-block;margin-top:8px;padding:3px 12px;border-radius:999px;background:#edf3e4;color:#2f4626;font-weight:800;font-size:13px}
  .rc-grid{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:12px;margin-bottom:10px}
  .rc-grid dt{color:#6b7a63}
  .rc-grid dd{margin:0;font-weight:600;text-align:right}
  .rc-sec{font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#6f8e57;margin:12px 0 6px}
  .rc-box{border:1px solid #e3ead9;border-radius:10px;padding:8px 10px;font-size:12px;line-height:1.45}
  .rc-items{list-style:none;margin:0;padding:0}
  .rc-item{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #eef2e8}
  .rc-item:last-child{border-bottom:0}
  .rc-img{width:46px;height:46px;border-radius:8px;object-fit:cover;background:#edf3e4;flex:0 0 auto}
  .rc-img-empty{display:flex;align-items:center;justify-content:center;font-size:9px;color:#8faf6e}
  .rc-item-body{flex:1;min-width:0;font-size:12px}
  .rc-item-name{font-weight:700;display:block}
  .rc-tag{display:inline-block;margin-left:4px;padding:0 6px;border-radius:6px;background:#fdf1dc;color:#8a5a12;font-size:9px;font-weight:800;text-transform:uppercase;vertical-align:middle}
  .rc-meta{color:#526a45;font-size:11px}
  .rc-writing{margin-top:2px;font-size:11px;color:#7a3c58;font-style:italic}
  .rc-price{font-weight:700;font-size:12px;white-space:nowrap}
  .rc-tot{margin-top:8px;font-size:12px}
  .rc-tot div{display:flex;justify-content:space-between;padding:2px 0}
  .rc-tot .grand{border-top:2px solid #2f4626;margin-top:6px;padding-top:6px;font-size:15px;font-weight:800;color:#2f4626}
  .rc-foot{text-align:center;color:#6b7a63;font-size:11px;margin-top:14px;border-top:2px dashed #cfdcc0;padding-top:10px}
  @media print{@page{margin:8mm}.rc{max-width:none}}
`;

export const ReceiptDocument: React.FC<{ view: OrderView }> = ({ view: v }) => (
  <div className="rc">
    <div className="rc-head">
      <p className="rc-brand">CakeNTake</p>
      <p className="rc-sub">Order receipt</p>
      <span className="rc-no">Order #{v.number}</span>
    </div>

    <dl className="rc-grid">
      <dt>Order date</dt>
      <dd>{formatOrderDate(v.createdAt, true)}</dd>
      <dt>{v.isPickup ? 'Pickup date' : 'Delivery date'}</dt>
      <dd>
        {formatOrderDate(v.scheduledDate)}
        {v.scheduledSlot ? ` · ${v.scheduledSlot}` : ''}
      </dd>
      <dt>Method</dt>
      <dd>{v.isPickup ? 'Pickup from shop' : 'Delivery'}</dd>
      <dt>Payment</dt>
      <dd>
        {paymentLabel(v.paymentMethod)}
        {v.paymentStatus ? ` (${v.paymentStatus})` : ''}
      </dd>
    </dl>

    <div className="rc-sec">Customer</div>
    <div className="rc-box">
      <strong>{v.customerName}</strong>
      {v.customerPhone && <div>{v.customerPhone}</div>}
      {!v.isPickup && (
        <>
          <div>
            <b>Area:</b> {v.areaName || '—'}
          </div>
          <div>
            <b>Address:</b> {v.addressText || '—'}
          </div>
          {v.addressNotes && (
            <div>
              <b>Delivery notes:</b> {v.addressNotes}
            </div>
          )}
        </>
      )}
    </div>

    <div className="rc-sec">Ordered items</div>
    <ul className="rc-items">
      {v.lines.map((l) => (
        <li className="rc-item" key={l.key}>
          {l.image ? (
            <img className="rc-img" src={l.image} alt={l.name} />
          ) : (
            <span className="rc-img rc-img-empty">No image</span>
          )}
          <div className="rc-item-body">
            <span className="rc-item-name">
              {l.name}
              {l.type === 'CUSTOM_CAKE' && <span className="rc-tag">Custom</span>}
              {l.type === 'AGENT_EXCLUSIVE' && <span className="rc-tag">Exclusive</span>}
            </span>
            <span className="rc-meta">
              {[l.size && `Size: ${l.size}`, l.flavour && `Flavour: ${l.flavour}`, l.shape && `Shape: ${l.shape}`]
                .filter(Boolean)
                .join(' · ') || ' '}
            </span>
            {l.cakeMessage && <div className="rc-writing">Writing: “{l.cakeMessage}”</div>}
            <div className="rc-meta">
              {l.quantity} × {formatOrderMoney(l.unitPrice, v.currency)}
            </div>
          </div>
          <span className="rc-price">{formatOrderMoney(l.lineTotal, v.currency)}</span>
        </li>
      ))}
      {v.addons.map((a, i) => (
        <li className="rc-item" key={`addon-${i}`}>
          <span className="rc-img rc-img-empty">Add-on</span>
          <div className="rc-item-body">
            <span className="rc-item-name">{a.name}</span>
            <span className="rc-meta">Qty {a.quantity}</span>
          </div>
          <span className="rc-price">{formatOrderMoney(a.total, v.currency)}</span>
        </li>
      ))}
    </ul>

    {(v.greetingMessage || v.orderNotes) && (
      <>
        <div className="rc-sec">Notes</div>
        <div className="rc-box">
          {v.greetingMessage && (
            <div>
              <b>Writing / card:</b> “{v.greetingMessage}”
              {v.greetingTo ? ` — To ${v.greetingTo}` : ''}
              {v.greetingFrom ? `, From ${v.greetingFrom}` : ''}
            </div>
          )}
          {v.orderNotes && (
            <div>
              <b>Order notes:</b> {v.orderNotes}
            </div>
          )}
        </div>
      </>
    )}

    <div className="rc-tot">
      <div>
        <span>Subtotal</span>
        <span>{formatOrderMoney(v.subtotal, v.currency)}</span>
      </div>
      {v.addonsTotal > 0 && (
        <div>
          <span>Add-ons</span>
          <span>{formatOrderMoney(v.addonsTotal, v.currency)}</span>
        </div>
      )}
      {!v.isPickup && (
        <div>
          <span>Delivery charge</span>
          <span>{formatOrderMoney(v.deliveryCharge, v.currency)}</span>
        </div>
      )}
      {v.discount > 0 && (
        <div>
          <span>Discount</span>
          <span>− {formatOrderMoney(v.discount, v.currency)}</span>
        </div>
      )}
      <div className="grand">
        <span>Total</span>
        <span>{formatOrderMoney(v.total, v.currency)}</span>
      </div>
    </div>

    <div className="rc-foot">Thank you for choosing CakeNTake · Freshly crafted, beautifully delivered</div>
  </div>
);

/** Open a print-ready receipt in a new window. Returns false if pop-ups are blocked. */
export function printOrderReceipt(order: any): boolean {
  const view = toOrderView(order);
  const html = renderToStaticMarkup(<ReceiptDocument view={view} />);
  const w = window.open('', '_blank', 'width=480,height=760');
  if (!w) return false;
  w.document.open();
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Receipt #${view.number}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
<style>body{margin:0;background:#fff}${RECEIPT_CSS}</style></head><body>${html}
<script>window.onload=function(){setTimeout(function(){window.print()},350)}</script></body></html>`);
  w.document.close();
  return true;
}

interface ModalProps {
  order: any | null;
  open: boolean;
  onClose: () => void;
}

/** In-app receipt preview with a Print button. */
export const OrderReceiptModal: React.FC<ModalProps> = ({ order, open, onClose }) => {
  const view = useMemo(() => (order ? toOrderView(order) : null), [order]);
  return (
    <AnimatePresence>
      {open && view && (
        <motion.div
          className="ov-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="ov-modal ov-modal--receipt"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ov-modal-head">
              <h3>Receipt · #{view.number}</h3>
              <button type="button" className="ov-icon-btn" onClick={onClose} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="ov-modal-body">
              <style>{RECEIPT_CSS}</style>
              <ReceiptDocument view={view} />
            </div>
            <div className="ov-modal-foot">
              <button type="button" className="ov-btn" onClick={onClose}>
                Close
              </button>
              <button
                type="button"
                className="ov-btn ov-btn--primary"
                onClick={() => {
                  if (!printOrderReceipt(order)) window.print();
                }}
              >
                <Printer size={15} /> Print receipt
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderReceiptModal;
