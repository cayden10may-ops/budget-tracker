const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Create a Supabase client that acts as the logged-in user
const clientForUser = (req) =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    global: { headers: { Authorization: req.headers.authorization } },
  });

// Reject requests with no login token
const requireAuth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  next();
};

app.get('/', (req, res) => {
  res.send('Budget Tracker API is running');
});

app.get('/api/expenses', requireAuth, async (req, res) => {
  const supabase = clientForUser(req);
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/expenses', requireAuth, async (req, res) => {
  const supabase = clientForUser(req);
  const { amount, category, note } = req.body;

  const { data, error } = await supabase
    .from('expenses')
    .insert([{ amount, category, note }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

app.delete('/api/expenses/:id', requireAuth, async (req, res) => {
  const supabase = clientForUser(req);
  const { id } = req.params;

  const { error } = await supabase.from('expenses').delete().eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));