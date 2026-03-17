import { Routes, Route, useNavigate } from "react-router-dom";
import Menu from "./Menu";
import Game from "./Game";

export default function App() {
  const navigate = useNavigate();

  function handleStart(mode) {
    navigate(`/play/${mode}`);
  }

  return (
    <Routes>
      <Route path="/" element={<Menu onStart={handleStart} />} />
      <Route path="/play/:mode" element={<Game />} />
    </Routes>
  );
}