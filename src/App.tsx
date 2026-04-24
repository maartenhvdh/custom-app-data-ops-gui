import { useValidatedConfig } from "./hooks/useValidatedConfig.ts";
import { DataOpsApp } from "./components/DataOpsApp/DataOpsApp.tsx";
import { InvalidConfig } from "./components/InvalidConfig.tsx";
import "./App.css";

const App = () => {
  const result = useValidatedConfig();

  if (!result.isValid) {
    return <InvalidConfig error={result.error} />;
  }

  return <DataOpsApp config={result.config} />;
};

export default App;
