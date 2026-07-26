import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Mic, Activity, CheckCircle } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '0 24px',
      overflowY: 'auto'
    }}>
      
      {/* Navigation / Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '24px 0',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={24} color="var(--accent-purple)" />
          <h1 style={{ fontSize: '1.25rem', fontWeight: '600' }}>AI Life Manager</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary">Sign In</button>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">Get Started</button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '64px 0'
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '64px' }}
        >
          <h2 style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
            fontWeight: '700', 
            lineHeight: 1.1,
            marginBottom: '24px',
            color: 'var(--text-primary)'
          }}>
            Manage Your Life, <br />
            <span style={{ color: 'var(--accent-purple)' }}>Empowered by AI.</span>
          </h2>
          <p style={{ 
            fontSize: '1.1rem', 
            color: 'var(--text-secondary)', 
            lineHeight: 1.6,
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Your personal, intelligent companion that understands your mood, plans your day, and helps you achieve your goals effortlessly.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem', width: 'auto' }}>
              Start for Free
            </button>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px',
            width: '100%'
          }}
        >
          {/* Feature 1 */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px', width: 'max-content' }}>
              <Brain size={28} color="var(--accent-purple)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Smart Day Planning</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
              Our AI analyzes your mood and energy levels to intelligently schedule tasks that maximize your productivity without burning you out.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(13, 148, 136, 0.1)', padding: '12px', borderRadius: '12px', width: 'max-content' }}>
              <Mic size={28} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Voice Interactions</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
              Speak directly to your AI assistant. Tell it how you're feeling or dictate new tasks completely hands-free.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px', width: 'max-content' }}>
              <CheckCircle size={28} color="var(--accent-purple)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Seamless Management</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
              Keep track of your goals, to-dos, and habits in one unified dashboard designed for ultimate clarity.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(13, 148, 136, 0.1)', padding: '12px', borderRadius: '12px', width: 'max-content' }}>
              <Activity size={28} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Workout Programs</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
              Access an extensive library of exercises. Let the AI build routines that align perfectly with your daily energy level.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '32px 0', 
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        borderTop: '1px solid var(--border-glass)'
      }}>
        © {new Date().getFullYear()} AI Life Manager. Empowering your best self.
      </footer>
    </div>
  );
};

export default Welcome;
