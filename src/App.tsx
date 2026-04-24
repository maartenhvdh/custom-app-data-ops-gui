import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header.tsx";
import { Home } from "./components/Home.tsx";
import { InvalidConfig } from "./components/InvalidConfig.tsx";
import { SyncDiff } from "./components/sync/SyncDiff.tsx";
import { SyncEntities } from "./components/sync/SyncEntities.tsx";
import { SyncSource } from "./components/sync/SyncSource.tsx";
import { SyncTarget } from "./components/sync/SyncTarget.tsx";
import { WizardProvider } from "./contexts/WizardContext.tsx";
import { useValidatedConfig } from "./hooks/useValidatedConfig.ts";

const App = () => {
  const result = useValidatedConfig();

  if (!result.isValid) {
    return <InvalidConfig error={result.error} />;
  }

  return (
    <MemoryRouter>
      <WizardProvider config={result.config}>
        <div className="content">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sync/source" element={<SyncSource />} />
            <Route path="/sync/target" element={<SyncTarget />} />
            <Route path="/sync/entities" element={<SyncEntities />} />
            <Route path="/sync/diff" element={<SyncDiff />} />
          </Routes>
        </div>
      </WizardProvider>
    </MemoryRouter>
  );
};

export default App;
