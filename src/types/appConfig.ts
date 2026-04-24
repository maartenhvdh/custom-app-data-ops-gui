export interface EnvironmentConfig {
  readonly id: string;
  readonly name: string;
  readonly environmentId: string;
  readonly managementApiKey: string;
}

export interface DataOpsAppConfig {
  readonly environments: ReadonlyArray<EnvironmentConfig>;
}

export const isDataOpsAppConfig = (value: unknown): value is DataOpsAppConfig => {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return Array.isArray(obj["environments"]) &&
    (obj["environments"] as unknown[]).every(isEnvironmentConfig);
};

const isEnvironmentConfig = (value: unknown): value is EnvironmentConfig => {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj["id"] === "string" &&
    typeof obj["name"] === "string" &&
    typeof obj["environmentId"] === "string" &&
    typeof obj["managementApiKey"] === "string"
  );
};
