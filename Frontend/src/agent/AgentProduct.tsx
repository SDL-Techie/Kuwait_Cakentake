import React, { useEffect, useState } from "react";
import { getMyAgentProducts, AgentProduct as AgentProductRecord } from "../services/agentService";
import ProductCard from "../components/ProductCard/ProductCard"; 
import "./AgentProduct.css";

/* ─────────────────────────────────────────────────────────────────────────
 * NOTE ON API SHAPE
 * ─────────────────────────────────────────────────────────────────────────
 * The backend's AgentProduct model (models/agentproduct.py) is a flat,
 * standalone product row created directly for an agent — it does NOT wrap
 * an existing Product row and has no category / subcategory / variants /
 * currency fields. GET /agent/my-products (agentService.getMyAgentProducts)
 * returns these flat records directly, scoped to the logged-in agent via
 * the JWT — no agentId needs to be passed.
 *
 * ProductCard was built for the full shared-catalog Product shape, so each
 * AgentProduct record is normalized below into a ProductCard-compatible
 * object with safe defaults for fields the agent-product model doesn't have.
 * If ProductCard requires non-null category/subcategory/variants, adjust
 * the mapper (or ProductCard's prop types) accordingly.
 * ───────────────────────────────────────────────────────────────────────── */

interface AgentProductDisplay {
  id: number;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  category: Record<string, any> | null;
  subcategory: Record<string, any> | null;
  variants: any[];
  is_active: boolean;
}

const DEFAULT_CURRENCY = "KWD"; // AgentProduct has no currency field; adjust if backend adds one

function mapAgentProductToDisplay(item: AgentProductRecord): AgentProductDisplay {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    currency: DEFAULT_CURRENCY,
    image_url: item.image,
    category: null,
    subcategory: null,
    variants: [],
    is_active: item.is_active,
  };
}

export default function AgentProduct(): React.JSX.Element {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const agentId = user?.id;

  const [products, setProducts] = useState<AgentProductDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAssignedProducts = async () => {
      setLoading(true);
      setError(false);

      try {
        const records = await getMyAgentProducts();
        const mapped = records.map(mapAgentProductToDisplay);

        if (isMounted) {
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to load assigned agent products:", err);
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAssignedProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="agent-product-page">
        <div className="agent-product-status">
          <div className="agent-product-spinner" aria-hidden="true" />
          <p>Loading assigned products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agent-product-page">
        <div className="agent-product-status agent-product-status--error">
          <p>Unable to load assigned products.</p>
          <p>Please try again later.</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="agent-product-page">
        <div className="agent-product-status">
          <p>No products have been assigned to you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-product-page">
      <h1 className="agent-product-heading">My Assigned Products</h1>
      <div className="agent-product-grid">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            isRetailer={false}
            userId={agentId}
          />
        ))}
      </div>
    </div>
  );
}