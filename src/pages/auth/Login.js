import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPrefixRoute } from "../../lib/utils/routeUtils";
import { userLogin } from "services/auth";
import { useTheme } from "../../context/ThemeContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { theme } = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must contain minimum 8 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await userLogin({
        email: formData.email,
        password: formData.password,
      });

      const userData = response.data?.user;
      const token = response.data?.token;

      login(userData, token);

      toast.success("Login successful! Welcome back.");

      const user = userData;
      let redirectUrl = searchParams.get("redirect") || "/";

      const prefixRoute = getPrefixRoute(user);
      if (prefixRoute) {
        redirectUrl = prefixRoute;
      }

      navigate(redirectUrl);
    } catch (err) {
      console.log("error", err);
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center p-4 relative" style={{ background: 'linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.12) 0%, rgba(var(--secondary-color-rgb), 0.08) 50%, rgba(var(--primary-color-rgb), 0.15) 100%)' }}>
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ backgroundColor: 'var(--primary-color)' }}></div>
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"
        style={{ animationDelay: "1s", backgroundColor: 'var(--secondary-color)' }}
      ></div>
      <div
        className="absolute -bottom-32 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"
        style={{ animationDelay: "2s", backgroundColor: 'var(--primary-color)' }}
      ></div>

      <div className="flex w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl bg-white/70 backdrop-blur-xl border border-white/50 h-[650px] z-10 transition-all duration-300 hover:shadow-3xl">
        {/* Left Side - Branding */}
        <div
          className="hidden lg:flex lg:w-1/2 relative justify-center items-center p-12"
          style={{ background: `linear-gradient(135deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 70%, #000) 100%)` }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: 'var(--secondary-color)' }}></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: 'var(--secondary-color)' }}></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center items-center text-center">
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl mb-6 shadow-inner border border-white/30">
              <img
                src={theme.logo_url}
                alt={theme.company_name}
                width={280}
                height={180}
                className="object-contain"
                onError={(e) => { e.target.src = '/logo.png'; }}
              />
            </div>
          </div>
        </div>

        {/* Right Side - Form Container */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white/60 backdrop-blur-md">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600">
                Enter your credentials to access the portal
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border ${errors.email ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'} focus:bg-white focus:ring-2 transition-all outline-none shadow-sm`}
                    placeholder="admin@example.com"
                  />
                </div>
                {errors.email && (
                  <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                    {errors.email}
                  </span>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700 block">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white/80 border ${errors.password ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'} focus:bg-white focus:ring-2 transition-all outline-none shadow-sm`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                    {errors.password}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center space-x-2 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                style={{ backgroundColor: 'var(--primary-color)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover-color)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-color)'}
              >
                <span>{isLoading ? "Signing in..." : "Sign In"}</span>
                {!isLoading && <ArrowRight size={20} />}
              </button>
            </form>

            {/* Footer Text */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Protected by secure authentication
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
