import { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) setMessage(error.message);
  };

  return (
    <div className="container" style={{ maxWidth: '400px', paddingTop: '80px' }}>
      <h1 style={{ textAlign: 'center' }}>Budget Tracker</h1>
      <p className="subtle" style={{ textAlign: 'center' }}>
        Track your spending, simply.
      </p>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>{isSignUp ? 'Create account' : 'Log in'}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="full">
            {isSignUp ? 'Sign up' : 'Log in'}
          </button>
        </form>

        {message && <div className="error" style={{ marginTop: '12px' }}>{message}</div>}

        <p className="subtle" style={{ marginTop: '16px', marginBottom: 0 }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button className="link" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}