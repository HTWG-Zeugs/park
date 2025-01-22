import React, { useState } from "react";
import { auth } from "src/services/FirebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "src/services/AuthContext";
import "src/routes/SignUp.css";
import { useTranslation } from "react-i18next";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const tenantId = import.meta.env.VITE_TENANT_ID;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("route_sign_up.passwords_do_not_match"));
      return;
    }

    try {
      auth.tenantId = tenantId;
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;

      if (user) {
        const idToken = await user.getIdToken();
        localStorage.setItem("jwt_token", idToken);
        navigate("/home");
      } else {
        setError(t("route_sign_up.user_is_null"));
      }
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError(t("route_sign_up.email_already_exists"));
      } else if (error.code === "auth/invalid-email") {
        setError(t("route_sign_up.invalid_email"));
      } else if (error.code === "auth/weak-password") {
        setError(t("route_sign_up.weak_password"));
      } else {
        setError(t("route_sign_up.sign_up_failed"));
      }
    }
  };

  if (isAuthenticated) {
    navigate("/home");
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="title">{t("route_sign_up.title")}</h1>
        <form onSubmit={handleSignUp} className="signup-form">
          <div className="form-group">
            <label className="form-label">{t("route_sign_up.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t("route_sign_up.password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              {t("route_sign_up.confirm_password")}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="signup-button">
            {t("route_sign_up.sign_up_button")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
