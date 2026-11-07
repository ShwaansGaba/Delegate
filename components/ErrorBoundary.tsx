"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { DelegatoIcon, DelegatoWordmark } from "@/components/ui/DelegatoBrand";
import { RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  isChunkError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      isChunkError: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const msg = error?.message || String(error);
    const isChunk =
      error?.name === "ChunkLoadError" ||
      msg.toLowerCase().includes("chunkloaderror") ||
      msg.toLowerCase().includes("loading chunk") ||
      msg.toLowerCase().includes("failed to fetch dynamically imported module");

    return {
      hasError: true,
      isChunkError: isChunk,
      errorMessage: msg,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Delegato caught an unhandled application error:", error, errorInfo);

    const msg = error?.message || String(error);
    const isChunk =
      error?.name === "ChunkLoadError" ||
      msg.toLowerCase().includes("chunkloaderror") ||
      msg.toLowerCase().includes("loading chunk") ||
      msg.toLowerCase().includes("failed to fetch dynamically imported module");

    if (isChunk && typeof window !== "undefined") {
      const lastReload = sessionStorage.getItem("delegato_chunk_reload_ts");
      const now = Date.now();
      // Auto-reload once within a 10s cooldown window
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem("delegato_chunk_reload_ts", now.toString());
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    if (typeof window !== "undefined") {
      // Clear cache-buster reload timestamp and reload
      sessionStorage.removeItem("delegato_chunk_reload_ts");
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (typeof window !== "undefined") {
      const isGh = window.location.pathname.startsWith("/Delegate");
      window.location.href = isGh ? "/Delegate/organizer/conferences/" : "/organizer/conferences/";
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#1560BD] flex items-center justify-center p-4 sm:p-6 text-white font-sans">
          <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-10 max-w-lg w-full shadow-2xl text-center space-y-6 border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            {/* Logo */}
            <div className="flex flex-col items-center gap-2">
              <DelegatoIcon size="xl" rounded="2xl" className="shadow-lg ring-4 ring-blue-50" />
              <DelegatoWordmark size="lg" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33]">
                {this.state.isChunkError ? "App Update Available" : "Something Went Wrong"}
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                {this.state.isChunkError
                  ? "A new version of Delegato has just been deployed. Please reload the page to load the latest updates."
                  : "An unexpected client issue occurred. Refreshing the platform usually resolves this immediately."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:flex-1 bg-[#1560BD] hover:bg-[#0F4C96] text-white py-3 px-5 rounded-2xl font-heading font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Delegato</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 text-[#0B1B33] py-3 px-5 rounded-2xl font-heading font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Conferences</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
