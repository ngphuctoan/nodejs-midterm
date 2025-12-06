import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Header() {
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition duration-300">
          Công Thức Của Tôi 
        </Link>

        <nav>
          {isLoggedIn ? (
            <ul className="flex space-x-6 items-center">
              <li className="text-gray-700 font-medium">
                Chào, {user?.name || 'Bạn'}! 
              </li>
              <li>
                <Link 
                  to="/recipes" 
                  className="text-blue-600 hover:text-blue-800 font-medium transition duration-150"
                >
                  Công Thức
                </Link>
              </li>
              <li>
                <Link 
                  to="/saved-recipes" 
                  className="text-blue-600 hover:text-blue-800 font-medium transition duration-150"
                >
                  Đã Lưu
                </Link>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition duration-300 font-semibold"
                >
                  Đăng Xuất
                </button>
              </li>
            </ul>
          ) : (
            <ul className="flex space-x-4">
              <li>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600 font-medium px-3 py-1.5 transition duration-150"
                >
                  Đăng Nhập
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className="text-gray-700 hover:text-blue-600 font-medium px-3 py-1.5 transition duration-150"
                >
                  Đăng Ký
                </Link>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;