import { useState } from "react";
import type { EnvironmentConfig } from "../../types/appConfig.ts";

interface SyncPanelProps {
  readonly sourceEnv: EnvironmentConfig;
  readonly targetEnv: EnvironmentConfig;
}

type SyncStatus = "idle" | "running" | "success" | "error";

interface ContentType {
  readonly id: string;
  readonly codename: string;
  readonly name: string;
}

export const SyncPanel = ({ sourceEnv, targetEnv }: SyncPanelProps) => {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [log, setLog] = useState<ReadonlyArray<string>>([]);
  const [contentTypes, setContentTypes] = useState<ReadonlyArray<ContentType>>([]);
  const [selectedTypes, setSelectedTypes] = useState<ReadonlyArray<string>>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  const appendLog = (line: string) => setLog((prev) => [...prev, line]);

  const loadContentTypes = async () => {
    setIsLoadingTypes(true);
    try {
      const response = await fetch(
        `https://manage.kontent.ai/v2/projects/${sourceEnv.environmentId}/types`,
        {
          headers: {
            Authorization: `Bearer ${sourceEnv.managementApiKey}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to load content types: ${response.status} ${response.statusText}`);
      }
      const data = await response.json() as { types: ReadonlyArray<{ id: string; codename: string; name: { value: string } }> };
      setContentTypes(
        data.types.map((t) => ({ id: t.id, codename: t.codename, name: t.name.value })),
      );
    } catch (err) {
      appendLog(`Error loading content types: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoadingTypes(false);
    }
  };

  const toggleType = (codename: string) => {
    setSelectedTypes((prev) =>
      prev.includes(codename) ? prev.filter((c) => c !== codename) : [...prev, codename],
    );
  };

  const handleSync = async () => {
    setStatus("running");
    setLog([]);

    try {
      appendLog(`Starting sync: ${sourceEnv.name} → ${targetEnv.name}`);

      if (selectedTypes.length > 0) {
        appendLog(`Filtering to content types: ${selectedTypes.join(", ")}`);
      }

      // ── Integration point ────────────────────────────────────────────────────
      // Replace this block with the data-ops-gui sync logic. The data-ops-gui
      // components manage environmentId/apiKey in local form state — swap those
      // with sourceEnv.environmentId / sourceEnv.managementApiKey (and target).
      //
      // Example: call the data-ops sync function if it exposes a programmatic API:
      //   await syncEnvironments({
      //     sourceEnvironmentId: sourceEnv.environmentId,
      //     sourceApiKey: sourceEnv.managementApiKey,
      //     targetEnvironmentId: targetEnv.environmentId,
      //     targetApiKey: targetEnv.managementApiKey,
      //     contentTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
      //   });
      //
      // For now this validates connectivity to both environments:
      const [srcRes, tgtRes] = await Promise.all([
        fetch(`https://manage.kontent.ai/v2/projects/${sourceEnv.environmentId}/types`, {
          headers: { Authorization: `Bearer ${sourceEnv.managementApiKey}` },
        }),
        fetch(`https://manage.kontent.ai/v2/projects/${targetEnv.environmentId}/types`, {
          headers: { Authorization: `Bearer ${targetEnv.managementApiKey}` },
        }),
      ]);

      if (!srcRes.ok) {
        throw new Error(`Source environment auth failed: ${srcRes.status} ${srcRes.statusText}`);
      }
      if (!tgtRes.ok) {
        throw new Error(`Target environment auth failed: ${tgtRes.status} ${tgtRes.statusText}`);
      }

      appendLog("Connected to both environments successfully.");
      appendLog("Sync logic goes here — wire in data-ops-gui components.");
      appendLog("Done.");
      setStatus("success");
    } catch (err) {
      appendLog(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setLog([]);
  };

  return (
    <div className="panel">
      <p className="panel__description">
        Synchronise content from <strong>{sourceEnv.name}</strong> into{" "}
        <strong>{targetEnv.name}</strong>. This will overwrite matching content in the target
        environment.
      </p>

      <div className="panel__section">
        <div className="panel__section-header">
          <span className="panel__section-title">Content type filter</span>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => void loadContentTypes()}
            disabled={isLoadingTypes}
          >
            {isLoadingTypes ? "Loading…" : contentTypes.length > 0 ? "Refresh types" : "Load content types"}
          </button>
        </div>
        {contentTypes.length > 0 && (
          <div className="panel__type-list">
            {contentTypes.map((ct) => (
              <label key={ct.codename} className="panel__type-item">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(ct.codename)}
                  onChange={() => toggleType(ct.codename)}
                />
                {ct.name}
                <span className="panel__type-codename">{ct.codename}</span>
              </label>
            ))}
          </div>
        )}
        {contentTypes.length === 0 && !isLoadingTypes && (
          <p className="panel__empty">Load content types to filter the sync scope (optional).</p>
        )}
      </div>

      <div className="panel__actions">
        {status !== "idle" && (
          <button type="button" className="button button--secondary" onClick={reset}>
            Reset
          </button>
        )}
        <button
          type="button"
          className="button"
          onClick={() => void handleSync()}
          disabled={status === "running"}
        >
          {status === "running" ? "Syncing…" : "Start Sync"}
        </button>
      </div>

      {log.length > 0 && (
        <pre className={`panel__log ${status === "error" ? "panel__log--error" : status === "success" ? "panel__log--success" : ""}`}>
          {log.join("\n")}
        </pre>
      )}
    </div>
  );
};
