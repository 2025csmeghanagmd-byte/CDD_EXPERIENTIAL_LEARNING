const modules = [
  ["Internships", "Discover opportunities and track applications."],
  ["Placement preparation", "Practice aptitude, technical topics and mock tests."],
  ["Skill gap analyzer", "Compare current skills with target role requirements."],
  ["Campus skill exchange", "Teach, learn and collaborate with fellow students."]
];

export default function HomePage() {
  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">Your campus career companion</p>
        <h1>Build skills. Find opportunities. Move forward.</h1>
        <p>CareerBridge brings internships, placement preparation and peer learning together.</p>
      </section>
      <section id="modules" className="module-grid" aria-label="CareerBridge modules">
        {modules.map(([title, description]) => (
          <article className="module-card" key={title}>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
