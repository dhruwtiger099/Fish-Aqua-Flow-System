import React, { useState } from 'react';
import { Eye, EyeOff, Fish, LockKeyhole, Mail, UserRound, Waves } from 'lucide-react';

export default function LoginView({ onLogin, onSignup }) {
  const [mode, setMode] = useState('login');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        await onSignup({ name, username, email, password, confirmPassword });
        setMode('login');
        setIdentifier(email);
        setPassword('');
        setConfirmPassword('');
      } else {
        await onLogin({ identifier, password, remember });
      }
    } catch (submitError) {
      setError(submitError.message || 'Request could not be completed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-intro hide-on-mobile" aria-labelledby="login-brand-title">
        <div className="login-brand-mark">
          <Waves size={25} aria-hidden="true" />
        </div>
        <p className="login-eyebrow">AQUA FLOW SYSTEM</p>
        <h1 id="login-brand-title">Smart aquaculture operations.</h1>
        <p className="login-intro__copy">
          Monitor ponds, manage feed and inventory, track fish cycles, and make every farm decision
          with confidence.
        </p>
        <div className="login-intro__facts">
          <span>
            <Fish size={17} aria-hidden="true" /> Pond & biomass tracking
          </span>
          <span>
            <Waves size={17} aria-hidden="true" /> Live farm records
          </span>
        </div>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-panel__header">
          <div className="login-panel__icon">
            <Fish size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="login-eyebrow">FARM WORKSPACE</p>
            <h2 id="login-title">{mode === 'login' ? 'Welcome back' : 'Create your access'}</h2>
          </div>
        </div>
        <p className="login-panel__subtitle">
          {mode === 'login'
            ? 'Sign in to continue managing your aquaculture operation.'
            : 'Choose your own username and password for farm access.'}
        </p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <>
              <label className="login-field">
                <span>Full name</span>
                <div className="login-input-wrap">
                  <UserRound size={18} aria-hidden="true" />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />
                </div>
              </label>
              <label className="login-field">
                <span>Username</span>
                <div className="login-input-wrap">
                  <UserRound size={18} aria-hidden="true" />
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="e.g. farm.manager"
                    autoComplete="username"
                    required
                  />
                </div>
              </label>
              <label className="login-field">
                <span>Work email</span>
                <div className="login-input-wrap">
                  <Mail size={18} aria-hidden="true" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@farmcompany.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>
            </>
          )}
          {mode === 'login' && (
            <label className="login-field">
              <span>Username or work email</span>
              <div className="login-input-wrap">
                <UserRound size={18} aria-hidden="true" />
                <input
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="Username or email"
                  autoComplete="username"
                  required
                />
              </div>
            </label>
          )}
          <label className="login-field">
            <span>Password</span>
            <div className="login-input-wrap">
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
          </label>
          {mode === 'signup' && (
            <label className="login-field">
              <span>Confirm password</span>
              <div className="login-input-wrap">
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </label>
          )}

          {mode === 'login' && (
            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span>Keep me signed in</span>
              </label>
              <button
                type="button"
                className="login-link"
                onClick={() =>
                  setError('Password recovery will be available through your verified email.')
                }
              >
                Forgot password?
              </button>
            </div>
          )}
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
          <button className="login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Please wait…'
              : mode === 'login'
                ? 'Sign in to Aqua Flow'
                : 'Create farm account'}
          </button>
        </form>

        <p className="login-panel__footer">
          {mode === 'login' ? 'New to the workspace?' : 'Already have an account?'}{' '}
          <button
            type="button"
            className="login-link"
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </section>
    </main>
  );
}
