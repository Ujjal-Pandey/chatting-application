import { useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

function ClientAuth({ isLogin, onSwitchMode, onAuthSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const update = (field) => (event) =>
    setForm((value) => ({ ...value, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.email || !form.password || (!isLogin && !form.name))
      return setError("Please complete all required fields.");
    if (!isLogin && form.password !== form.confirmPassword)
      return setError("Passwords do not match.");
    setLoading(true);
    const payload = isLogin
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password };
    const result = await apiRequest(
      isLogin ? "/api/auth/login" : "/api/auth/register",
      payload,
    );
    setLoading(false);
    if (result.error) return setError(result.error);
    if (isLogin) {
      login(result.user, result.token);
      onAuthSuccess();
    } else {
      onSwitchMode();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4 py-8 flex items-center justify-center text-slate-800">
      <section className="w-full max-w-md rounded-[28px] border border-white/80 bg-white/95 p-8 shadow-2xl shadow-indigo-200/50 backdrop-blur md:p-10">
        <div className="mb-7 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl text-white shadow-lg shadow-indigo-300">
            ✦
          </div>
          <div>
            <h1 className="text-2xl font-bold">Chatty</h1>
            <p className="text-xs text-slate-400">Connect with friends</p>
          </div>
        </div>
        <div className="mb-6 flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => !isLogin && onSwitchMode()}
            className={`flex-1 border-b-2 py-3 text-sm font-semibold ${isLogin ? "border-indigo-500 text-slate-800" : "border-transparent text-slate-400"}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => isLogin && onSwitchMode()}
            className={`flex-1 border-b-2 py-3 text-sm font-semibold ${!isLogin ? "border-indigo-500 text-slate-800" : "border-transparent text-slate-400"}`}
          >
            Create account
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <Field
              label="Full name"
              value={form.name}
              onChange={update("name")}
              placeholder="John Doe"
              autoComplete="name"
            />
          )}
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Field
            label="Password"
            type="password"
            value={form.password}
            onChange={update("password")}
            placeholder="At least 6 characters"
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
          {!isLogin && (
            <Field
              label="Confirm password"
              type="password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              placeholder="Confirm password"
              autoComplete="new-password"
            />
          )}
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600"
            >
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-slate-500">
          {isLogin ? "New to Chatty?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={onSwitchMode}
            className="font-semibold text-indigo-600 hover:underline"
          >
            {isLogin ? "Create one" : "Sign in"}
          </button>
        </p>
      </section>
    </main>
  );
}

function Field({ label, type = "text", ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </span>
      <input
        type={type}
        required
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
        {...props}
      />
    </label>
  );
}
export default ClientAuth;
