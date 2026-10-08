import { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL;
function App() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const res = await fetch('http://localhost:5000/api/expenses');
    const data = await res.json();
    setExpenses(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch('http://localhost:5000/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amount), category, note }),
    });

    setAmount('');
    setCategory('');
    setNote('');
    fetchExpenses();
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/expenses/${id}`, {
      method: 'DELETE',
    });
    fetchExpenses();
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Budget Tracker</h1>

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