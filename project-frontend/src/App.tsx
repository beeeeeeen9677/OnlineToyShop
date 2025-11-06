import { Route, Routes } from "react-router";
import Index from "./pages/index/Index";

function App() {
  return (
    <Routes>
      <Route index element={<Index />} />
    </Routes>
  );
}

export default App;
