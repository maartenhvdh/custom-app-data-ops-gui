import { mainMenu } from "../utils/navigation.ts";
import { Menu } from "./menu/Menu.tsx";

export const Home = () => (
  <>
    <h2>Select an Action</h2>
    <div className="menu">
      <Menu actions={mainMenu} />
    </div>
  </>
);
