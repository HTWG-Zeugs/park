import React, { useState } from "react";
import SignInForm from "src/components/sign-in/SignInForm";
import "src/components/sign-in/SignInForm.css";
import axios from "axios";
import { useTranslation } from "react-i18next";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { t } = useTranslation();
  const AUTHENTICATION_SERVICE_URL = import.meta.env.VITE_AUTHENTICATION_SERVICE_URL;
  const TENANT_ID = import.meta.env.VITE_TENANT_ID;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const response = await axios.post(AUTHENTICATION_SERVICE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          tenant_id: TENANT_ID,
        }),
      });

      if (response.status === 200) {
        window.location.href = "/home";
      } else {
        setError(response.data.error || t("route_sign_in.sign_in_failed"));
      }
    } catch (err) {
      setError(t("route_sign_in.sign_in_failed"));
    }
  };

  return (
    <SignInForm
      email={email}
      password={password}
      error={error}
      message={message}
      setEmail={setEmail}
      setPassword={setPassword}
      handleSignIn={handleSignIn}
      handlePasswordReset={() => setError(t("route_sign_in.feature_not_supported"))}
    />
  );
};

export default SignIn;
