import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchExpenses();
  }, [session]);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  });

  const fetchExpenses = async () => {
    const res = await fetch(`${API_URL}/api/expenses`, { headers: authHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    setExpenses(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(`${API_URL}/api/expenses`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ amount: parseFloat(amount), category, note }),
    });

    setAmount('');
    setCategory('');
    setNote('');
    fetchExpenses();
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/api/expenses/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    fetchExpenses();
  };

  if (loading) return <p>Loading...</p>;
  if (!session) return <Auth />;

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Budget Tracker</h1>
        <button onClick={() => supabase.auth.signOut()}>Log out</button>
      </div>
      <p style={{ color: '#666' }}>Logged in as {session.user.email}</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px' }}
        />
        <input
          type="text"
          placeholder="Category (e.g. Food, Transport)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px' }}
        />
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Add Expense</button>
      </form>

      <h2>Your Expenses</h2>
      {expenses.length === 0 && <p>No expenses yet.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {expenses.map((exp) => (
          <li
            key={exp.id}
            style={{
              borderBottom: '1px solid #ccc',
              padding: '10px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>
              <strong>${exp.amount}</strong> — {exp.category} {exp.note && `(${exp.note})`}
            </span>
            <button onClick={() => handleDelete(exp.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;