import { createContext, type ReactNode, useContext, useState } from "react";
import type { DataOpsAppConfig, EnvironmentConfig } from "../types/appConfig.ts";

export const syncEntityChoices = [
  "contentTypes",
  "contentTypeSnippets",
  "taxonomies",
  "collections",
  "assetFolders",
  "spaces",
  "languages",
  "webSpotlight",
  "workflows",
] as const;

export type SyncEntityName = (typeof syncEntityChoices)[number];

export const syncEntityLabels: Record<SyncEntityName, string> = {
  contentTypes: "Content types",
  contentTypeSnippets: "Content type snippets",
  taxonomies: "Taxonomies",
  collections: "Collections",
  assetFolders: "Asset folders",
  spaces: "Spaces",
  languages: "Languages",
  webSpotlight: "Web Spotlight",
  workflows: "Workflows",
};

interface WizardContextValue {
  readonly config: DataOpsAppConfig;
  // Selected environments
  readonly sourceEnv: EnvironmentConfig | null;
  readonly targetEnv: EnvironmentConfig | null;
  readonly setSourceEnv: (env: EnvironmentConfig) => void;
  readonly setTargetEnv: (env: EnvironmentConfig) => void;
  // Derived fields used by SyncEntities and SyncDiff when calling Netlify functions
  readonly sourceEnvironmentId: string | undefined;
  readonly sourceApiKey: string | undefined;
  readonly sourceEnvName: string | undefined;
  readonly targetEnvironmentId: string | undefined;
  readonly targetApiKey: string | undefined;
  readonly targetEnvName: string | undefined;
  // Entity selection
  readonly syncModelEntities: ReadonlyArray<SyncEntityName>;
  readonly setSyncModelEntities: (entities: ReadonlyArray<SyncEntityName>) => void;
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

interface WizardProviderProps {
  readonly config: DataOpsAppConfig;
  readonly children: ReactNode;
}

export const WizardProvider = ({ config, children }: WizardProviderProps) => {
  const [sourceEnv, setSourceEnv] = useState<EnvironmentConfig | null>(null);
  const [targetEnv, setTargetEnv] = useState<EnvironmentConfig | null>(null);
  const [syncModelEntities, setSyncModelEntities] = useState<ReadonlyArray<SyncEntityName>>([
    ...syncEntityChoices,
  ]);

  return (
    <WizardContext.Provider
      value={{
        config,
        sourceEnv,
        targetEnv,
        setSourceEnv,
        setTargetEnv,
        sourceEnvironmentId: sourceEnv?.environmentId,
        sourceApiKey: sourceEnv?.managementApiKey,
        sourceEnvName: sourceEnv?.name,
        targetEnvironmentId: targetEnv?.environmentId,
        targetApiKey: targetEnv?.managementApiKey,
        targetEnvName: targetEnv?.name,
        syncModelEntities,
        setSyncModelEntities,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

export const useWizardContext = (): WizardContextValue => {
  const ctx = useContext(WizardContext);
  if (ctx === undefined) {
    throw new Error("useWizardContext must be used inside WizardProvider");
  }
  return ctx;
};
