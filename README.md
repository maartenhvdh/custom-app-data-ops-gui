# Data Ops Custom App for Kontent.ai

A Kontent.ai custom app that embeds the [Data Ops](https://github.com/kontent-ai/data-ops) tooling directly inside the Kontent.ai environment. Admins and editors can **diff** and **sync** content between environments using environment dropdowns — no manual entry of environment IDs or API keys.

---

## Prerequisites

- Node.js 20+
- pnpm 9+
- A Kontent.ai subscription with at least two environments
- A Management API key for each environment you want to expose

---

## Installation

```bash
pnpm install
```

## Local Development

```bash
pnpm dev
```

The app runs at `https://localhost:5173`. The dev server uses a self-signed certificate — accept the browser warning on first load. HTTPS is required by the Kontent.ai custom app SDK.

## Build & Preview

```bash
pnpm build      # outputs to dist/
pnpm preview    # serve the built output locally
```

---

## Configuring appConfig

All environment configuration is stored in the Kontent.ai admin UI — **nothing is hardcoded in the app**.

Go to: **Environment Settings → Custom Apps → [your app] → Configuration**

Paste the following JSON and fill in your real values:

```json
{
  "environments": [
    {
      "id": "prod",
      "name": "Production",
      "environmentId": "<kontent-environment-guid>",
      "managementApiKey": "<management-api-key>"
    },
    {
      "id": "staging",
      "name": "Staging",
      "environmentId": "<kontent-environment-guid>",
      "managementApiKey": "<management-api-key>"
    },
    {
      "id": "dev",
      "name": "Development",
      "environmentId": "<kontent-environment-guid>",
      "managementApiKey": "<management-api-key>"
    }
  ]
}
```

Each object in `environments` requires:

| Field | Description |
|---|---|
| `id` | Short unique slug (used internally, e.g. `"prod"`) |
| `name` | Human-readable label shown in the dropdown |
| `environmentId` | The Kontent.ai environment GUID |
| `managementApiKey` | Management API key for that environment |

**Security notes:**
- `managementApiKey` values are delivered to the app through the SDK's postMessage channel and are never placed in the page HTML, URLs, or rendered to the screen.
- The app reads keys only to set `Authorization: Bearer` headers on Management API calls.
- Each key only needs the permissions required for the operations you want to allow (read on source, read+write on target).
- Rotate keys in appConfig any time you rotate them in Kontent.ai.

If `appConfig` is missing or malformed the app shows a clear error page directing you to fix the configuration — the app never crashes silently.

---

## Registering the App in Kontent.ai

1. Build and deploy the `dist/` folder (Netlify, Vercel, or any static host).
2. In Kontent.ai go to **Environment Settings → Custom Apps → Add custom app**.
3. Set the **Source URL** to your deployed app URL.
4. Paste the appConfig JSON (above) into the **Configuration** field.
5. Choose where the app should appear — **dialog mode** via the top navigation bar is recommended so it has enough screen space.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/kontent-ai/custom-app-data-ops-gui)

---

## Project Structure

```
src/
├── contexts/
│   ├── AppContext.tsx           Kontent.ai SDK context observer (do not modify)
│   └── DataOpsContext.tsx       Selected source/target environment state
├── components/
│   ├── EnvironmentPicker/       Dropdown populated from appConfig.environments
│   │   ├── EnvironmentPicker.tsx
│   │   └── EnvironmentPicker.css
│   ├── DataOpsApp/              Main integration shell + operation panels
│   │   ├── DataOpsApp.tsx       Tab shell (Diff / Sync)
│   │   ├── DiffPanel.tsx        Environment diff view
│   │   ├── SyncPanel.tsx        Environment sync view
│   │   └── DataOpsApp.css       All panel styles
│   └── InvalidConfig.tsx        Error page shown when appConfig is missing
├── hooks/
│   └── useValidatedConfig.ts    Validates and type-narrows appConfig
└── types/
    └── appConfig.ts             TypeScript types + runtime guard for appConfig
```

---

## Integrating data-ops-gui Components

`SyncPanel.tsx` and `DiffPanel.tsx` contain integration points marked with `// ── Integration point ──` comments. To wire in the full [data-ops-gui](https://github.com/kontent-ai/data-ops-gui) components:

1. Copy the relevant panel source files from data-ops-gui into `src/data-ops-gui/`.
2. Find every `<input>` that captures `environmentId` or `apiKey` in local state.
3. Delete those inputs and their `useState` declarations.
4. Accept an `EnvironmentConfig` prop instead and read `environmentId` / `managementApiKey` from it.
5. Import and render the adapted component inside `SyncPanel` or `DiffPanel`, passing `sourceEnv` / `targetEnv` as props.

### Adding a New Operation Tab

1. Create `src/components/DataOpsApp/MyOperationPanel.tsx` accepting `{ sourceEnv: EnvironmentConfig; targetEnv: EnvironmentConfig }`.
2. Add `"myOperation"` to the `ActiveTab` union in `DataOpsApp.tsx`.
3. Add the tab button and conditional render in the tabs section.

---

## Hooks Reference

### `useValidatedConfig()`

Returns either `{ isValid: true, config: DataOpsAppConfig }` or `{ isValid: false, error: string }`. Always call this at the top of any component that needs the environment list.

### `useDataOpsContext()`

Returns `{ sourceEnv, targetEnv, setSourceEnv, setTargetEnv }`. Available anywhere inside `DataOpsContextProvider` (wraps `DataOpsInner` inside `DataOpsApp`).

### `useAppConfig()`

Returns the raw `appConfig` object from the Kontent.ai SDK context. Prefer `useValidatedConfig()` over this in application code.

---

## Learn More

- [Kontent.ai Custom Apps Documentation](https://kontent.ai/learn/docs/build-apps/custom-apps/overview)
- [Kontent.ai Custom App SDK](https://github.com/kontent-ai/custom-app-sdk-js)
- [Kontent.ai Data Ops](https://github.com/kontent-ai/data-ops)
- [Kontent.ai Data Ops GUI](https://github.com/kontent-ai/data-ops-gui)

---

## License

MIT
