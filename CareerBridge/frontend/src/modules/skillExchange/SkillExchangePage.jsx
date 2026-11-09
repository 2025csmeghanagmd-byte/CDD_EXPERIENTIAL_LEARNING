
import { useEffect, useState } from "react";
import "./SkillExchangePage.css";

const API = "http://127.0.0.1:5000/api/exchange";

export default function SkillExchangePage() {
  const [activeTab, setActiveTab] = useState("explore");
  const [studentId, setStudentId] = useState("1");

  const [skills, setSkills] = useState([]);
  const [partners, setPartners] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [skillForm, setSkillForm] = useState({
    skill_name: "",
    category: "",
    description: "",
    mode: "Free",
  });

  const [profileForm, setProfileForm] = useState({
    interview_type: "Technical Interview",
    skills: "",
    experience_level: "Beginner",
    availability: "",
  });

  const [requestForm, setRequestForm] = useState({
    practice_type: "Technical Mock Interview",
    preferred_date: "",
    preferred_time: "",
    campus_location: "Library Discussion Area",
    message: "",
  });

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Something went wrong.");
    }

    return result.data;
  }

  async function loadData() {
    if (!studentId || Number(studentId) < 1) return;

    setLoading(true);

    try {
      const [skillData, partnerData, requestData, sessionData] =
        await Promise.all([
          apiRequest("/skills"),
          apiRequest(`/partners?student_id=${studentId}`),
          apiRequest(`/requests?student_id=${studentId}`),
          apiRequest(`/sessions?student_id=${studentId}`),
        ]);

      setSkills(skillData || []);
      setPartners(partnerData || []);
      setRequests(requestData || []);
      setSessions(sessionData || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [studentId]);

  async function handleOfferSkill(event) {
    event.preventDefault();

    try {
      await apiRequest("/skills", {
        method: "POST",
        body: JSON.stringify({
          ...skillForm,
          student_id: Number(studentId),
        }),
      });

      setMessage("Your skill offer was published!");

      setSkillForm({
        skill_name: "",
        category: "",
        description: "",
        mode: "Free",
      });

      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleSaveProfile(event) {
    event.preventDefault();

    try {
      await apiRequest("/partners", {
        method: "POST",
        body: JSON.stringify({
          ...profileForm,
          student_id: Number(studentId),
        }),
      });

      setMessage("Your interview profile was saved!");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleSendRequest(event, receiverId) {
    event.preventDefault();

    try {
      await apiRequest("/requests", {
        method: "POST",
        body: JSON.stringify({
          ...requestForm,
          sender_id: Number(studentId),
          receiver_id: Number(receiverId),
        }),
      });

      setMessage("Your practice request was sent!");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleRequestResponse(requestId, status) {
    try {
      await apiRequest(`/requests/${requestId}`, {
        method: "PUT",
        body: JSON.stringify({
          receiver_id: Number(studentId),
          status,
        }),
      });

      setMessage(`Request ${status.toLowerCase()} successfully!`);
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const tabs = [
    ["explore", "Explore Skills"],
    ["offer", "Offer a Skill"],
    ["buddy", "Interview Buddy"],
    ["sessions", "My Requests & Sessions"],
  ];

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    <main className="exchange-page">
      <section className="exchange-heading">
        <p className="exchange-eyebrow">LEARN • SHARE • PRACTISE</p>

        <h1>Campus Skill Exchange</h1>

        <p className="exchange-intro">
          Share what you know, learn from fellow students, and
          find your perfect interview practice partner.
        </p>

        <label className="student-selector">
          Demo Student ID
          <input
            type="number"
            min="1"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
          />
        </label>

        <small className="demo-note">
          Demo mode: Change the ID to simulate another student.
          In the integrated application, use the logged-in student's ID.
        </small>
      </section>

      {message && (
        <div className="exchange-message" role="status">
          <span>{message}</span>
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setMessage("")}
          >
            ×
          </button>
        </div>
      )}

      <nav className="exchange-tabs" aria-label="Skill exchange sections">
        {tabs.map(([id, label]) => (
          <button
            type="button"
            key={id}
            className={activeTab === id ? "active" : ""}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {loading && (
        <p className="exchange-loading">
          Loading Campus Skill Exchange data...
        </p>
      )}

      {!loading && activeTab === "explore" && (
        <section className="exchange-section">
          <div className="section-heading">
            <p className="exchange-eyebrow">DISCOVER AND LEARN</p>
            <h2>Explore Skills</h2>
            <p>Discover skills that fellow students are offering.</p>
          </div>

          <div className="exchange-grid">
            {skills.length === 0 ? (
              <div className="exchange-empty">
                <h3>No skill offers yet</h3>
                <p>Be the first to share a skill with your campus!</p>
                <button
                  type="button"
                  className="exchange-primary"
                  onClick={() => setActiveTab("offer")}
                >
                  Offer a Skill
                </button>
              </div>
            ) : (
              skills.map((skill) => (
                <article className="exchange-card" key={skill.id}>
                  <span className="exchange-tag">{skill.category}</span>
                  <h3>{skill.skill_name}</h3>
                  <p>{skill.description || "No description provided."}</p>
                  <div className="card-details">
                    <p><strong>Student:</strong> {skill.student_id}</p>
                    <p><strong>Mode:</strong> {skill.mode}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}

      {!loading && activeTab === "offer" && (
        <section className="exchange-form-section">
          <div className="section-heading">
            <p className="exchange-eyebrow">SHARE YOUR KNOWLEDGE</p>
            <h2>Offer a Skill</h2>
            <p>Share something you can teach other students.</p>
          </div>

          <form onSubmit={handleOfferSkill} className="exchange-form">
            <label>
              Skill name
              <input
                required
                value={skillForm.skill_name}
                onChange={(event) =>
                  setSkillForm({
                    ...skillForm,
                    skill_name: event.target.value,
                  })
                }
                placeholder="Example: Python Programming"
              />
            </label>

            <label>
              Category
              <input
                required
                value={skillForm.category}
                onChange={(event) =>
                  setSkillForm({
                    ...skillForm,
                    category: event.target.value,
                  })
                }
                placeholder="Example: Programming"
              />
            </label>

            <label>
              Description
              <textarea
                value={skillForm.description}
                onChange={(event) =>
                  setSkillForm({
                    ...skillForm,
                    description: event.target.value,
                  })
                }
                placeholder="Describe what you can teach..."
                rows="4"
              />
            </label>

            <label>
              Teaching mode
              <select
                value={skillForm.mode}
                onChange={(event) =>
                  setSkillForm({
                    ...skillForm,
                    mode: event.target.value,
                  })
                }
              >
                <option>Free</option>
                <option>Paid</option>
              </select>
            </label>

            <button className="exchange-primary" type="submit">
              Publish Skill
            </button>
          </form>
        </section>
      )}

      {!loading && activeTab === "buddy" && (
        <section className="exchange-section">
          <div className="exchange-form-section">
            <div className="section-heading">
              <p className="exchange-eyebrow">PRACTISE TOGETHER</p>
              <h2>My Interview Profile</h2>
              <p>Tell other students what kind of practice you need.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="exchange-form">
              <label>
                Interview type
                <select
                  value={profileForm.interview_type}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      interview_type: event.target.value,
                    })
                  }
                >
                  <option>Technical Interview</option>
                  <option>HR Interview</option>
                  <option>Group Discussion</option>
                  <option>General Mock Interview</option>
                </select>
              </label>

              <label>
                Skills
                <input
                  value={profileForm.skills}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      skills: event.target.value,
                    })
                  }
                  placeholder="Python, SQL, Communication"
                />
              </label>

              <label>
                Experience level
                <select
                  value={profileForm.experience_level}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      experience_level: event.target.value,
                    })
                  }
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>

              <label>
                Availability
                <input
                  required
                  value={profileForm.availability}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      availability: event.target.value,
                    })
                  }
                  placeholder="Weekdays, 2 PM to 4 PM"
                />
              </label>

              <button className="exchange-primary" type="submit">
                Save Interview Profile
              </button>
            </form>
          </div>

          <div className="section-heading exchange-subheading">
            <h2>Find Interview Partners</h2>
            <p>Connect with students who want to practise too.</p>
          </div>

          <div className="exchange-grid">
            {partners.length === 0 ? (
              <div className="exchange-empty">
                <p>No other interview profiles found.</p>
              </div>
            ) : (
              partners.map((partner) => (
                <article className="exchange-card" key={partner.id}>
                  <span className="exchange-tag">
                    {partner.interview_type}
                  </span>

                  <h3>Student {partner.student_id}</h3>

                  <p>
                    <strong>Skills:</strong>{" "}
                    {partner.skills || "Not specified"}
                  </p>
                  <p>
                    <strong>Level:</strong> {partner.experience_level}
                  </p>
                  <p>
                    <strong>Available:</strong> {partner.availability}
                  </p>

                  <form
                    onSubmit={(event) =>
                      handleSendRequest(event, partner.student_id)
                    }
                    className="exchange-form compact-form"
                  >
                    <label>
                      Practice date
                      <input
                        required
                        type="date"
                        min={todayString}
                        value={requestForm.preferred_date}
                        onChange={(event) =>
                          setRequestForm({
                            ...requestForm,
                            preferred_date: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      Practice time
                      <input
                        required
                        value={requestForm.preferred_time}
                        onChange={(event) =>
                          setRequestForm({
                            ...requestForm,
                            preferred_time: event.target.value,
                          })
                        }
                        placeholder="3:00 PM"
                      />
                    </label>

                    <label>
                      Campus location
                      <select
                        value={requestForm.campus_location}
                        onChange={(event) =>
                          setRequestForm({
                            ...requestForm,
                            campus_location: event.target.value,
                          })
                        }
                      >
                        <option>Library Discussion Area</option>
                        <option>Seminar Hall</option>
                        <option>College Canteen</option>
                        <option>Common Area</option>
                        <option>Available Classroom</option>
                      </select>
                    </label>

                    <label>
                      Message
                      <textarea
                        value={requestForm.message}
                        onChange={(event) =>
                          setRequestForm({
                            ...requestForm,
                            message: event.target.value,
                          })
                        }
                        placeholder="Would you like to practise together?"
                        rows="3"
                      />
                    </label>

                    <button className="exchange-primary" type="submit">
                      Request Practice
                    </button>
                  </form>
                </article>
              ))
            )}
          </div>
        </section>
      )}

      {!loading && activeTab === "sessions" && (
        <section className="exchange-section">
          <div className="section-heading">
            <p className="exchange-eyebrow">YOUR ACTIVITY</p>
            <h2>My Practice Requests</h2>
          </div>

          <div className="exchange-grid">
            {requests.length === 0 ? (
              <div className="exchange-empty">
                <p>No practice requests found.</p>
              </div>
            ) : (
              requests.map((request) => (
                <article className="exchange-card" key={request.id}>
                  <h3>{request.practice_type}</h3>

                  <p>
                    From Student {request.sender_id} to Student{" "}
                    {request.receiver_id}
                  </p>
                  <p>
                    {request.preferred_date} at {request.preferred_time}
                  </p>
                  <p>{request.campus_location}</p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="exchange-tag">{request.status}</span>
                  </p>

                  {Number(request.receiver_id) === Number(studentId) &&
                    request.status === "Pending" && (
                      <div className="exchange-actions">
                        <button
                          type="button"
                          className="exchange-primary"
                          onClick={() =>
                            handleRequestResponse(request.id, "Accepted")
                          }
                        >
                          Accept
                        </button>

                        <button
                          type="button"
                          className="exchange-secondary"
                          onClick={() =>
                            handleRequestResponse(request.id, "Rejected")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}
                </article>
              ))
            )}
          </div>

          <div className="section-heading exchange-subheading">
            <h2>Scheduled Practice Sessions</h2>
          </div>

          <div className="exchange-grid">
            {sessions.length === 0 ? (
              <div className="exchange-empty">
                <p>No scheduled sessions yet.</p>
              </div>
            ) : (
              sessions.map((session) => (
                <article className="exchange-card" key={session.id}>
                  <span className="exchange-tag">Scheduled</span>
                  <h3>Mock Interview Session</h3>
                  <p><strong>Date:</strong> {session.session_date}</p>
                  <p><strong>Time:</strong> {session.session_time}</p>
                  <p><strong>Location:</strong> {session.campus_location}</p>
                </article>
              ))
            )}
          </div>
        </section>
      )}

      <div className="exchange-footer">
        <button
          type="button"
          className="exchange-refresh"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>
    </main>
  );
}
