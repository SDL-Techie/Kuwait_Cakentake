import axios from "axios";

let redirecting = false;

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.code;

    // Customer account has been deactivated
    if (
      (status === 401 || status === 403) &&
      errorCode === "ACCOUNT_DEACTIVATED"
    ) {
      if (!redirecting) {
        redirecting = true;

        // Clear customer session
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("customer");

        // Optional: clear other customer-related storage
        // localStorage.removeItem("cart");

        // Redirect to login
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);