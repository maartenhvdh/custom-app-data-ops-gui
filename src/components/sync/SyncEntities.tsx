import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  syncEntityChoices,
  syncEntityLabels,
  type SyncEntityName,
  useWizardContext,
} from "../../contexts/WizardContext.tsx";
import type { DiffResponse } from "../../utils/sync.ts";
import { injectIframeResizeScript, removeElementFromHtml } from "../../utils/sync.ts";
import { Loader } from "../Loader.tsx";
import { StepNavigation } from "../menu/StepNavigation.tsx";

export const SyncEntities = () => {
  const {
    syncModelEntities,
    setSyncModelEntities,
    sourceEnvironmentId,
    sourceApiKey,
    targetEnvironmentId,
    targetApiKey,
  } = useWizardContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const navigate = useNavigate();

  const toggleEntity = (entity: SyncEntityName) => {
    setSyncModelEntities(
      syncModelEntities.includes(entity)
        ? syncModelEntities.filter((e) => e !== entity)
        : [...syncModelEntities, entity],
    );
  };

  const selectAll = () => setSyncModelEntities([...syncEntityChoices]);

  const generateDiff = async () => {
    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/.netlify/functions/diff", {
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
        setError(msg || "Unknown error generating diff.");
        return;
      }

      const data = (await response.json()) as DiffResponse;
      const processedHtml = injectIframeResizeScript(removeElementFromHtml(data.html, ".title"));

      void navigate("/sync/diff", { state: { diffResult: processedHtml } });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void generateDiff();
  };

  if (loading) {
    return (
      <Loader
        title="Generating diff…"
        message="Comparing environments. This may take a moment."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Select Entities to Sync</h2>
      <p className="not-displayed spaced-5">
        Choose which entity types to include in the sync. Deselecting an entity type will leave it
        unchanged in the target environment.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {syncEntityChoices.map((entity) => (
          <label key={entity} className="checkbox">
            <input
              type="checkbox"
              checked={syncModelEntities.includes(entity)}
              onChange={() => toggleEntity(entity)}
            />
            <span className="checkmark" />
            {syncEntityLabels[entity]}
          </label>
        ))}
      </div>

      <button
        type="button"
        className="button secondary"
        onClick={selectAll}
        style={{ marginBottom: "1rem" }}
      >
        Select all
      </button>

      {error && (
        <p style={{ color: "var(--red)", marginTop: "0.5rem" }}>{error}</p>
      )}

      <StepNavigation nextLabel="Generate Diff" />
    </form>
  );
};
