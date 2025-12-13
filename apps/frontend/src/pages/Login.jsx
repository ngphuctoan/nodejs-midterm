import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from 'react-router-dom';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await login(email, password);
        } catch (error) {
            setError('Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.');
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold nd-6 text-center text-blue-600">Đăng nhập</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
                    >Đăng Nhập</button>
                </form>
                <p className="mt-6 text-center text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-blue-500 hover:text-blue-700 font-medium">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage;