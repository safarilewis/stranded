import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

export default function AccountBar() {
  const navigate = useNavigate();
  const { configured, user } = useAuth();

  if (!configured || !user) {
    return null;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        marginBottom: "28px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "13px",
          color: "rgba(255,255,255,0.42)",
        }}
      >
        Signed in as {user.email}
      </p>
      <button type="button" className="back-link" onClick={handleSignOut}>
        Sign out
      </button>
    </div>
  );
}
