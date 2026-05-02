import { useEffect, useRef, useState } from "react";
import api from "../api";
import { createGoogleUserFromCredential, saveCurrentUser } from "../utils/localAuth";

const GOOGLE_SCRIPT_ID = "google-identity-services";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "800390762971-hpf901a795999hko96759ltapm6oudlr.apps.googleusercontent.com";

let googleScriptPromise = null;

function loadGoogleScript() {
  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existing && window.google?.accounts?.id) {
      resolve();
      return;
    }

    if (existing && !window.google?.accounts?.id) {
      // If the script is present but not initialized, remove and reload it.
      existing.remove();
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;

    const handleInit = () => {
      let attempts = 0;
      const maxAttempts = 30;
      const checkInterval = 150;

      const checkGoogle = () => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          resolve();
          return;
        }

        attempts += 1;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error("Google Identity Services did not initialize after script load. Please ensure popups are allowed and your browser is not blocking Google.") );
        }
      };

      const interval = setInterval(checkGoogle, checkInterval);
    };

    script.onload = handleInit;
    script.onerror = () => reject(new Error("Failed to load Google Identity Services script. Check your internet connection and browser settings."));
    document.body.appendChild(script);
  });

  return googleScriptPromise;
}

export function useGoogleAuth(onSuccess) {
  const [googleReady, setGoogleReady] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [showGoogleError, setShowGoogleError] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleButtonRef = useRef(null);
  const onSuccessRef = useRef(onSuccess);

  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setGoogleError("Google login is not configured yet. Add REACT_APP_GOOGLE_CLIENT_ID to your environment.");
      setShowGoogleError(false);
      setGoogleReady(false);
      return;
    }

    let isMounted = true;

    loadGoogleScript()
      .then(() => {
        if (!isMounted || !window.google?.accounts?.id) {
          setGoogleError("Google Identity Services failed to load. Please refresh the page.");
          setShowGoogleError(false);
          return;
        }

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            setGoogleLoading(true);
            if (!response?.credential) {
              setGoogleError("Google sign-in did not return a valid credential. Please try again.");
              setShowGoogleError(true);
              setGoogleLoading(false);
              return;
            }

            try {
              const result = await api.post("/auth/google", {
                credential: response.credential,
              });

              if (result.data.error) {
                setGoogleError(result.data.error);
                setShowGoogleError(true);
                return;
              }

              saveCurrentUser(result.data);
              onSuccessRef.current(result.data);
            } catch (error) {
              const isNetworkError =
                error?.code === "ERR_NETWORK" || error?.message === "Network Error";

              if (isNetworkError) {
                const localGoogleUser = createGoogleUserFromCredential(response.credential);
                if (localGoogleUser) {
                  onSuccessRef.current(localGoogleUser);
                  return;
                }
              }

              setGoogleError(
                isNetworkError
                  ? "Google sign-in worked, but the backend is not reachable. Please try again shortly."
                  : error?.response?.data?.error ||
                  error?.message ||
                  "Google sign-in failed. Please try again."
              );
              setShowGoogleError(true);
            } finally {
              setGoogleLoading(false);
            }
          },
          cancel_on_tap_outside: false,
        });

        if (googleButtonRef.current) {
          googleButtonRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            type: "standard",
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: 280,
          });
        }

        setGoogleReady(true);
      })
      .catch((error) => {
        if (isMounted) {
          setGoogleReady(false);
          setGoogleError(
            error?.message || "Could not load Google sign-in. Please check your internet connection."
          );
          setShowGoogleError(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const startGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      setGoogleError("Google login is not configured yet. Add REACT_APP_GOOGLE_CLIENT_ID first.");
      setShowGoogleError(true);
      return;
    }

    if (!window.google?.accounts?.id) {
      setGoogleError("Google sign-in is still loading. Please try again.");
      setShowGoogleError(true);
      return;
    }

    setGoogleError("");
    setShowGoogleError(false);
    setGoogleLoading(true);

    try {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleLoading(false);
        }
      });
    } catch (error) {
      setGoogleLoading(false);
      setGoogleError(
        error?.message || "Google sign-in could not start. Please refresh and try again."
      );
      setShowGoogleError(true);
    }
  };

  return {
    googleReady,
    googleError: showGoogleError ? googleError : "",
    googleLoading,
    googleButtonRef,
    startGoogleSignIn,
  };
}
