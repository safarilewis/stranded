import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ArrivalPage from "./pages/ArrivalPage";
import DestinationPage from "./pages/DestinationPage";
import JournalPage from "./pages/JournalPage";
import MapPage from "./pages/MapPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ThemePage from "./pages/ThemePage";
import TransitionPage from "./pages/TransitionPage";
import Welcome from "./pages/Welcome.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/arrival"
            element={
              <ProtectedRoute>
                <ArrivalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <JournalPage />
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
            path="/transition/:slug"
            element={
              <ProtectedRoute>
                <TransitionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transition/:slug/:themeSlug"
            element={
              <ProtectedRoute>
                <TransitionPage />
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
