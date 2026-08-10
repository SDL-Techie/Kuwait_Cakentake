// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import ProductCard from "../../components/ProductCard/ProductCard";
// import { ArrowLeft, Loader2 } from "lucide-react";
// import { getCategoryProducts } from "@/src/services/categoryService";
// import './CategoryProduct.css'

// const CategoryProduct = () => {
//   const { id } = useParams(); // 🔥 now ID
//   const navigate = useNavigate();

//   const [products, setProducts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const user = JSON.parse(localStorage.getItem('user') || '{}');
//   const userRole = user.role || 'customer';

//   useEffect(() => {
//     const fetchProducts = async () => {
//       if (!id) return;

//       setLoading(true);
//       try {
//         const data = await getCategoryProducts(Number(id));

//         const formatted = data.map((p: any) => ({
//           ...p,
//           id: p.id,
//           image: p.image_url,
//           price: userRole === 'RETAILER' ? p.wholesale_price : p.price,
//         }));

//         setProducts(formatted);
//       } catch (err) {
//         console.error("❌ Error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [id]);

//   return (
//     <>
//       <button className="rasi-back-btn" onClick={() => navigate(-1)}>
//         <ArrowLeft size={18} /> Back
//       </button>

//       <div className="rasi-container">
//         <div className="rasi-section-header">
//           <h2>Category Products</h2>
//         </div>

//        <div className="rasi-products-grid">
//   {loading ? (
//     <div className="rasi-loader-container">
//       <Loader2 className="spinner" size={40} />
//       <p>Loading...</p>
//     </div>
//   ) : products.length > 0 ? (
//     products.map((product, index) => (
//       <ProductCard
//         key={product.id}
//         product={product}
//         index={index}
//         isRetailer={userRole === 'RETAILER'}
//       />
//     ))
//   ) : (
//     <div className="rasi-no-products">
//       <h3>No Products Found</h3>
//     </div>
//   )}
// </div>
//       </div>
//     </>
//   );
// };

// export default CategoryProduct;




import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getCategoryProducts } from "@/src/services/categoryService";
import { useCurrency } from '../../context/CurrencyContext';
import './CategoryProduct.css'

const CategoryProduct = () => {
  const { id } = useParams(); // 🔥 now ID
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currency } = useCurrency();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'customer';

  useEffect(() => {
    const fetchProducts = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await getCategoryProducts(Number(id));

        const formatted = data.map((p: any) => ({
          ...p,
          id: p.id,
          image: p.image_url,
          price: userRole === 'RETAILER' ? p.wholesale_price : p.price,
        }));

        setProducts(formatted);
      } catch (err) {
        console.error("❌ Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id, currency]);

  return (
    <>
      <button className="rasi-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="rasi-container">
        <div className="rasi-section-header">
          <h2>Category Products</h2>
        </div>

       <div className="rasi-products-grid">
  {loading ? (
    <div className="rasi-loader-container">
      <Loader2 className="spinner" size={40} />
      <p>Loading...</p>
    </div>
  ) : products.length > 0 ? (
    products.map((product, index) => (
      <ProductCard
        key={product.id}
        product={product}
        index={index}
        isRetailer={userRole === 'RETAILER'}
      />
    ))
  ) : (
    <div className="rasi-no-products">
      <h3>No Products Found</h3>
    </div>
  )}
</div>
      </div>
    </>
  );
};

export default CategoryProduct;