import React, { useState, useEffect } from 'react';

const BACKEND_URL = 'https://trueway-backend.onrender.com';

export default function App() {
  const [healthStatus, setHealthStatus] = useState<string>('Checking backend...');
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    // Check backend health
    fetch(`${BACKEND_URL}/health`)
      .then((res) => res.json())
      .then((data) => setHealthStatus(data.message))
      .catch(() => setHealthStatus('Backend offline or waking up...'));

    // Fetch live matches
    fetch(`${BACKEND_URL}/api/sportsbook/matches`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMatches(data);
      })
      .catch((err) => console.error('Error fetching matches:', err));
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ color: '#38bdf8', margin: 0 }}>TRUEWAY Sportsbook & Casino</h1>
        <p style={{ color: '#94a3b8', marginTop: '5px' }}>
          Backend Status: <span style={{ color: '#4ade80' }}>{healthStatus}</span>
        </p>
      </header>

      <main>
        <h2>Active Sports Matches</h2>
        {matches.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No active matches found in database.</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {matches.map((match) => (
              <div key={match.id} style={{ border: '1px solid #334155', padding: '15px', borderRadius: '8px', backgroundColor: '#1e293b' }}>
                <h3>{match.home_team} vs {match.away_team}</h3>
                <p style={{ color: '#cbd5e1' }}>Sport: {match.sport}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
