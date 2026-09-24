// import React, { useState, ChangeEvent, FormEvent } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios"; //  Clean import of axios
// import toast, { Toaster } from "react-hot-toast";
// import "../Login/Login.css";
// import CakeNTake from "../Login/Cakentake.mp4"
// import { storefrontApi } from "@/src/services/directApiService";

// /* ── Types & Interfaces ── */
// type FormData = {
//   identifier: string; 
//   password: string;
// };

// type EyeIconProps = {
//   open: boolean;
// };

// // Define an interface for what your backend returns on success
// interface UserData {
//   id: number;
//   name: string;
//   email: string;
//   role: string;
//   points?: number;
// }

// interface LoginResponse {
//   token: string;
//   message: string;
//   user: UserData;
// }

// // Define an interface for what your backend returns on error
// interface ErrorResponse {
//   error?: string;
//   message?: string;
// }

// // const BAKERY_IMAGE: string =
// //   "https://i.pinimg.com/736x/8f/9c/35/8f9c359c983169a6bac96bceeda3b16b.jpg";

// /* ── Icons ── */
// function EyeIcon({ open }: EyeIconProps): React.JSX.Element {
//   return open ? (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
//       <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
//       <circle cx="12" cy="12" r="3" />
//     </svg>
//   ) : (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
//       <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8" />
//       <line x1="1" y1="1" x2="23" y2="23" />
//     </svg>
//   );
// }

// function MailOrPhoneIcon(): React.JSX.Element {
//   return (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
//       <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
//       <polyline points="22,6 12,13 2,6" />
//     </svg>
//   );
// }

// function LockIcon(): React.JSX.Element {
//   return (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
//       <rect x="3" y="11" width="18" height="11" rx="2" />
//       <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//     </svg>
//   );
// }

// function ArrowIcon(): React.JSX.Element {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <line x1="5" y1="12" x2="19" y2="12" />
//       <polyline points="12 5 19 12 12 19" />
//     </svg>
//   );
// }

// /* ── Main Component ── */
// export default function LoginPage(): React.JSX.Element {
//   const navigate = useNavigate();

//   const [showPassword, setShowPassword] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [form, setForm] = useState<FormData>({
//     identifier: "", 
//     password: "",
//   });

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
//   e.preventDefault();
//   setLoading(true);

//   try {
//  const res = await storefrontApi.login<LoginResponse>(
//       {
//         email: form.identifier,
//         password: form.password,
//       }
//     );

//     const data = res.data;

 
//     // ✅ STORE EVERYTHING
//     localStorage.setItem("token", data.token);
//     localStorage.setItem("user", JSON.stringify(data.user));
//     localStorage.setItem("userId", JSON.stringify(data.user.id));
//     localStorage.setItem("role", data.user.role); // 🔥 IMPORTANT
// const role = localStorage.getItem("role");

//     toast.success("Login Successful ✅");

//     // 🔥 ROLE BASED REDIRECT (MAIN FIX)
//     // setTimeout(() => {
//     //   if (data.user.role === "ADMIN") {
//     //     navigate("/admin");   // 🧑‍💼 admin page
//     //   } else {
//     //     navigate("/");        // 👤 user homepage
//     //   }
//     // }, 1200);


//     setTimeout(() => {
//   switch (data.user.role) {
//      case "ADMIN":
//       navigate("/admin/dashboard");
//       break;

//     case "SHOP_MANAGER":
//       navigate("/admin");
//       break;

//     case "KITCHEN_STAFF":
//       navigate("/admin/kitchen-order");
//       break;

//     case "SALES_AGENT":
//       navigate("/admin/salesdash");
//       break;

//      case "AGENT":
//       navigate("/admin/agentdashboard"); // 👈 Navigate to /admin
//       break;

//     case "DELIVERY_AGENT":
//       navigate("/admin/deliverydashboard");
//       break;

//     case "DRIVER":
//       navigate("/admin/driverorder");
//       break;

//     case "USER":
//     default:
//       navigate("/");
//       break;
//   }
// }, 1200);

//   } catch (error: unknown) {
//     console.error(error);

//     if (axios.isAxiosError(error) && error.response) {
//       const errorData = error.response.data as ErrorResponse;
//       toast.error(errorData.error || errorData.message || "Login failed ❌");
//     } else {
//       toast.error("Server error ❌");
//     }
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <div className="login-page">
//       <Toaster position="top-center" reverseOrder={false} />
      
//       {/* LEFT FORM PANEL */}
//       <div className="login-form-panel">
//         <h1>Welcome Back</h1>
//         <p className="subtitle">Sign in and continue your sweet journey!</p>

//         <form onSubmit={handleSubmit}>
//           {/* Email or Phone Input Wrapper */}
//           <div className="form-group">
//             <label>Email Address or Phone Number</label>
//             <div className="input-wrapper">
//               <MailOrPhoneIcon />
//               <input
//                 type="text"
//                 name="identifier"
//                 placeholder="you@example.com or 9876543210"
//                 value={form.identifier}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           </div>

//           {/* Password */}
//           <div className="form-group">
//             <label>Password</label>
//             <div className="input-wrapper">
//               <LockIcon />
//               <input
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 placeholder="Enter Password"
//                 value={form.password}
//                 onChange={handleChange}
//                 required
//               />
//               <button
//                 type="button"
//                 className="toggle-password"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 <EyeIcon open={showPassword} />
//               </button>
//             </div>
//           </div>

//           <button className="btn-login" type="submit" disabled={loading}>
//             {loading ? "Logging in..." : "Sign In"} <ArrowIcon />
//           </button>
//         </form>

//         <div className="divider">OR</div>

//         <p className="signup-row">
//           Don't have an account? <Link to="/register">Register</Link>
//         </p>
//       </div>

//       {/* RIGHT IMAGE PANEL */}
//       {/* RIGHT VIDEO PANEL */}
// <div className="login-image-panel">
//   <video
//     src={CakeNTake}   // 👉 your video path
//     autoPlay
//     loop
//     muted
//     playsInline
//     className="login-video"
//   />
// </div>
//     </div>
//   );
// }


import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; //  Clean import of axios
import toast, { Toaster } from "react-hot-toast";
import "../Login/Login.css";
import CakeNTake from "../Login/Cakentake.mp4"
import { storefrontApi } from "@/src/services/directApiService";
import PhoneInput from "../../components/forms/PhoneInput";
import { DEFAULT_PHONE_COUNTRY, buildInternationalPhone, isCompleteLocalPhone, PhoneCountry } from "../../constants/phoneCountries";

/* ── Types & Interfaces ── */
type FormData = {
  identifier: string; 
  password: string;
};

type EyeIconProps = {
  open: boolean;
};

// Define an interface for what your backend returns on success
interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  points?: number;
}

interface LoginResponse {
  token: string;
  message: string;
  user: UserData;
}

// Define an interface for what your backend returns on error
interface ErrorResponse {
  error?: string;
  message?: string;
}

// const BAKERY_IMAGE: string =
//   "https://i.pinimg.com/736x/8f/9c/35/8f9c359c983169a6bac96bceeda3b16b.jpg";

/* ── Icons ── */
function EyeIcon({ open }: EyeIconProps): React.JSX.Element {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function MailOrPhoneIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function LockIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ArrowIcon(): React.JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* ── Main Component ── */
export default function LoginPage(): React.JSX.Element {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<"email" | "phone">("email");
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>(DEFAULT_PHONE_COUNTRY);
  const [phoneLocalNumber, setPhoneLocalNumber] = useState("");
  const [form, setForm] = useState<FormData>({
    identifier: "", 
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
  e.preventDefault();

  if (loginMode === "phone" && !isCompleteLocalPhone(phoneCountry, phoneLocalNumber)) {
    toast.error(`${phoneCountry.name} mobile number must be exactly ${phoneCountry.localLength} digits.`);
    return;
  }

  const identifier = loginMode === "phone"
    ? buildInternationalPhone(phoneCountry, phoneLocalNumber)
    : form.identifier.trim();

  if (!identifier) {
    toast.error("Enter your email address or phone number.");
    return;
  }

  setLoading(true);
  try {
 const res = await storefrontApi.login<LoginResponse>(
      {
        email: identifier,
        password: form.password,
      }
    );

    const data = res.data;

 
    // ✅ STORE EVERYTHING
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("userId", JSON.stringify(data.user.id));
    localStorage.setItem("role", data.user.role); // 🔥 IMPORTANT
const role = localStorage.getItem("role");

    toast.success("Login Successful ✅");

    // 🔥 ROLE BASED REDIRECT (MAIN FIX)
    // setTimeout(() => {
    //   if (data.user.role === "ADMIN") {
    //     navigate("/admin");   // 🧑‍💼 admin page
    //   } else {
    //     navigate("/");        // 👤 user homepage
    //   }
    // }, 1200);


    setTimeout(() => {
  switch (data.user.role) {
     case "ADMIN":
      navigate("/admin/dashboard");
      break;

    case "SHOP_MANAGER":
      navigate("/admin");
      break;

    case "KITCHEN_STAFF":
      navigate("/admin/kitchen-order");
      break;

    case "SALES_AGENT":
      navigate("/admin/salesdash");
      break;

     case "AGENT":
      navigate("/admin/agentdashboard"); // 👈 Navigate to /admin
      break;

    case "DELIVERY_AGENT":
      navigate("/admin/deliverydashboard");
      break;

    case "DRIVER":
      navigate("/admin/driverorder");
      break;

    case "USER":
    default:
      navigate("/");
      break;
  }
}, 1200);

  } catch (error: unknown) {
    console.error(error);

    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ErrorResponse;
      toast.error(errorData.error || errorData.message || "Login failed ❌");
    } else {
      toast.error("Server error ❌");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-page">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* LEFT FORM PANEL */}
      <div className="login-form-panel">
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in and continue your sweet journey!</p>

        <form onSubmit={handleSubmit}>
          <div className="login-id-switch" role="tablist" aria-label="Sign in method">
            <button
              type="button"
              className={loginMode === "email" ? "is-active" : ""}
              onClick={() => setLoginMode("email")}
            >
              Email
            </button>
            <button
              type="button"
              className={loginMode === "phone" ? "is-active" : ""}
              onClick={() => setLoginMode("phone")}
            >
              Phone Number
            </button>
          </div>

          {loginMode === "email" ? (
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <MailOrPhoneIcon />
                <input
                  type="email"
                  name="identifier"
                  placeholder="you@example.com"
                  value={form.identifier}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label>Phone Number</label>
              <PhoneInput
                country={phoneCountry}
                value={phoneLocalNumber}
                onCountryChange={(country) => {
                  setPhoneCountry(country);
                  setPhoneLocalNumber("");
                }}
                onChange={setPhoneLocalNumber}
                required
              />
            </div>
          )}

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <LockIcon />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Sign In"} <ArrowIcon />
          </button>
        </form>

        <div className="divider">OR</div>

        <p className="signup-row">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>

      {/* RIGHT IMAGE PANEL */}
      {/* RIGHT VIDEO PANEL */}
<div className="login-image-panel">
  <video
    src={CakeNTake}   // 👉 your video path
    autoPlay
    loop
    muted
    playsInline
    className="login-video"
  />
</div>
    </div>
  );
}