
import { Link, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import SkillExchangePage from "./modules/skillExchange/SkillExchangePage.jsx";

export default function App() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/">
          CareerBridge
        </Link>

        <nav aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/skill-exchange">Skill Exchange</Link>
          <a href="/#modules">Modules</a>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/skill-exchange" element={<SkillExchangePage />} />
      </Routes>
    </>
  );
}
