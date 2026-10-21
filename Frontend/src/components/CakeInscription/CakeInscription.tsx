import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cake, CheckCircle2, Circle, Layers, Minus, PenLine, Plus, Sparkles } from 'lucide-react';
import './CakeInscription.css';

/* ==========================================================================
   CakeInscription — same flow as the mobile app's product page.
   1. Number of cakes (1–20)
   2. "Same message" for every cake, or "Different messages" (one per cake).
      Max 80 characters each — same rule as the backend.
   3. Customize your cakes (more than one cake): every extra cake can have
      its own size and flavour. Cake 01 follows the size/flavour at the top.
   Reports one "line" per cake through onChange.
   ========================================================================== */

export interface CIFlavor {
  id: number;
  name: string;
  is_active: boolean;
  price_modifier: number;
}

export interface CIVariant {
  id: number;
  name: string;
  is_active: boolean;
  price_modifier: number;
  flavors: CIFlavor[];
}

export interface CakeLine {
  index: number;
  variant: CIVariant | null;
  flavor: CIFlavor | null;
  message: string;
  unitPrice: number;
}

interface Props {
  variants: CIVariant[];
  /** Size / flavour picked at the top of the page — used for Cake 01. */
  primaryVariant: CIVariant | null;
  primaryFlavor: CIFlavor | null;
  /** Product price before size/flavour extras (add-ons already included). */
  basePrice: number;
  currency: string;
  maxCakes?: number;
  onChange: (lines: CakeLine[]) => void;
}

export const CAKE_MESSAGE_MAX = 80;

type Mode = 'same' | 'different';
interface CakeChoice {
  variantId: number | null;
  flavorId: number | null;
}

const activeFlavors = (v?: CIVariant | null) => (v?.flavors || []).filter((f) => f.is_active);
const pad2 = (n: number) => String(n).padStart(2, '0');
const money = (n: number, c: string) => `${c} ${n.toFixed(String(c).toUpperCase() === 'KWD' ? 3 : 2)}`;

const CakeInscription: React.FC<Props> = ({
  variants,
  primaryVariant,
  primaryFlavor,
  basePrice,
  currency,
  maxCakes = 20,
  onChange,
}) => {
  const [count, setCount] = useState(1);
  const [mode, setMode] = useState<Mode>('same');
  const [sameMessage, setSameMessage] = useState('');
  const [messages, setMessages] = useState<string[]>(['']);
  // Choices for cakes 2..N (index 0 is unused — Cake 01 follows the page).
  const [choices, setChoices] = useState<CakeChoice[]>([{ variantId: null, flavorId: null }]);

  const hasVariants = variants.length > 0;

  const changeCount = (next: number) => {
    const n = Math.min(Math.max(1, next), maxCakes);
    setCount(n);
    setMessages((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? ''));
    setChoices((prev) =>
      Array.from({ length: n }, (_, i) =>
        prev[i] ?? { variantId: primaryVariant?.id ?? null, flavorId: primaryFlavor?.id ?? null }
      )
    );
    if (n === 1) setMode('same');
  };

  const setChoiceVariant = (idx: number, v: CIVariant) => {
    const firstFlavor = activeFlavors(v)[0];
    setChoices((prev) => prev.map((c, i) => (i === idx ? { variantId: v.id, flavorId: firstFlavor?.id ?? null } : c)));
  };

  const setChoiceFlavor = (idx: number, f: CIFlavor) => {
    setChoices((prev) => prev.map((c, i) => (i === idx ? { ...c, flavorId: f.id } : c)));
  };

  const lines: CakeLine[] = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      let variant: CIVariant | null = primaryVariant;
      let flavor: CIFlavor | null = primaryFlavor;
      if (i > 0 && hasVariants) {
        const c = choices[i];
        variant = variants.find((v) => v.id === c?.variantId) ?? null;
        flavor = activeFlavors(variant).find((f) => f.id === c?.flavorId) ?? null;
      }
      const message = (mode === 'same' ? sameMessage : messages[i] || '').trim();
      const unitPrice =
        Number(basePrice || 0) + Number(variant?.price_modifier || 0) + Number(flavor?.price_modifier || 0);
      return { index: i, variant, flavor, message, unitPrice };
    });
  }, [count, mode, sameMessage, messages, choices, variants, primaryVariant, primaryFlavor, basePrice, hasVariants]);

  useEffect(() => {
    onChange(lines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  const preview = lines.map((l) => l.message).filter(Boolean).map((m) => `“${m}”`);
  const uniquePreview = mode === 'same' ? preview.slice(0, 1) : preview;

  return (
    <section className="ci-card">
      <header className="ci-head">
        <span className="ci-head-icon">
          <PenLine size={16} />
        </span>
        <div>
          <small>Personalize your cake</small>
          <h4>Cake Inscription</h4>
          <p>Add a short message for the finishing touch.</p>
        </div>
        <span className="ci-optional">Optional</span>
      </header>

      {/* Number of cakes */}
      <div className="ci-row ci-count">
        <div>
          <strong>Number of Cakes</strong>
          <span>Customize up to {maxCakes} cakes individually</span>
        </div>
        <div className="ci-stepper">
          <button type="button" onClick={() => changeCount(count - 1)} disabled={count <= 1} aria-label="Fewer cakes">
            <Minus size={15} />
          </button>
          <motion.span key={count} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            {count}
          </motion.span>
          <button type="button" onClick={() => changeCount(count + 1)} disabled={count >= maxCakes} aria-label="More cakes">
            <Plus size={15} />
          </button>
        </div>
      </div>

      {/* Same / different messages */}
      <AnimatePresence initial={false}>
        {count > 1 && (
          <motion.div
            className="ci-prefs"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <strong className="ci-label">Cake Message Preferences</strong>
            <span className="ci-hint">Choose one inscription for every cake, or personalize each one.</span>
            <div className="ci-mode-grid">
              {(
                [
                  ['same', 'Same Message', 'One message for all your cakes'],
                  ['different', 'Different Messages', 'A unique message for each cake'],
                ] as [Mode, string, string][]
              ).map(([value, title, sub]) => (
                <button
                  key={value}
                  type="button"
                  className={`ci-mode ${mode === value ? 'is-active' : ''}`}
                  onClick={() => setMode(value)}
                >
                  {mode === value ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  <span>
                    <b>{title}</b>
                    <small>{sub}</small>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message box(es) */}
      {mode === 'same' ? (
        <label className="ci-message">
          <span className="ci-message-top">
            <em>Message</em>
            <em>{sameMessage.length}/{CAKE_MESSAGE_MAX}</em>
          </span>
          <textarea
            rows={3}
            maxLength={CAKE_MESSAGE_MAX}
            placeholder="e.g. Happy Birthday"
            value={sameMessage}
            onChange={(e) => setSameMessage(e.target.value)}
          />
        </label>
      ) : (
        <div className="ci-message-list">
          {messages.map((m, i) => (
            <motion.label
              key={i}
              className="ci-message"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <span className="ci-message-top">
                <em>
                  <Cake size={12} /> Cake {pad2(i + 1)}
                </em>
                <em>{m.length}/{CAKE_MESSAGE_MAX}</em>
              </span>
              <textarea
                rows={2}
                maxLength={CAKE_MESSAGE_MAX}
                placeholder={`Message for Cake ${i + 1} (optional)`}
                value={m}
                onChange={(e) => setMessages((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
              />
            </motion.label>
          ))}
        </div>
      )}

      <div className="ci-preview">
        <Sparkles size={14} />
        <span>Preview</span>
        <p>{uniquePreview.length ? uniquePreview.join(' · ') : 'Your inscription preview will appear here.'}</p>
      </div>

      {/* Per-cake size / flavour */}
      <AnimatePresence initial={false}>
        {count > 1 && hasVariants && (
          <motion.div
            className="ci-custom"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="ci-custom-head">
              <Layers size={16} />
              <div>
                <strong>Customize Your Cakes</strong>
                <span>Each cake can have its own size and flavour.</span>
              </div>
              <em>{count} cakes</em>
            </div>

            {lines.map((line, i) => (
              <div className="ci-cake" key={i}>
                <div className="ci-cake-top">
                  <span>
                    <Cake size={14} /> Cake {pad2(i + 1)}
                  </span>
                  <b>{money(line.unitPrice, currency)}</b>
                </div>

                {i === 0 ? (
                  <p className="ci-cake-note">
                    Uses the size and flavour selected above
                    {line.variant ? ` · ${line.variant.name}` : ''}
                    {line.flavor ? ` · ${line.flavor.name}` : ''}
                  </p>
                ) : (
                  <>
                    <span className="ci-sub">Select variant</span>
                    <div className="ci-pills">
                      {variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          className={`ci-pill ${line.variant?.id === v.id ? 'is-active' : ''}`}
                          onClick={() => setChoiceVariant(i, v)}
                        >
                          {v.name}
                          {Number(v.price_modifier) > 0 ? ` +${Number(v.price_modifier).toFixed(3)}` : ''}
                        </button>
                      ))}
                    </div>
                    {activeFlavors(line.variant).length > 0 && (
                      <>
                        <span className="ci-sub">Select flavour</span>
                        <div className="ci-pills">
                          {activeFlavors(line.variant).map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              className={`ci-pill ${line.flavor?.id === f.id ? 'is-active' : ''}`}
                              onClick={() => setChoiceFlavor(i, f)}
                            >
                              {f.name}
                              {Number(f.price_modifier) > 0 ? ` +${Number(f.price_modifier).toFixed(3)}` : ''}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    <p className="ci-cake-note">
                      {line.variant
                        ? `${line.variant.name}${line.flavor ? ` · ${line.flavor.name}` : ''}`
                        : 'Select a variant to customize this cake'}
                    </p>
                  </>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CakeInscription;