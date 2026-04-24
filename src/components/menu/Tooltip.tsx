import type { MenuAction } from "../../utils/navigation.ts";

interface TooltipProps {
  readonly hoveredAction: MenuAction | null;
}

export const Tooltip = ({ hoveredAction }: TooltipProps) => (
  <div className="menu-column tooltip">
    {hoveredAction?.tooltip ?? ""}
  </div>
);
