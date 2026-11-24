"use client";
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en"><body style={{ font: "16px/1.6 system-ui", textAlign: "center", padding: "80px 20px", background: "#faf7f2", color: "#2a2a2a" }}>
      <div style={{ fontSize: 44 }}>🫧</div><h1 style={{ fontFamily: "Georgia,serif", fontWeight: 500 }}>Something went wrong</h1>
      <p>Please try again in a moment.</p><button onClick={reset} style={{ border: 0, background: "#2a2a2a", color: "#fff", borderRadius: 999, padding: "12px 26px", fontSize: 15 }}>Try again</button>
    </body></html>
  );
}
