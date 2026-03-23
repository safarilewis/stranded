import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import DestinationPage from "./pages/DestinationPage";
import MapPage from "./pages/MapPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ThemePage from "./pages/ThemePage";
import Welcome from "./pages/Welcome";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/destination/:slug"
            element={
              <ProtectedRoute>
                <ThemePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/destination/:slug/:themeSlug"
            element={
              <ProtectedRoute>
                <DestinationPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
