import { useContext } from "react";
import AuthContext from "../context/auth-context";

export default function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return value;
}
