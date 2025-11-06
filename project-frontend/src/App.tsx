import { Route, Routes } from "react-router";
import Index from "./pages/index/Index";
import Auth from "./pages/auth/Auth";

function App() {
  return (
    <Routes>
      <Route index element={<Index />} />
      <Route path="/auth" element={<Auth />} />
    </Routes>
  );
}

export default App;
