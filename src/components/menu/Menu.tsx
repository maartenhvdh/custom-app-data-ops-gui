import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MenuAction } from "../../utils/navigation.ts";
import { Tooltip } from "./Tooltip.tsx";

interface MenuProps {
  readonly actions: ReadonlyArray<MenuAction>;
  readonly style?: string;
}

export const Menu = ({ actions, style }: MenuProps) => {
  const [hoveredAction, setHoveredAction] = useState<MenuAction | null>(null);
  const [subMenu, setSubMenu] = useState<MenuAction | null>(null);
  const navigate = useNavigate();

  const handleSelect = (action: MenuAction) => {
    if (action.subMenuActions) {
      setSubMenu(action);
    } else if (action.route) {
      void navigate(action.route);
    }
  };

  const isDisabled = (action: MenuAction) => !action.subMenuActions && !action.route;

  return (
    <>
      <div className="menu-column">
        {actions.map((action) => (
          <button
            key={action.title}
            type="button"
            className={`button ${style ?? ""} ${isDisabled(action) ? "disabled" : ""}`.trim()}
            onClick={() => handleSelect(action)}
            onMouseEnter={() => setHoveredAction(action)}
            onMouseLeave={() => setHoveredAction(null)}
          >
            {action.title}
          </button>
        ))}
      </div>
      {subMenu?.subMenuActions && <Menu actions={subMenu.subMenuActions} style="secondary" />}
      {hoveredAction && <Tooltip hoveredAction={hoveredAction} />}
    </>
  );
};
