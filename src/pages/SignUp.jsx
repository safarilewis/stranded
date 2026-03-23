import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Particles from "../components/Particles";
import useAuth from "../hooks/useAuth";
import { supabase, supabaseConfigured } from "../lib/supabase";

export default function SignUp() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    return <Navigate to="/map" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!supabaseConfigured || !supabase) {
      setError("Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment first.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      navigate("/map", { replace: true });
      return;
    }

    setMessage("Account created. Check your email if Supabase confirmation is enabled, then sign in.");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0b1624 0%, #17324b 45%, #204660 100%)",
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
          Stranded?
        </p>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 42px)", fontStyle: "italic", marginBottom: "14px" }}>
          Create account
        </h1>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "28px" }}>
          Sign up first, then the island and the guided spaces stay behind your session.
        </p>

        <label style={{ display: "block", marginBottom: "16px" }}>
          <span className="label-upper" style={{ display: "block", marginBottom: "10px", letterSpacing: "2px" }}>
            Email
          </span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={fieldStyle} />
        </label>

        <label style={{ display: "block", marginBottom: "16px" }}>
          <span className="label-upper" style={{ display: "block", marginBottom: "10px", letterSpacing: "2px" }}>
            Password
          </span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} style={fieldStyle} />
        </label>

        {error && (
          <p style={{ color: "#ffc9c9", fontFamily: "var(--font-sans)", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </p>
        )}

        {message && (
          <p style={{ color: "#d8f5a2", fontFamily: "var(--font-sans)", fontSize: "13px", marginBottom: "16px" }}>
            {message}
          </p>
        )}

        <button type="submit" className="gentle-btn" disabled={submitting} style={{ width: "100%" }}>
          {submitting ? "Creating..." : "Create account"}
        </button>

        <p style={{ marginTop: "20px", fontFamily: "var(--font-sans)", fontSize: "14px", color: "var(--text-secondary)" }}>
          Already have an account? <Link to="/signin" style={{ textDecoration: "underline" }}>Sign in</Link>
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
