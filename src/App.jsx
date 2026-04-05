import { Routes, Route, useNavigate } from "react-router-dom";
import Menu from "./Menu";
import Game from "./Game";
import AIvsAI from "./AIvsAI";
export default function App() {
  const navigate = useNavigate();

  function handleStart(mode, algo = null) {
    if (mode === "aivai") {
      navigate('/play/aivai');
    } else {
      navigate(`/play/${mode}`, { state: { algo } });
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Menu onStart={handleStart} />} />
      <Route path="/play/aivai" element={<AIvsAI />} />
      <Route path="/play/:mode" element={<Game />} />
    </Routes>
  );
}