import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Profile.css";

export default function Profile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="profile-page">
        <output>Loading your profile…</output>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="profile-page">
      <Link to="/">← Back to movies</Link>

      <h1>Your profile</h1>

      <section
        className="profile-card"
        aria-labelledby="account-details-heading"
      >
        <h2 id="account-details-heading">Account details</h2>

        <dl className="profile-details">
          <div>
            <dt>Username</dt>
            <dd>{user.username}</dd>
          </div>

          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
        </dl>
      </section>

      <section
        className="profile-card"
        aria-labelledby="viewing-history-heading"
      >
        <h2 id="viewing-history-heading">Viewing history</h2>
        <p>Viewing history is coming soon.</p>
      </section>
    </main>
  );
}
