import React, { useState } from 'react';
import { registerUser } from '../api/auth';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await registerUser({ name, email, password });

      setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      const apiError = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(apiError);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-600">Đăng Ký Tài Khoản</h2>
        
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4 text-center">{error}</p>}
          {success && <p className="text-green-500 bg-green-100 p-3 rounded-lg mb-4 text-center">{success}</p>}

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="name">Tên của bạn</label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="password">Mật Khẩu</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 font-semibold shadow-md"
            disabled={success !== ''} 
          >
            Đăng Ký
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-700 font-medium">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;