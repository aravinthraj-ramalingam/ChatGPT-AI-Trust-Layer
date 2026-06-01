import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div className="landing">
      <div className="landing-hero">
        <h1>What are you working on?</h1>
        <p>
          Answer first. Confirm how you will use the output. Verify only what
          changes your decision.
        </p>
        <div style={{ textAlign: "center" }}>
          <Link to="/chat" className="btn-primary" style={{ textDecoration: "none" }}>
            Open chat
          </Link>
        </div>
      </div>
    </div>
  );
}
