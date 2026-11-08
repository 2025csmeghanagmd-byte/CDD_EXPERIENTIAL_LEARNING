import { Link, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";

export default function App() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/">CareerBridge</Link>
        <nav aria-label="Main navigation">
          <Link to="/">Home</Link>
          <a href="#modules">Modules</a>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </>
  );
}
