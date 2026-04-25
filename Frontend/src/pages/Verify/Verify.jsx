import React, { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import './Verify.css';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { url, clearCart } = useContext(StoreContext);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        navigate("/cart");
        return;
      }

      const response = await fetch(`${url}/api/order/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });
      const result = await response.json();

      if (result.success) {
        clearCart();
        navigate("/");
      } else {
        navigate("/cart");
      }
    }

    verifyPayment();
  }, [clearCart, navigate, searchParams, url]);

  return (
    <div className="verify">
      <div className="spinner"></div>
    </div>
  )
}

export default Verify;
