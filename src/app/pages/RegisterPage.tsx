import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";

type RegisterForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterForm) => {
    try {
      await registerUser(values.name, values.email, values.password, values.phone);
      toast.success("Account created. Please sign in.");
      navigate("/login", { replace: true, state: { email: values.email } });
    } catch (err) {
      const message = (err as Error)?.message || "Unable to register";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-3xl shadow-[0_25px_60px_rgba(212,175,55,0.18)] border border-[#D4AF37]/25 p-8 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[#B08938]">Join us</p>
          <h1 className="text-2xl font-bold text-[#3E2723]">Create your account</h1>
          <p className="text-sm text-[#6B4A3A]">Unlock wishlist, faster checkout, and more.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#3E2723]">Full name</label>
            <input
              type="text"
              className="w-full rounded-xl border border-[#D4AF37]/30 bg-white/80 px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
              placeholder="Jane Doe"
              {...register("name", { required: "Name is required", minLength: { value: 2, message: "Enter at least 2 characters" } })}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

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
            <label className="text-sm font-semibold text-[#3E2723]">Phone number</label>
            <input
              type="tel"
              className="w-full rounded-xl border border-[#D4AF37]/30 bg-white/80 px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
              placeholder="+971 50 123 4567"
              {...register("phone", {
                required: "Phone number is required",
                minLength: { value: 6, message: "Enter a valid phone" },
              })}
            />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#3E2723]">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-[#D4AF37]/30 bg-white/80 px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
              placeholder="At least 8 characters"
              {...register("password", { required: "Password is required", minLength: { value: 8, message: "Minimum 8 characters" } })}
            />
            {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F1D08B] text-[#3E2723] font-semibold py-3 shadow-[0_12px_30px_rgba(212,175,55,0.35)] hover:shadow-[0_16px_36px_rgba(212,175,55,0.42)] active:scale-[0.99] transition"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-[#6B4A3A]">
          Already registered? <Link to="/login" className="font-semibold text-[#C89B3C] hover:text-[#A37A22]">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
