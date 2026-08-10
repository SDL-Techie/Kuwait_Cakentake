import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {

  const navigate = useNavigate();

  useEffect(() => {

    localStorage.removeItem("cart");

    const timer = setTimeout(() => {
      navigate("/orders");
    }, 2000);

    return () => clearTimeout(timer);

  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>✅ Payment Successful</h2>
      <p>Redirecting to your orders...</p>
    </div>
  );
};

export default PaymentSuccess;