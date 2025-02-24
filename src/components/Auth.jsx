import { motion } from 'framer-motion';

export const Auth = () => {
  return (
    <div className="auth-container">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="auth-card"
      >
        <h2 style={{ color: 'white', marginBottom: '20px' }}>Login</h2>
        <input
          className="auth-input"
          type="email"
          placeholder="Email"
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Password"
        />
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="auth-button"
        >
          Sign In
        </motion.button>
      </motion.div>
    </div>
  );
};
