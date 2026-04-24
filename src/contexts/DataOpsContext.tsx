import { createContext, type ReactNode, useContext, useState } from "react";
import type { EnvironmentConfig } from "../types/appConfig.ts";

interface DataOpsContextValue {
  readonly sourceEnv: EnvironmentConfig | null;
  readonly targetEnv: EnvironmentConfig | null;
  readonly setSourceEnv: (env: EnvironmentConfig) => void;
  readonly setTargetEnv: (env: EnvironmentConfig) => void;
}

const DataOpsContext = createContext<DataOpsContextValue | undefined>(undefined);

export const DataOpsContextProvider = ({ children }: { readonly children: ReactNode }) => {
  const [sourceEnv, setSourceEnv] = useState<EnvironmentConfig | null>(null);
  const [targetEnv, setTargetEnv] = useState<EnvironmentConfig | null>(null);

  return (
    <DataOpsContext.Provider value={{ sourceEnv, targetEnv, setSourceEnv, setTargetEnv }}>
      {children}
    </DataOpsContext.Provider>
  );
};

export const useDataOpsContext = (): DataOpsContextValue => {
  const ctx = useContext(DataOpsContext);
  if (ctx === undefined) {
    throw new Error("useDataOpsContext must be used inside DataOpsContextProvider");
  }
  return ctx;
};
