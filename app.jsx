/* @jsx React.createElement */
const { useState, useEffect, useMemo, useContext, createContext } = React;
const { createRoot } = ReactDOM;
const { HashRouter, Routes, Route, Link, useLocation } = ReactRouterDOM;

// Global state via Context (demo of maintaining state across pages)
const GlobalContext = createContext(null);

function GlobalProvider({ children }) {
  const [visits, setVisits] = useState(0);
  const value = useMemo(() => ({ visits, setVisits }), [visits]);
  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function PageViewTracker() {
  const location = useLocation();
  const { setVisits } = useContext(GlobalContext);
  useEffect(() => {
    setVisits((v) => v + 1);
  }, [location, setVisits]);
  return null;
}

function Home() {
  return (
    <div className="text-center">
      <div className="py-4">
        <h1 className="display-5 fw-bold">React SPA Demo</h1>
        <p className="text-muted">Hash-based routing, global state, and API integration.</p>
        <div className="d-flex gap-2 justify-content-center">
          <Link className="btn btn-primary" to="/search">Try API Search</Link>
          <Link className="btn btn-outline-light" to="/about">Learn More</Link>
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-4">
          <div className="card h-100 p-3">
            <h5>Routing with React Router</h5>
            <p className="text-muted mb-0">Smooth navigation without full page reloads.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 p-3">
            <h5>Global State via Context</h5>
            <p className="text-muted mb-0">State shared across multiple pages.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 p-3">
            <h5>GitHub API Integration</h5>
            <p className="text-muted mb-0">Debounced search with loading and errors.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function About() {
  const { visits } = useContext(GlobalContext);
  return (
    <div className="container-md">
      <h2>About</h2>
      <p className="text-muted">This page demonstrates persistent state using React Context.</p>
      <div className="alert alert-secondary" role="status">
        You have navigated around this SPA <strong>{visits}</strong> time{visits === 1 ? '' : 's'} in this session.
      </div>
      <p>
        The app is served as static files. Navigation uses a Hash Router so it works on any static host (e.g., Netlify, Vercel).
      </p>
    </div>
  );
}

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) e.email = 'Valid email required';
    if (!form.message.trim()) e.message = 'Please enter a message';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('Thanks! Your message has been received.');
    setForm({ name: '', email: '', message: '' });
  };

  const onChange = (k) => (ev) => setForm((f) => ({ ...f, [k]: ev.target.value }));

  return (
    <div className="container-md">
      <h2>Contact</h2>
      <p className="text-muted">A simple client-side validated form.</p>
      <form className="row g-3" onSubmit={submit} noValidate>
        <div className="col-md-6">
          <label htmlFor="c-name" className="form-label">Name</label>
          <input id="c-name" className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={form.name} onChange={onChange('name')} />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        <div className="col-md-6">
          <label htmlFor="c-email" className="form-label">Email</label>
          <input id="c-email" type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} value={form.email} onChange={onChange('email')} />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
        <div className="col-12">
          <label htmlFor="c-message" className="form-label">Message</label>
          <textarea id="c-message" rows="4" className={`form-control ${errors.message ? 'is-invalid' : ''}`} value={form.message} onChange={onChange('message')}></textarea>
          {errors.message && <div className="invalid-feedback">{errors.message}</div>}
        </div>
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-primary" type="submit">Send</button>
          {status && <span className="align-self-center text-success">{status}</span>}
        </div>
      </form>
    </div>
  );
}

function Search() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);

  const debounced = useDebounced(query.trim(), 400);

  useEffect(() => {
    const controller = new AbortController();
    async function run() {
      setError('');
      // Avoid hitting API for very short queries
      if (!debounced || debounced.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(
          `https://api.github.com/search/users?q=${encodeURIComponent(debounced)}&per_page=20`,
          {
            signal: controller.signal,
            headers: { Accept: 'application/vnd.github+json' },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setResults(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        if (e.name !== 'AbortError') {
          setError('Failed to fetch results. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    }
    run();
    return () => controller.abort();
  }, [debounced]);

  function UserListItem({ user }) {
    return (
      <li className="list-group-item d-flex align-items-center gap-3">
        <img
          src={user.avatar_url}
          alt={`Avatar of ${user.login}`}
          width="40"
          height="40"
          loading="lazy"
          decoding="async"
          className="rounded-circle border"
        />
        <div className="flex-grow-1">
          <div className="fw-semibold">{user.login}</div>
          <a href={user.html_url} target="_blank" rel="noreferrer" className="small">Open Profile ↗</a>
        </div>
      </li>
    );
  }

  return (
    <div className="container-md">
      <h2>GitHub User Search</h2>
      <p className="text-muted">Type to search GitHub users. Requests are debounced.</p>

      <div className="mb-3">
        <input
          className="form-control form-control-lg"
          placeholder="Search users, e.g., gaearon"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && <div className="alert alert-info" role="status" aria-live="polite">Loading…</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {!loading && !error && results.length === 0 && debounced && (
        <div className="alert alert-warning">No results found for "{debounced}"</div>
      )}

      <ul className="list-group">
        {results.map((u) => (
          <UserListItem key={u.id} user={u} />
        ))}
      </ul>
    </div>
  );
}

function NotFound() {
  return (
    <div className="text-center">
      <h2 className="mb-2">Page Not Found</h2>
      <p className="text-muted">The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );
}

function App() {
  return (
    <GlobalProvider>
      <HashRouter>
        <PageViewTracker />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </GlobalProvider>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
