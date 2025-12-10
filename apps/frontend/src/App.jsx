// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import RecipeListPage from './pages/RecipeList';
import Header from './components/Header';
import RecipeFormPage from './pages/RecipeForm';
import RecipeDetailPage from './pages/RecipeDetail';
import SavedRecipeListPage from './pages/SavedRecipeList';
import SavedRecipeDetailPage from './pages/SavedRecipeDetail';  
import SavedRecipeFormPage from './pages/SavedRecipeForm';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <Header /> 
      <Routes>
        <Route path="/" element={<p className="text-center p-8">Chào mừng đến với Hệ thống ghi nhớ công thức!</p>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/recipes" element={<ProtectedRoute><RecipeListPage /></ProtectedRoute>} />
        <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetailPage /></ProtectedRoute>} /> {/* Chi tiết */}
        <Route path="/recipes/new" element={<ProtectedRoute><RecipeFormPage /></ProtectedRoute>} />
        <Route path="/recipes/edit/:id" element={<ProtectedRoute><RecipeFormPage /></ProtectedRoute>} />


        <Route path="/saved-recipes" element={<ProtectedRoute><SavedRecipeListPage /></ProtectedRoute>} />
        <Route path="/saved-recipes/:id" element={<ProtectedRoute><SavedRecipeDetailPage /></ProtectedRoute>} /> 
        <Route path="/saved-recipes/new" element={<ProtectedRoute><SavedRecipeFormPage /></ProtectedRoute>} /> 
        <Route path="/saved-recipes/edit/:id" element={<ProtectedRoute><SavedRecipeFormPage /></ProtectedRoute>} /> 
        
        <Route path="*" element={<h1 className="text-center p-8 text-xl">404 - Không tìm thấy trang</h1>} />
      </Routes>
    </>
  );
}

export default App;