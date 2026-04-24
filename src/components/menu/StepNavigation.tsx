import { useNavigate } from "react-router-dom";

interface StepNavigationProps {
  readonly nextLabel?: string;
  readonly prevLabel?: string;
}

export const StepNavigation = ({
  nextLabel = "Next",
  prevLabel = "Previous",
}: StepNavigationProps) => {
  const navigate = useNavigate();

  return (
    <div className="step-navigation">
      <button className="button" type="button" onClick={() => navigate(-1)}>
        {prevLabel}
      </button>
      <button className="button secondary" type="submit">
        {nextLabel}
      </button>
    </div>
  );
};
