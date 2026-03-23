import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Particles from "../components/Particles";
import useAuth from "../hooks/useAuth";
import { supabase, supabaseConfigured } from "../lib/supabase";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/map";

  if (session) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!supabaseConfigured || !supabase) {
      setError("Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment first.");
      return;
    }

    setSubmitting(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigate(redirectTo, { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #091321 0%, #12263e 45%, #1b3650 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "24px",
      }}
    >
      <Particles type="stars" />

      <form
        onSubmit={handleSubmit}
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "460px",
          padding: "36px 30px",
          borderRadius: "24px",
          background: "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <p className="label-upper" style={{ marginBottom: "20px" }}>
          Stranded Vacationers
        </p>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 42px)", fontStyle: "italic", marginBottom: "14px" }}>
          Sign in
        </h1>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "28px" }}>
          Enter your account to reach the island and pick what you need today.
        </p>

        {!supabaseConfigured && (
          <p style={{ color: "#ffd8a8", fontFamily: "var(--font-sans)", fontSize: "13px", marginBottom: "18px" }}>
            Supabase is not configured yet. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
          </p>
        )}

        <label style={{ display: "block", marginBottom: "16px" }}>
          <span className="label-upper" style={{ display: "block", marginBottom: "10px", letterSpacing: "2px" }}>
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={fieldStyle}
          />
        </label>

        <label style={{ display: "block", marginBottom: "16px" }}>
          <span className="label-upper" style={{ display: "block", marginBottom: "10px", letterSpacing: "2px" }}>
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            style={fieldStyle}
          />
        </label>

        {error && (
          <p style={{ color: "#ffc9c9", fontFamily: "var(--font-sans)", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </p>
        )}

        <button type="submit" className="gentle-btn" disabled={submitting} style={{ width: "100%" }}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <p style={{ marginTop: "20px", fontFamily: "var(--font-sans)", fontSize: "14px", color: "var(--text-secondary)" }}>
          Need an account? <Link to="/signup" style={{ textDecoration: "underline" }}>Create one</Link>
        </p>
      </form>
    </div>
  );
}

const fieldStyle = {
  width: "100%",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  padding: "14px 16px",
  fontFamily: "var(--font-sans)",
  fontSize: "15px",
  outline: "none",
};
