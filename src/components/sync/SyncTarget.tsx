import { useNavigate } from "react-router-dom";
import { useWizardContext } from "../../contexts/WizardContext.tsx";
import { EnvironmentPicker } from "../EnvironmentPicker/EnvironmentPicker.tsx";
import { StepNavigation } from "../menu/StepNavigation.tsx";

export const SyncTarget = () => {
  const { config, targetEnv, sourceEnv, setTargetEnv } = useWizardContext();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void navigate("/sync/entities");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Select Target Environment</h2>
      <p className="not-displayed spaced-5">
        Choose the environment you want to sync <strong>into</strong>. This environment will be
        modified.
      </p>

      <div style={{ marginBottom: "1.5rem" }}>
        <EnvironmentPicker
          label="Target environment"
          environments={config.environments}
          selectedId={targetEnv?.id ?? null}
          onChange={setTargetEnv}
          disabledId={sourceEnv?.id}
        />
      </div>

      {targetEnv && (
        <div className="section info" style={{ marginBottom: "1.5rem", display: "inline-block" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--dark-grey)" }}>
            Environment ID: <code>{targetEnv.environmentId}</code>
          </div>
        </div>
      )}

      <StepNavigation nextLabel="Next" />
    </form>
  );
};
