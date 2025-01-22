import React from "react";
// import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface SignInFormProps {
  email: string;
  password: string;
  error: string | null;
  message: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  handleSignIn: (e: React.FormEvent) => void;
  handlePasswordReset: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({
  email,
  password,
  error,
  message,
  setEmail,
  setPassword,
  handleSignIn,
  handlePasswordReset,
}) => {
  // const navigate = useNavigate();

  // const goToRegister = () => {
  //   navigate("/sign-up");
  // };

  const { t } = useTranslation();

  return (
    <div className="login-container">
      <h1 className="title">{t("component_sign_in.title")}</h1>
      <form onSubmit={handleSignIn} className="login-form">
        <div className="form-group">
          <label className="form-label">{t("component_sign_in.email")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">
            {t("component_sign_in.password")}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <button type="submit" className="login-button">
          {t("component_sign_in.sign_in")}
        </button>
      </form>
      <button onClick={handlePasswordReset} className="reset-password-button">
        {t("component_sign_in.forgot_password")}
      </button>
      {/* Sign up is not allowed anymore */}
      {/* <button onClick={goToRegister} className="register-button">
        {t("component_sign_in.sign_up")}
      </button> */}
    </div>
  );
};

export default SignInForm;
