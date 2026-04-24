import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useWizardContext } from "../../contexts/WizardContext.tsx";
import { Loader } from "../Loader.tsx";

export const SyncDiff = () => {
  const {
    sourceEnvironmentId,
    sourceApiKey,
    sourceEnvName,
    targetEnvironmentId,
    targetApiKey,
    targetEnvName,
    syncModelEntities,
  } = useWizardContext();

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(500);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const diffResult = (location.state as { diffResult?: string } | null)?.diffResult;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data &&
        typeof event.data === "object" &&
        event.data.type === "setHeight" &&
        typeof event.data.height === "number"
      ) {
        setIframeHeight(event.data.height);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const runSync = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/.netlify/functions/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceEnvironmentId,
          sourceApiKey,
          targetEnvironmentId,
          targetApiKey,
          entities: syncModelEntities,
        }),
      });

      if (!response.ok) {
        const msg = await response.text();
        setError(msg || "Unknown error during sync.");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loader
        title="Syncing…"
        message={`Syncing ${sourceEnvName ?? "source"} → ${targetEnvName ?? "target"}. Do not close this window.`}
      />
    );
  }

  if (success) {
    return (
      <div>
        <h2>Sync Complete</h2>
        <p>
          <strong>{sourceEnvName}</strong> was successfully synced into{" "}
          <strong>{targetEnvName}</strong>.
        </p>
        <button className="button" type="button" onClick={() => void navigate("/")}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Review Diff</h2>
      <p className="not-displayed spaced-5">
        Review the differences between <strong>{sourceEnvName}</strong> and{" "}
        <strong>{targetEnvName}</strong> before syncing.
      </p>

      {diffResult
        ? (
          <iframe
            ref={iframeRef}
            srcDoc={diffResult}
            title="Diff result"
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
            style={{ width: "100%", border: "none", height: iframeHeight }}
          />
        )
        : (
          <p style={{ color: "var(--dark-grey)" }}>No diff available. Go back and generate a diff first.</p>
        )}

      {error && <p style={{ color: "var(--red)", marginTop: "1rem" }}>{error}</p>}

      {showConfirm && (
        <div className="section info" style={{ marginTop: "1rem" }}>
          <p>
            <strong>Warning:</strong> This will overwrite content in{" "}
            <strong>{targetEnvName}</strong>. This action cannot be undone.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
            <button className="button destructive" type="button" onClick={() => void runSync()}>
              Confirm Sync
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="step-navigation">
        <button className="button" type="button" onClick={() => void navigate(-1)}>
          Previous
        </button>
        {!showConfirm && (
          <button
            className="button"
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={!diffResult}
          >
            Run Sync
          </button>
        )}
      </div>
    </div>
  );
};
