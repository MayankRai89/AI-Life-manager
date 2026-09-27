import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearAuthError } from "../redux/slices/authSlice";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    const result = await dispatch(loginUser({ email, password }));
    if (!result.error) {
      navigate("/dashboard");
    }
  };

  const fillDemoAccount = () => {
    setEmail("alex.rivera@example.com");
    setPassword("password123");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white shadow-md shadow-teal-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-500">
            Log in to access your mood-calibrated day plans and tasks
          </p>
        </div>

        {/* Card Form */}
        <Card className="p-6 sm:p-8 space-y-5 border-slate-200 shadow-md">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                dispatch(clearAuthError());
                setEmail(e.target.value);
              }}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                dispatch(clearAuthError());
                setPassword(e.target.value);
              }}
              required
            />

            <Button
              type="submit"
              isLoading={loading}
              className="w-full rounded-xl py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Fill button */}
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium hover:underline cursor-pointer"
            >
              Quick Fill Demo Credentials
            </button>
          </div>
        </Card>

        {/* Register Prompt */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{" "}
          <Link
            to="/register"
            className="font-bold text-teal-600 hover:text-teal-700 transition"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
