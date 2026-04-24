export interface MenuAction {
  readonly title: string;
  readonly tooltip: string;
  readonly subMenuActions?: ReadonlyArray<MenuAction>;
  readonly route?: string;
}

export const mainMenu: ReadonlyArray<MenuAction> = [
  {
    title: "Sync model",
    tooltip: "Synchronize content models between environments or create a sync snapshot for later use.",
    subMenuActions: [
      {
        title: "Run sync",
        route: "/sync/source",
        tooltip:
          "Synchronize content models between two environments selected from your configured environments.",
      },
      {
        title: "Create sync snapshot",
        tooltip:
          "Creates a snapshot of an environment's content model and saves it as a .zip file for later synchronization. (Coming soon)",
      },
    ],
  },
  {
    title: "Migrate content",
    tooltip: "Migrate content between two environments. (Coming soon)",
  },
  {
    title: "Environment Backup",
    tooltip: "Backup all environment data to a .zip file. (Coming soon)",
  },
  {
    title: "Environment Restore",
    tooltip: "Restore environment from an existing backup. (Coming soon)",
  },
  {
    title: "Clean",
    tooltip: "Remove or deactivate all entities in an environment. (Coming soon)",
  },
];
