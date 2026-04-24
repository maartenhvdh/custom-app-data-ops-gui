import { useState } from "react";
import { EnvironmentPicker } from "../EnvironmentPicker/EnvironmentPicker.tsx";
import { SyncPanel } from "./SyncPanel.tsx";
import { DiffPanel } from "./DiffPanel.tsx";
import { DataOpsContextProvider, useDataOpsContext } from "../../contexts/DataOpsContext.tsx";
import type { DataOpsAppConfig } from "../../types/appConfig.ts";
import "./DataOpsApp.css";

type ActiveTab = "diff" | "sync";

interface DataOpsAppProps {
  readonly config: DataOpsAppConfig;
}

const DataOpsInner = ({ config }: DataOpsAppProps) => {
  const { sourceEnv, targetEnv, setSourceEnv, setTargetEnv } = useDataOpsContext();
  const [activeTab, setActiveTab] = useState<ActiveTab>("diff");

  const bothSelected = sourceEnv !== null && targetEnv !== null;

  return (
    <div className="data-ops-app">
      <header className="data-ops-app__header">
        <div>
          <h1 className="data-ops-app__title">Data Ops</h1>
          <p className="data-ops-app__subtitle">Migrate and sync content between environments</p>
        </div>
      </header>

      <section className="data-ops-app__env-row">
        <EnvironmentPicker
          label="Source environment"
          environments={config.environments}
          selectedId={sourceEnv?.id ?? null}
          onChange={setSourceEnv}
          disabledId={targetEnv?.id}
        />
        <div className="data-ops-app__arrow" aria-hidden="true">→</div>
        <EnvironmentPicker
          label="Target environment"
          environments={config.environments}
          selectedId={targetEnv?.id ?? null}
          onChange={setTargetEnv}
          disabledId={sourceEnv?.id}
        />
      </section>

      {bothSelected
        ? (
          <>
            <nav className="data-ops-app__tabs" aria-label="Operations">
              {(["diff", "sync"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`data-ops-app__tab${activeTab === tab ? " data-ops-app__tab--active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "diff" ? "Diff" : "Sync"}
                </button>
              ))}
            </nav>

            <div className="data-ops-app__panel">
              {activeTab === "diff" && (
                <DiffPanel sourceEnv={sourceEnv} targetEnv={targetEnv} />
              )}
              {activeTab === "sync" && (
                <SyncPanel sourceEnv={sourceEnv} targetEnv={targetEnv} />
              )}
            </div>
          </>
        )
        : (
          <p className="data-ops-app__hint">
            Select both a source and a target environment above to continue.
          </p>
        )}
    </div>
  );
};

export const DataOpsApp = ({ config }: DataOpsAppProps) => (
  <DataOpsContextProvider>
    <DataOpsInner config={config} />
  </DataOpsContextProvider>
);
