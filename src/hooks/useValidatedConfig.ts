import { useAppConfig } from "../contexts/AppContext.tsx";
import { type DataOpsAppConfig, isDataOpsAppConfig } from "../types/appConfig.ts";

type ValidatedConfigResult =
  | { readonly isValid: true; readonly config: DataOpsAppConfig }
  | { readonly isValid: false; readonly error: string };

export const useValidatedConfig = (): ValidatedConfigResult => {
  const appConfig = useAppConfig();

  if (!isDataOpsAppConfig(appConfig)) {
    return {
      isValid: false,
      error:
        "App configuration is missing or malformed. " +
        "An admin must configure environments in the custom app settings. " +
        'Expected format: { "environments": [{ "id", "name", "environmentId", "managementApiKey" }] }',
    };
  }

  if (appConfig.environments.length === 0) {
    return {
      isValid: false,
      error: "No environments are configured. Add at least one environment in the custom app settings.",
    };
  }

  return { isValid: true, config: appConfig };
};
