import React, { useState } from "react";
import { auth } from "src/services/FirebaseConfig";
import SignInForm from "src/components/sign-in/SignInForm";
import "src/components/sign-in/SignInForm.css";
import { useTranslation } from "react-i18next";
import axios from "axios";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  const AUTHENTICATION_BACKEND = import.meta.env
    .VITE_AUTHENTICATION_SERVICE_URL;

  const TENANT_TYPE = import.meta.env.VITE_TENANT_TYPE;
  const TENANT_ID = import.meta.env.VITE_TENANT_ID;

  async function setTenantId(email: string) {
    if (TENANT_ID != "NOT_SET") {
      auth.tenantId = TENANT_ID;
      return;
    }
    
    const response = await axios.get(`${AUTHENTICATION_BACKEND}/tenant-id/${email}`);
    if (response.data){
      const { tenantId, tenantType } = response.data;
      if (tenantType !== TENANT_TYPE) {
        setError(t("route_sign_in.invalid_tenant_type"));
        return;
      }
      auth.tenantId = tenantId;
    }
    else {
      console.error(`Failed to fetch tenant id for user: ${email}`);
    }
    
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      await setTenantId(email);
      const userCredential = await auth.signInWithEmailAndPassword(
        email,
        password
      );

      const user = userCredential.user;

      if (user) {
        const idToken = await user.getIdToken();
        localStorage.setItem("jwt_token", idToken);
        window.location.href = "/home";
      } else {
        setError(t("route_sign_in.user_is_null"));
      }

      window.location.href = "/home";
    } catch (error: unknown) {
      const code = (error as { code: string }).code;
      if (code === "auth/user-not-found") {
        setError(t("route_sign_in.user_not_found"));
      } else if (code === "auth/wrong-password") {
        setError(t("route_sign_in.wrong_password"));
      } else {
        setError(t("route_sign_in.sign_in_failed"));
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError(t("route_sign_in.email_required"));
      return;
    }

    try {
      await setTenantId(email);
      await auth.sendPasswordResetEmail(email);
      setMessage(t("route_sign_in.password_reset_email_sent"));
    } catch {
      setError(t("route_sign_in.password_reset_failed"));
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
      handlePasswordReset={handlePasswordReset}
    />
  );
};

export default SignIn;
