import { useNavigate } from "react-router-dom";
import { useWizardContext } from "../../contexts/WizardContext.tsx";
import { EnvironmentPicker } from "../EnvironmentPicker/EnvironmentPicker.tsx";
import { StepNavigation } from "../menu/StepNavigation.tsx";

export const SyncSource = () => {
  const { config, sourceEnv, targetEnv, setSourceEnv } = useWizardContext();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void navigate("/sync/target");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Select Source Environment</h2>
      <p className="not-displayed spaced-5">
        Choose the environment you want to sync <strong>from</strong>.
      </p>

      <div style={{ marginBottom: "1.5rem" }}>
        <EnvironmentPicker
          label="Source environment"
          environments={config.environments}
          selectedId={sourceEnv?.id ?? null}
          onChange={setSourceEnv}
          disabledId={targetEnv?.id}
        />
      </div>

      {sourceEnv && (
        <div className="section info" style={{ marginBottom: "1.5rem", display: "inline-block" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--dark-grey)" }}>
            Environment ID: <code>{sourceEnv.environmentId}</code>
          </div>
        </div>
      )}

      <StepNavigation nextLabel="Next" />
    </form>
  );
};
