import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { configured, loading, session } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #0a1a2e 0%, #12263e 40%, #1a3048 100%)",
        }}
      >
        <p className="label-upper">Loading session</p>
      </div>
    );
  }

  if (!configured) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (!session) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return children;
}
