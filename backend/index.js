const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/', (req, res) => {
  res.send('Budget Tracker API is running');
});

app.get('/api/expenses', async (req, res) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/expenses', async (req, res) => {
  const { amount, category, note } = req.body;

  const { data, error } = await supabase
    .from('expenses')
    .insert([{ amount, category, note }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// DELETE an expense
app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});