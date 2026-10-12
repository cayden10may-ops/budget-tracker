import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';

const API_URL = import.meta.env.VITE_API_URL;

const formatRand = (value) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
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
    setLoadingExpenses(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/expenses`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Could not load expenses');
      setExpenses(await res.json());
    } catch (err) {
      setError(err.message + '. The server may be waking up, so try again in a minute.');
    } finally {
      setLoadingExpenses(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ amount: parseFloat(amount), category, note }),
      });
      if (!res.ok) throw new Error('Could not add expense');
      setAmount('');
      setCategory('');
      setNote('');
      fetchExpenses();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (exp) => {
    setEditingId(exp.id);
    setEditAmount(String(exp.amount));
    setEditCategory(exp.category);
    setEditNote(exp.note || '');
  };

  const cancelEdit = () => setEditingId(null);

  const handleSave = async (id) => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/expenses/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          amount: parseFloat(editAmount),
          category: editCategory,
          note: editNote,
        }),
      });
      if (!res.ok) throw new Error('Could not save changes');
      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/expenses/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Could not delete expense');
      fetchExpenses();
    } catch (err) {
      setError(err.message);
    }
  };

  if (authLoading) return <p className="empty">Loading...</p>;
  if (!session) return <Auth />;

  const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className="container">
      <div className="header">
        <h1>Budget Tracker</h1>
        <button className="secondary" onClick={() => supabase.auth.signOut()}>
          Log out
        </button>
      </div>
      <p className="subtle">Logged in as {session.user.email}</p>

      <div className="card">
        <p className="total-label">Total spent</p>
        <p className="total-amount">{formatRand(total)}</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            step="0.01"
            placeholder="Amount (R)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Category (e.g. Food, Transport)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button type="submit" className="full">Add expense</button>
        </form>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Your expenses</h2>
        {loadingExpenses && expenses.length === 0 && <p className="empty">Loading...</p>}
        {!loadingExpenses && expenses.length === 0 && (
          <p className="empty">No expenses yet. Add your first one above.</p>
        )}
        {expenses.map((exp) =>
          editingId === exp.id ? (
            <div key={exp.id} className="expense" style={{ display: 'block' }}>
              <input
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
              <input
                type="text"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              />
              <input
                type="text"
                placeholder="Note (optional)"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleSave(exp.id)}>Save</button>
                <button className="secondary" onClick={cancelEdit}>Cancel</button>
              </div>
            </div>
          ) : (
            <div key={exp.id} className="expense">
              <div>
                <div>
                  <span className="badge">{exp.category}</span>
                  <span className="expense-amount">{formatRand(exp.amount)}</span>
                </div>
                <div className="expense-meta">
                  {exp.note ? `${exp.note} · ` : ''}
                  {new Date(exp.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="secondary" onClick={() => startEdit(exp)}>Edit</button>
                <button className="danger" onClick={() => handleDelete(exp.id)}>Delete</button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;