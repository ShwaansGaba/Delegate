"use client";

import React, { useEffect } from "react";
import { AppProvider } from "@/lib/AppContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Proactively intercept chunk load errors across dynamic imports and router transitions
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      let errorMsg = "";
      if ("message" in event && event.message) {
        errorMsg = event.message;
      } else if ("reason" in event && event.reason) {
        errorMsg = event.reason.message || String(event.reason);
      }

      const isChunk =
        errorMsg.includes("ChunkLoadError") ||
        errorMsg.toLowerCase().includes("loading chunk") ||
        errorMsg.toLowerCase().includes("failed to fetch dynamically imported module");

      if (isChunk && typeof window !== "undefined") {
        const lastReload = sessionStorage.getItem("delegato_chunk_reload_ts");
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem("delegato_chunk_reload_ts", now.toString());
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handleChunkError);
    window.addEventListener("unhandledrejection", handleChunkError);

    return () => {
      window.removeEventListener("error", handleChunkError);
      window.removeEventListener("unhandledrejection", handleChunkError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>{children}</AppProvider>
    </ErrorBoundary>
  );
}
