import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-logo">
        <h2>Pokédex Explorer</h2>
      </Link>
      <nav>
        <Link to="/">Dashboard</Link>
      </nav>
    </aside>
  );
}
