"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ReactNode, Component, ErrorInfo } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
}

class AuthErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Auth error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // If auth fails, just render children without auth context
      return this.props.children;
    }

    return this.props.children;
  }
}

export function SafeAuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthErrorBoundary>
      <AuthProvider>{children}</AuthProvider>
    </AuthErrorBoundary>
  );
}
