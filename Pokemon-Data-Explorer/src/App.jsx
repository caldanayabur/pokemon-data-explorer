import { Routes, Route } from "react-router-dom";
import './App.css'
import Sidebar from "./components/Sidebar";
import PokemonList from "./components/PokemonList";
import PokemonDetail from "./components/PokemonDetail";

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<PokemonList />} />
          <Route path="/pokemon/:name" element={<PokemonDetail />} />
        </Routes>
      </main>
    </div>
  );
}
