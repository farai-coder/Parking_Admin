import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  email: string;
  name: string;
  surname: string;
  gender: string;
  phone_number: string;
  license_plate: string;
  role: string;
  password: string;
  confirmPassword: string;
}

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    surname: '',
    gender: 'female',
    phone_number: '',
    license_plate: '',
    role: 'staff',
    password: '',
    confirmPassword: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [apiError, setApiError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'info' | 'password'>('info');
  const [createdUserId, setCreatedUserId] = useState<string>('');

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (step === 'info') {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.surname) newErrors.surname = 'Surname is required';
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Valid email is required';
      }
      if (!formData.phone_number || formData.phone_number.length < 10) {
        newErrors.phone_number = 'Phone number must be at least 10 digits';
      }
      if (!formData.license_plate) {
        newErrors.license_plate = 'License plate is required';
      }
    } else {
      if (!formData.password || formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      if (step === 'info') {
        // First submit basic info
        const response = await fetch('http://localhost:8000/users/', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            surname: formData.surname,
            gender: formData.gender,
            phone_number: formData.phone_number,
            license_plate: formData.license_plate,
            role: formData.role
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail ||
            errorData.message ||
            `Server error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        const userId = data.user_id || data.id;

        if (!userId) {
          console.error('API Response:', data);
          throw new Error('User ID not found in response');
        }

        setCreatedUserId(userId);
        setStep('password');
      } else {
        // Submit password
        const passwordResponse = await fetch('http://localhost:8000/auth/set-password', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: createdUserId,
            password: formData.password
          }),
        });

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json().catch(() => ({}));
          throw new Error(
            errorData.detail ||
            errorData.message ||
            'Failed to set password'
          );
        }

        // Show success alert and redirect
        alert('Account has been successfully created! You will now be redirected to login.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setApiError(
        error instanceof Error ?
          error.message :
          'Registration failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignInClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Parklee</h1>
          <p className="text-sm text-gray-500 mb-6">Smart Parking Solutions</p>
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <i className={`fas ${step === 'info' ? 'fa-user-plus' : 'fa-lock'} text-3xl text-blue-600`}></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'info' ? 'Create Account' : 'Set Your Password'}
          </h2>
          <p className="mt-2 text-gray-600">
            {step === 'info' ? 'Join our parking community today' : `For account: ${formData.email}`}
          </p>
        </div>

        {apiError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-circle text-red-500"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{apiError}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {step === 'info' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Surname</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                />
                {errors.surname && <p className="mt-1 text-sm text-red-600">{errors.surname}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
                {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">License Plate</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                />
                {errors.license_plate && <p className="mt-1 text-sm text-red-600">{errors.license_plate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="staff">staff</option>
                  <option value="admin">admin</option>
                  <option value="student">student</option>
                  <option value="visitor">visitor</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-gray-400`}></i>
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? 'Processing...' :
                step === 'info' ? 'Continue to Password Setup' : 'Complete Registration'}
            </button>
          </div>

          {step === 'password' && (
            <button
              type="button"
              onClick={() => setStep('info')}
              className="w-full text-blue-600 hover:text-blue-700 py-2 px-4"
            >
              Back to Account Info
            </button>
          )}

          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">Already have an account?</span>
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 text-sm ml-1"
              onClick={handleSignInClick}
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;