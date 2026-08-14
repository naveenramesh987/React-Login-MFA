import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { MfaPage } from "./pages/MfaPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RequireStatus } from "./routes/RequireStatus";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/mfa" element={<RequireStatus status="mfaRequired" redirectTo="/login"><MfaPage /></RequireStatus>} />
        <Route path="/dashboard" element={<RequireStatus status="authenticated" redirectTo="/login"><DashboardPage /></RequireStatus>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
