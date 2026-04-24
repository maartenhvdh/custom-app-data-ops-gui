import type { EnvironmentConfig } from "../../types/appConfig.ts";
import "./EnvironmentPicker.css";

interface EnvironmentPickerProps {
  readonly label: string;
  readonly environments: ReadonlyArray<EnvironmentConfig>;
  readonly selectedId: string | null;
  readonly onChange: (env: EnvironmentConfig) => void;
  readonly disabledId?: string | null;
}

export const EnvironmentPicker = ({
  label,
  environments,
  selectedId,
  onChange,
  disabledId,
}: EnvironmentPickerProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const env = environments.find((env) => env.id === e.target.value);
    if (env) onChange(env);
  };

  const pickerId = `env-picker-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="env-picker">
      <label className="env-picker__label" htmlFor={pickerId}>
        {label}
      </label>
      <select
        id={pickerId}
        className="env-picker__select"
        value={selectedId ?? ""}
        onChange={handleChange}
      >
        <option value="" disabled>
          — select environment —
        </option>
        {environments.map((env) => (
          <option key={env.id} value={env.id} disabled={env.id === disabledId}>
            {env.name}
          </option>
        ))}
      </select>
    </div>
  );
};
