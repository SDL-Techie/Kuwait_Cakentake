import { useCallback, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../services/api";

const CustomerSessionMonitor = () => {
  const checkAccountStatus = useCallback(async () => {
    const token = localStorage.getItem("token");

    // No logged-in customer
    if (!token) {
      return;
    }

    try {
      await axios.get(`${BASE_URL}/customers/me/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Customer account is active.");
    } catch (error: any) {
      // ACCOUNT_DEACTIVATED is handled by axiosInterceptor
      console.log("Account status check failed:", error);
    }
  }, []);

  useEffect(() => {
    // Check immediately when the website loads
    checkAccountStatus();

    // Check every 30 seconds
    const interval = window.setInterval(() => {
      checkAccountStatus();
    }, 30 * 1000);

    // Check when the customer comes back to the website tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAccountStatus();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [checkAccountStatus]);

  return null;
};

export default CustomerSessionMonitor;