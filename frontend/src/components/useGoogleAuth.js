import { useEffect, useRef, useState } from "react";
import axios from "axios";
import api from "../api";

const GOOGLE_SCRIPT_ID = "google-identity-services";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existing) {
      if (window.google?.accounts?.oauth2) resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services."));
    document.body.appendChild(script);
  });
}

export function useGoogleAuth(onSuccess) {
  const [googleReady, setGoogleReady] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const tokenClientRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setGoogleError("Google login is not configured yet. Add REACT_APP_GOOGLE_CLIENT_ID first.");
      return;
    }

    let isMounted = true;

    loadGoogleScript()
      .then(() => {
        if (!isMounted || !window.google?.accounts?.oauth2) return;

        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "openid email profile",
          prompt: "select_account",
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              setGoogleLoading(false);
              setGoogleError("Google login popup was closed or blocked. Please allow popups and try again.");
              return;
            }

            try {
              const profileResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              });

              const result = await api.post("/auth/google", {
                googleProfile: profileResponse.data,
              });

              if (result.data.error) {
                setGoogleError(result.data.error);
                return;
              }

              localStorage.setItem("user", JSON.stringify(result.data));
              onSuccess(result.data);
            } catch (error) {
              setGoogleError("Google sign-in failed. Please try again.");
            } finally {
              setGoogleLoading(false);
            }
          },
        });

        setGoogleReady(true);
      })
      .catch(() => {
        if (isMounted) {
          setGoogleError("Could not load Google sign-in.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onSuccess]);

  const startGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      setGoogleError("Google login is not configured yet. Add REACT_APP_GOOGLE_CLIENT_ID first.");
      return;
    }

    if (!tokenClientRef.current) {
      setGoogleError("Google sign-in is still loading. Please try again.");
      return;
    }

    setGoogleError("");
    setGoogleLoading(true);
    tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
  };

  return {
    googleReady,
    googleError,
    googleLoading,
    startGoogleSignIn,
  };
}
