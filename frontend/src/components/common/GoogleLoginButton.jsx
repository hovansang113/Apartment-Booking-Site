import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GoogleLoginButton({ redirectTo = '/' }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function handleSuccess(credentialResponse) {
    setError('');
    try {
      const { data } = await api.post('/auth/google', { credential: credentialResponse.credential });
      login(data.data.user, data.data.token);
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed. Please try again.');
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => setError('Google login was cancelled.')}
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
        shape="rectangular"
      />
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
}
