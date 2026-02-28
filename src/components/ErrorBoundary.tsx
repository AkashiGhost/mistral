"use client";
import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary] Caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: "100dvh",
          backgroundColor: "#0a0a0a", color: "#666", padding: "2rem", textAlign: "center",
        }}>
          <p style={{ fontSize: "1rem", fontStyle: "italic", marginBottom: "1.5rem" }}>
            Something went wrong. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "none", border: "1px solid #333", color: "#888",
              padding: "0.5rem 1.5rem", borderRadius: "4px", cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
