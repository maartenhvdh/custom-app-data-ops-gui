import { useState } from "react";
import type { EnvironmentConfig } from "../../types/appConfig.ts";

interface DiffPanelProps {
  readonly sourceEnv: EnvironmentConfig;
  readonly targetEnv: EnvironmentConfig;
}

type DiffStatus = "idle" | "running" | "done" | "error";

interface DiffItem {
  readonly type: "added" | "removed" | "changed";
  readonly entity: string;
  readonly label: string;
}

export const DiffPanel = ({ sourceEnv, targetEnv }: DiffPanelProps) => {
  const [status, setDiffStatus] = useState<DiffStatus>("idle");
  const [items, setItems] = useState<ReadonlyArray<DiffItem>>([]);
  const [error, setError] = useState<string | null>(null);

  const runDiff = async () => {
    setDiffStatus("running");
    setItems([]);
    setError(null);

    try {
      // ── Integration point ──────────────────────────────────────────────────
      // Replace this block with the data-ops-gui diff logic.
      // Feed sourceEnv.environmentId / sourceEnv.managementApiKey (and target)
      // into the data-ops diff function instead of reading from form inputs.
      //
      // Example:
      //   const result = await diffEnvironments({
      //     sourceEnvironmentId: sourceEnv.environmentId,
      //     sourceApiKey: sourceEnv.managementApiKey,
      //     targetEnvironmentId: targetEnv.environmentId,
      //     targetApiKey: targetEnv.managementApiKey,
      //   });
      //   setItems(result.items);
      //
      // For now this fetches content types from both sides and diffs them:
      const [srcRes, tgtRes] = await Promise.all([
        fetch(`https://manage.kontent.ai/v2/projects/${sourceEnv.environmentId}/types`, {
          headers: { Authorization: `Bearer ${sourceEnv.managementApiKey}` },
        }),
        fetch(`https://manage.kontent.ai/v2/projects/${targetEnv.environmentId}/types`, {
          headers: { Authorization: `Bearer ${targetEnv.managementApiKey}` },
        }),
      ]);

      if (!srcRes.ok) throw new Error(`Source: ${srcRes.status} ${srcRes.statusText}`);
      if (!tgtRes.ok) throw new Error(`Target: ${tgtRes.status} ${tgtRes.statusText}`);

      const srcData = await srcRes.json() as { types: ReadonlyArray<{ id: string; codename: string; name: { value: string } }> };
      const tgtData = await tgtRes.json() as { types: ReadonlyArray<{ id: string; codename: string; name: { value: string } }> };

      const srcCodenames = new Set(srcData.types.map((t) => t.codename));
      const tgtCodenames = new Set(tgtData.types.map((t) => t.codename));

      const diffItems: DiffItem[] = [];

      for (const t of srcData.types) {
        if (!tgtCodenames.has(t.codename)) {
          diffItems.push({ type: "added", entity: "content type", label: `${t.name.value} (${t.codename})` });
        }
      }

      for (const t of tgtData.types) {
        if (!srcCodenames.has(t.codename)) {
          diffItems.push({ type: "removed", entity: "content type", label: `${t.name.value} (${t.codename})` });
        }
      }

      setItems(diffItems);
      setDiffStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setDiffStatus("error");
    }
  };

  const reset = () => {
    setDiffStatus("idle");
    setItems([]);
    setError(null);
  };

  const diffTypeLabel: Record<DiffItem["type"], string> = {
    added: "Only in source",
    removed: "Only in target",
    changed: "Changed",
  };

  const diffTypeClass: Record<DiffItem["type"], string> = {
    added: "diff-item--added",
    removed: "diff-item--removed",
    changed: "diff-item--changed",
  };

  return (
    <div className="panel">
      <p className="panel__description">
        Compare content types between <strong>{sourceEnv.name}</strong> and{" "}
        <strong>{targetEnv.name}</strong> to review differences before syncing.
      </p>

      <div className="panel__actions">
        {status !== "idle" && (
          <button type="button" className="button button--secondary" onClick={reset}>
            Reset
          </button>
        )}
        <button
          type="button"
          className="button"
          onClick={() => void runDiff()}
          disabled={status === "running"}
        >
          {status === "running" ? "Running diff…" : "Run Diff"}
        </button>
      </div>

      {error && <p className="panel__error">{error}</p>}

      {status === "done" && items.length === 0 && (
        <p className="panel__empty panel__empty--success">
          No differences found — environments are in sync.
        </p>
      )}

      {items.length > 0 && (
        <ul className="diff-list">
          {items.map((item, i) => (
            <li key={i} className={`diff-item ${diffTypeClass[item.type]}`}>
              <span className="diff-item__badge">{diffTypeLabel[item.type]}</span>
              <span className="diff-item__entity">{item.entity}</span>
              <span className="diff-item__label">{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
