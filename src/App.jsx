import "./App.css";
import { Routes } from "react-router-dom";
import { LoadingProvider } from "./service/LoadingContext";
import { CustomI18nProvider as I18nProvider, i18n } from "./i18n";
import newRoleSettingsRoutes from "./routes/newRoleSettingsRoutes";

function App() {
  return (
    <>
      <I18nProvider i18n={i18n}>
        <LoadingProvider>
          <Routes>{newRoleSettingsRoutes.map((val) => val)}</Routes>
        </LoadingProvider>
      </I18nProvider>
    </>
  );
}

export default App;
