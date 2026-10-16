import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Cake, ImageOff, MessageSquareQuote, Sparkles, Star } from 'lucide-react';
import { LINE_TYPE_LABEL, formatOrderMoney, toOrderView, type OrderLine, type OrderView } from '../../utils/orderView';
import './OrderView.css';

/* ==========================================================================
   OrderProducts — "Ordered Products" for every order-details screen.

   Shows menu items, agent-exclusive items AND custom cakes with their
   picture, size, flavour, shape and writing, so kitchen / sales / admin /
   shop manager all see the same thing.

   mode="compact" is the driver view: picture + name + price only
   (client request: drivers don't need full cake details).
   ========================================================================== */

interface Props {
  /** Raw order from the API (preferred) … */
  order?: any;
  /** … or an already-normalized view. */
  view?: OrderView;
  mode?: 'full' | 'compact';
  title?: string;
  showTotals?: boolean;
  className?: string;
}

const Thumb: React.FC<{ src?: string; alt: string; size?: number }> = ({ src, alt, size = 64 }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className="ov-thumb ov-thumb--empty" style={{ width: size, height: size }} aria-label={alt}>
        <ImageOff size={Math.round(size * 0.34)} />
      </span>
    );
  }
  return (
    <img
      className="ov-thumb"
      src={src}
      alt={alt}
      loading="lazy"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
};

const TypeChip: React.FC<{ line: OrderLine }> = ({ line }) => {
  if (line.type === 'MENU') return null;
  return (
    <span className={`ov-type ov-type--${line.type.toLowerCase()}`}>
      {line.type === 'CUSTOM_CAKE' ? <Cake size={11} /> : <Star size={11} />}
      {LINE_TYPE_LABEL[line.type]}
    </span>
  );
};

const OrderProducts: React.FC<Props> = ({ order, view, mode = 'full', title = 'Ordered Products', showTotals = false, className = '' }) => {
  const v = useMemo(() => view ?? toOrderView(order ?? {}), [view, order]);
  const compact = mode === 'compact';

  return (
    <section className={`ov-products ${compact ? 'is-compact' : ''} ${className}`}>
      {title && (
        <header className="ov-products-head">
          <h4>{title}</h4>
          <span className="ov-count">
            {v.lines.length} {v.lines.length === 1 ? 'product' : 'products'}
          </span>
        </header>
      )}

      {v.lines.length === 0 ? (
        <div className="ov-empty">No products on this order.</div>
      ) : (
        <ul className="ov-list">
          {v.lines.map((line, idx) => (
            <motion.li
              key={line.key}
              className={`ov-line ov-line--${line.type.toLowerCase()}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.25 }}
            >
              <Thumb src={line.image} alt={line.name} size={compact ? 56 : 72} />

              <div className="ov-line-body">
                <div className="ov-line-top">
                  <strong className="ov-name">{line.name}</strong>
                  {!compact && <TypeChip line={line} />}
                </div>

                {!compact && (line.size || line.flavour || line.shape) && (
                  <div className="ov-chips">
                    {line.size && (
                      <span className="ov-chip ov-chip--size">
                        Size <b>{line.size}</b>
                      </span>
                    )}
                    {line.flavour && (
                      <span className="ov-chip">
                        Flavour <b>{line.flavour}</b>
                      </span>
                    )}
                    {line.shape && (
                      <span className="ov-chip">
                        Shape <b>{line.shape}</b>
                      </span>
                    )}
                  </div>
                )}

                {!compact && line.cakeMessage && (
                  <p className="ov-writing">
                    <MessageSquareQuote size={13} /> Writing: <q>{line.cakeMessage}</q>
                  </p>
                )}
                {!compact && line.instruction && (
                  <p className="ov-instruction">
                    <Sparkles size={12} /> {line.instruction}
                  </p>
                )}

                {compact ? (
                  <span className="ov-qty">Qty {line.quantity}</span>
                ) : (
                  <span className="ov-qty">
                    {line.quantity} × {formatOrderMoney(line.unitPrice, v.currency)}
                  </span>
                )}
              </div>

              <span className="ov-line-total">{formatOrderMoney(line.lineTotal, v.currency)}</span>
            </motion.li>
          ))}
        </ul>
      )}

      {!compact && v.addons.length > 0 && (
        <div className="ov-addons">
          <span className="ov-addons-title">Add-ons</span>
          {v.addons.map((a, i) => (
            <div className="ov-addon" key={`${a.name}-${i}`}>
              <span>
                {a.name} × {a.quantity}
              </span>
              <span>{formatOrderMoney(a.total, v.currency)}</span>
            </div>
          ))}
        </div>
      )}

      {showTotals && (
        <dl className="ov-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatOrderMoney(v.subtotal, v.currency)}</dd>
          </div>
          {v.addonsTotal > 0 && (
            <div>
              <dt>Add-ons</dt>
              <dd>{formatOrderMoney(v.addonsTotal, v.currency)}</dd>
            </div>
          )}
          {v.deliveryCharge > 0 && (
            <div>
              <dt>Delivery</dt>
              <dd>{formatOrderMoney(v.deliveryCharge, v.currency)}</dd>
            </div>
          )}
          {v.discount > 0 && (
            <div className="is-discount">
              <dt>Discount</dt>
              <dd>− {formatOrderMoney(v.discount, v.currency)}</dd>
            </div>
          )}
          <div className="is-total">
            <dt>Total</dt>
            <dd>{formatOrderMoney(v.total, v.currency)}</dd>
          </div>
        </dl>
      )}
    </section>
  );
};

export default OrderProducts;

/* --------------------------------------------------------------------------
   OrderNotesBlock — keeps the cake writing, order notes and the address
   "delivery notes" clearly separate (client: cake message was shown inside
   the address Delivery Notes field).
   -------------------------------------------------------------------------- */
export const OrderNotesBlock: React.FC<{ order?: any; view?: OrderView; hideAddressNotes?: boolean }> = ({
  order,
  view,
  hideAddressNotes,
}) => {
  const v = useMemo(() => view ?? toOrderView(order ?? {}), [view, order]);
  const writing = v.greetingMessage;
  if (!writing && !v.orderNotes && (hideAddressNotes || !v.addressNotes) && !v.greetingTo && !v.greetingFrom) return null;
  return (
    <div className="ov-notes">
      {(writing || v.greetingTo || v.greetingFrom) && (
        <div className="ov-note ov-note--writing">
          <span className="ov-note-label">Cake message / card</span>
          {writing && <p>“{writing}”</p>}
          {(v.greetingTo || v.greetingFrom) && (
            <small>
              {v.greetingTo && <>To: {v.greetingTo} </>}
              {v.greetingFrom && <>· From: {v.greetingFrom}</>}
            </small>
          )}
        </div>
      )}
      {v.orderNotes && (
        <div className="ov-note">
          <span className="ov-note-label">Order notes</span>
          <p>{v.orderNotes}</p>
        </div>
      )}
      {!hideAddressNotes && v.addressNotes && (
        <div className="ov-note ov-note--address">
          <span className="ov-note-label">Delivery notes (address)</span>
          <p>{v.addressNotes}</p>
        </div>
      )}
    </div>
  );
};
