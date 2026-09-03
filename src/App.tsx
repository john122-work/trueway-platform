import React, { useState, useEffect } from 'react';

const BACKEND_URL = 'https://trueway-backend.onrender.com';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  sport: string;
  league: string;
}

export default function App() {
  const [healthStatus, setHealthStatus] = useState<string>('Checking backend...');
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [betType, setBetType] = useState<'HOME' | 'AWAY' | 'DRAW'>('HOME');
  const [stake, setStake] = useState<number>(10);
  const [odds, setOdds] = useState<number>(1.95);
  const [betMessage, setBetMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/health`)
      .then((res) => res.json())
      .then((data) => setHealthStatus(data.message))
      .catch(() => setHealthStatus('Backend offline or waking up...'));

    fetch(`${BACKEND_URL}/api/sportsbook/matches`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMatches(data);
      })
      .catch((err) => console.error('Error fetching matches:', err));
  }, []);

  const handlePlaceBet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    setLoading(true);
    setBetMessage('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/sportsbook/bet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: selectedMatch.id,
          bet_type: betType,
          stake: Number(stake),
          odds: Number(odds),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBetMessage(`Bet placed successfully! Bet ID: ${data.bet?.id || 'Confirmed'}`);
      } else {
        setBetMessage(`Failed to place bet: ${data.message || 'Error occurred'}`);
      }
    } catch (err) {
      setBetMessage('Error submitting bet to backend API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '25px' }}>
        <h1 style={{ color: '#38bdf8', margin: 0 }}>TRUEWAY Sportsbook & Casino</h1>
        <p style={{ color: '#94a3b8', marginTop: '5px' }}>
          Backend Status: <span style={{ color: '#4ade80' }}>{healthStatus}</span>
        </p>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
        <section>
          <h2>Active Matches</h2>
          {matches.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Loading matches...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {matches.map((match) => (
                <div
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  style={{
                    border: selectedMatch?.id === match.id ? '2px solid #38bdf8' : '1px solid #334155',
                    padding: '15px',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {match.sport} • {match.league}
                  </span>
                  <h3 style={{ margin: '5px 0' }}>{match.home_team} vs {match.away_team}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Click to select for bet slip</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside style={{ border: '1px solid #334155', padding: '20px', borderRadius: '8px', backgroundColor: '#1e293b', height: 'fit-content' }}>
          <h2 style={{ marginTop: 0 }}>Betting Slip</h2>
          {selectedMatch ? (
            <form onSubmit={handlePlaceBet} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Selected Match:</p>
                <strong>{selectedMatch.home_team} vs {selectedMatch.away_team}</strong>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Pick Selection:</label>
                <select
                  value={betType}
                  onChange={(e) => setBetType(e.target.value as any)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155' }}
                >
                  <option value="HOME">Home Win ({selectedMatch.home_team})</option>
                  <option value="DRAW">Draw</option>
                  <option value="AWAY">Away Win ({selectedMatch.away_team})</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Stake ($):</label>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value))}
                  min="1"
                  style={{ width: '93%', padding: '8px', borderRadius: '4px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155' }}
                />
              </div>

              <div>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Est. Return:</p>
                <strong style={{ color: '#4ade80' }}>${(stake * odds).toFixed(2)}</strong> (Odds: {odds})
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px',
                  backgroundColor: '#38bdf8',
                  color: '#0f172a',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Submitting...' : 'Place Bet'}
              </button>

              {betMessage && (
                <p style={{ fontSize: '13px', marginTop: '10px', color: betMessage.startsWith('Bet placed') ? '#4ade80' : '#f87171' }}>
                  {betMessage}
                </p>
              )}
            </form>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Select a match from the left panel to build your bet slip.</p>
          )}
        </aside>
      </main>
    </div>
  );
}
