"use client";

import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { clientAuth } from "@/app/firebase/firebaseClient";

export default function ClientLogout() {
  useEffect(() => {
    const handleUnload = async () => {
      try {
        await signOut(clientAuth);
        await fetch("/api/sessionLogout", { method: "POST", keepalive: true });
      } catch (err) {
        console.error("logout on unload failed", err);
      }
    };

    // Fecha aba / refresh
    window.addEventListener("beforeunload", handleUnload);

    // (opcional) quando a aba some para background definitivamente (mobile)
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        navigator.sendBeacon?.("/api/sessionLogout"); // fire-and-forget
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
