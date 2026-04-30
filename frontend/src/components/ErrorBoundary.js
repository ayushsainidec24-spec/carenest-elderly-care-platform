import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Frontend runtime error:", error, info);
  }

  handleReset = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main style={styles.shell}>
        <section style={styles.panel}>
          <p style={styles.eyebrow}>Runtime Error</p>
          <h1 style={styles.title}>Something went wrong</h1>
          <p style={styles.message}>
            The app hit an unexpected browser error. Try signing in again; this
            also clears any old saved session data.
          </p>
          <pre style={styles.error}>{this.state.error.message}</pre>
          <button type="button" style={styles.button} onClick={this.handleReset}>
            Go to login
          </button>
        </section>
      </main>
    );
  }
}

const styles = {
  shell: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "24px",
    background: "#f8fafc",
    color: "#111827",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  panel: {
    width: "min(520px, 100%)",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "28px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  },
  eyebrow: {
    margin: "0 0 8px",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  title: {
    margin: "0 0 10px",
    fontSize: "28px",
    lineHeight: 1.2,
  },
  message: {
    margin: "0 0 16px",
    color: "#4b5563",
    lineHeight: 1.6,
  },
  error: {
    margin: "0 0 18px",
    padding: "12px",
    maxHeight: "140px",
    overflow: "auto",
    background: "#fef2f2",
    color: "#991b1b",
    borderRadius: "6px",
    whiteSpace: "pre-wrap",
  },
  button: {
    border: 0,
    borderRadius: "6px",
    padding: "10px 16px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },
};
