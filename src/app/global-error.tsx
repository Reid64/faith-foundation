"use client";

import { useEffect } from "react";

// global-error replaces the root layout entirely, so it must render its own
// <html> and <body>. Tailwind utilities and the next/font CSS variables from
// the layout are not guaranteed here, so brand colors are applied inline to
// ensure the navy/gold treatment always renders, even as a last-resort boundary.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6rem 1.5rem",
          textAlign: "center",
          color: "#ffffff",
          background:
            "radial-gradient(120% 120% at 80% 0%, #26395E 0%, #16243F 45%, #0A1322 100%)",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ maxWidth: "42rem", margin: "0 auto" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "9999px",
              border: "1px solid rgba(201, 162, 39, 0.5)",
              backgroundColor: "rgba(201, 162, 39, 0.1)",
              padding: "0.375rem 1rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#C9A227",
            }}
          >
            Something went wrong
          </span>
          <h1
            style={{
              marginTop: "2rem",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "2.5rem",
              fontWeight: 800,
              letterSpacing: "-0.015em",
              lineHeight: 1.1,
            }}
          >
            A critical error occurred
          </h1>
          <p
            style={{
              margin: "1.25rem auto 0",
              maxWidth: "32rem",
              fontSize: "1rem",
              lineHeight: 1.6,
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            We’re sorry for the inconvenience. Please try reloading the page. If
            the problem persists, contact the FAITH Foundation team.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: "1rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.75rem",
                color: "rgba(255, 255, 255, 0.4)",
              }}
            >
              Reference: {error.digest}
            </p>
          )}
          <div style={{ marginTop: "2.5rem" }}>
            <button
              onClick={reset}
              style={{
                cursor: "pointer",
                borderRadius: "9999px",
                border: "1px solid rgba(226, 196, 92, 0.5)",
                background:
                  "linear-gradient(100deg, #9C7C1F 0%, #C9A227 38%, #E2C45C 60%, #C9A227 100%)",
                padding: "1rem 2rem",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#16243F",
                boxShadow: "0 14px 40px -14px rgba(201, 162, 39, 0.55)",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}


