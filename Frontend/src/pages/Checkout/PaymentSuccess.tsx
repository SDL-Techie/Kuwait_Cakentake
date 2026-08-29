// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const PaymentSuccess = () => {

//   const navigate = useNavigate();

// useEffect(() => {
//     // Clear cart
//     localStorage.removeItem("cart");

//     // Go to previous page after 2 seconds
//     const timer = setTimeout(() => {
//       navigate("/");
//     }, 2000);

//     return () => clearTimeout(timer);
//   }, [navigate]);

//   return (
//     <div style={{ textAlign: "center", marginTop: "100px" }}>
//       <h2>✅ Payment Successful</h2>
//       <p>Redirecting to your orders...</p>
//     </div>
//   );
// };

// export default PaymentSuccess;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear cart
    localStorage.removeItem("cart");

    // Go to the right place based on who made the payment
    const timer = setTimeout(() => {
      const role = localStorage.getItem("role");

      if (role === "SALES_AGENT") {
        navigate("/admin/salesorder");
      } else if (role === "ADMIN" || role === "SHOP_MANAGER") {
        navigate("/admin/orderpipeline");
      } else {
        // regular user / no role
        navigate("/orders");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>✅ Payment Successful</h2>
      <p>Redirecting...</p>
    </div>
  );
};

export default PaymentSuccess;