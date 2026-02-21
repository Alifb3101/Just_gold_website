import React from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";
import { ApiError } from "@/app/api/http";

type LoginForm = {
  email: string;
  password: string;
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = (location.state as any)?.email ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<LoginForm>({
    defaultValues: {
      email: prefillEmail,
      password: "",
    },
  });

  React.useEffect(() => {
    if (prefillEmail) setValue("email", prefillEmail);
  }, [prefillEmail, setValue]);

  const onSubmit = async (values: LoginForm) => {
    try {
      await login(values.email, values.password);
      toast.success("Signed in successfully");
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      const isUnauthorized = err instanceof ApiError && err.status === 401;
      const message = isUnauthorized ? "Invalid credentials" : (err as Error)?.message || "Unable to sign in";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-3xl shadow-[0_25px_60px_rgba(212,175,55,0.18)] border border-[#D4AF37]/25 p-8 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[#B08938]">Welcome back</p>
          <h1 className="text-2xl font-bold text-[#3E2723]">Sign in to continue</h1>
          <p className="text-sm text-[#6B4A3A]">Access your wishlist, orders, and more.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#3E2723]">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-[#D4AF37]/30 bg-white/80 px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#3E2723]">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-[#D4AF37]/30 bg-white/80 px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
              placeholder="••••••••"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F1D08B] text-[#3E2723] font-semibold py-3 shadow-[0_12px_30px_rgba(212,175,55,0.35)] hover:shadow-[0_16px_36px_rgba(212,175,55,0.42)] active:scale-[0.99] transition"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-[#6B4A3A]">
          New here? <Link to="/register" className="font-semibold text-[#C89B3C] hover:text-[#A37A22]">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
