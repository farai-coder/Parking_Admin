import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';
import { useAuth } from './AuthProvider';

type FormData = {
  username: string;
  password: string;
};

const Login: React.FC = () => {
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { username, password } = formData;

    // Static login credentials
    const staticCredentials = {
      admin: { password: 'admin123', role: 'admin', id: 1 },
      // user: { password: 'user123', role: 'user', id: 2 }
    };

    try {
      // Check if username exists in static data
      if (staticCredentials[username as keyof typeof staticCredentials]) {
        const userData = staticCredentials[username as keyof typeof staticCredentials];

        // Check if password matches
        if (password === userData.password) {
          // Successful login
          console.log('Login successful with static data');

          // Call the login function with static user data
          login(userData.id, username, userData.role);

          alert('Login successful!');
          navigate('/dashboard');
        } else {
          // Invalid password
          console.error('Login failed: Invalid password');
          alert('Login failed: Invalid password');
        }
      } else {
        // Invalid username
        console.error('Login failed: Invalid username');
        alert('Login failed: Invalid username');
      }
    } catch (error) {
      console.error('An error occurred while logging in:', error);
      alert('An error occurred while logging in. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-[480px] bg-white rounded-2xl p-8 shadow-lg">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <i className="fa-solid fa-shield-halved text-4xl text-blue-600 mb-4"></i>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in to your account</h1>
            <p className="text-gray-600">
              Don't have an account?
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-600 hover:text-blue-700 font-medium ml-2 !rounded-button"
              >
                Sign up
              </button>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fa-solid fa-user text-gray-400 mr-2"></i>
                Username
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fa-solid fa-lock text-gray-400 mr-2"></i>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 !rounded-button">
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium !rounded-button"
            >
              <i className="fa-solid fa-right-to-bracket mr-2"></i>
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;