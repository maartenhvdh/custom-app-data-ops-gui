interface InvalidConfigProps {
  readonly error: string;
}

export const InvalidConfig = ({ error }: InvalidConfigProps) => (
  <div className="invalid-config">
    <div className="invalid-config__icon">⚠</div>
    <h2 className="invalid-config__title">Configuration Required</h2>
    <p className="invalid-config__message">{error}</p>
    <p className="invalid-config__hint">
      Contact your Kontent.ai admin to configure environments in the custom app settings.
    </p>
  </div>
);
