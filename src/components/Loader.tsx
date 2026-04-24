interface LoaderProps {
  readonly title: string;
  readonly message: string;
}

export const Loader = ({ title, message }: LoaderProps) => (
  <div>
    <h2>{title}</h2>
    <p>{message}</p>
    <div className="loader" />
  </div>
);
