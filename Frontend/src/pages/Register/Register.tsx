import { useState, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom"; // Imported useNavigate
import { storefrontApi } from '../../services/directApiService';
import { PhoneIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast"; // Imported toast and Toaster component
import "../Register/Register.css";
import BAKERY_IMAGE from "../Register/RegIMG/Cake.png";

/* ── Types ── */
type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone_no: string; 
  password: string;
};

type EyeIconProps = {
  open: boolean;
};

/* ── Icons ── */
function UserIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,4 12,13 22,4" />
    </svg>
  );
}

function LockIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon({ open }: EyeIconProps): JSX.Element {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ArrowIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* ── Component ── */
export default function Register(): JSX.Element {
  const navigate = useNavigate(); // Hook for programmatically routing paths
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone_no: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (): Promise<void> => {
    // Validation Toast Error
    if (!form.firstName || !form.email || !form.password || !form.phone_no) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const res = await storefrontApi.register( {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone_no: form.phone_no,
        password: form.password,
      });

      // Display backend success message cleanly
      toast.success(res.data.message || "Registration successful!");

      // Reset Form State
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone_no: "",
        password: "",
      });

      // Redirect user to login view shortly after token completion
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err: any) {
      console.error(err);
      const serverError = err.response?.data?.error || "Registration failed";
      toast.error(serverError);
    }
  };

  return (
    <div className="register-page">
      {/* Container wrapper for injectible alerts */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* ── LEFT: Image Panel ── */}
      <div className="register-image-panel">
        <img src={BAKERY_IMAGE} alt="Patisserie pastries" />
        <div className="reg-image-overlay fade-in" />
        <div className="reg-brand-badge slide-down">CakeNTake <ArrowIcon /></div>
        <div className="reg-image-text slide-up">
          <h2>Crafted with<br />love &amp; butter</h2>
          <p>Join thousands of dessert lovers.</p>
        </div>
      </div>

      {/* ── RIGHT: Register Form ── */}
      <div className="register-form-panel">
        <h1>Create Account</h1>
        <p className="subtitle">Join us and start your journey!!</p>

        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <div className="input-wrapper">
              <UserIcon />
              <input
                type="text"
                name="firstName"
                placeholder="Enter First Name"
                value={form.firstName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <div className="input-wrapper">
              <UserIcon />
              <input
                type="text"
                name="lastName"
                placeholder="Enter Last Name"
                value={form.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <div className="input-wrapper">
            <MailIcon />
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <div className="input-wrapper">
            <PhoneIcon size={20} className="lucide-icon" />
            <input
              type="text"
              name="phone_no"
              placeholder="9876543210"
              value={form.phone_no}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="input-wrapper">
            <LockIcon />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter Your Password"
              value={form.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((v) => !v)}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        <button className="btn-register" onClick={handleSubmit}>
          Create Account <ArrowIcon />
        </button>

        <div className="divider">OR</div>

        <p className="signin-row">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}