import "./App.css";
import { Routes } from "react-router-dom";
import { LoadingProvider } from "./service/LoadingContext";
import routes from "./routes/routes";

function App() {
  return (
    <>
      <LoadingProvider>
        <Routes>{routes.map((val) => val)}</Routes>
      </LoadingProvider>
    </>
  );
}

export default App;
