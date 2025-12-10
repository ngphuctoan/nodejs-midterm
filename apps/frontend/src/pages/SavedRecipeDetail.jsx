import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSavedRecipeById } from '../api/savedRecipes';

function SavedRecipeDetailPage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const IMAGE_URL = `http://localhost:3000/api/saved-recipes/${id}/image`; 

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await getSavedRecipeById(id);
        setRecipe(response.data);
      } catch (err) {
        setError('Không thể tải chi tiết công thức đã lưu này.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) return <div className="text-center p-8 text-xl text-yellow-500">Đang tải chi tiết công thức đã lưu...</div>;
  if (error) return <div className="text-center p-8 text-xl text-red-500">{error}</div>;
  if (!recipe) return <div className="text-center p-8 text-xl text-gray-500">Không tìm thấy công thức đã lưu.</div>;

  return (
    <div className="container mx-auto p-6 max-w-4xl bg-white shadow-xl rounded-xl mt-8">
      <h1 className="text-4xl font-extrabold mb-4 text-gray-800">{recipe.info.name}</h1>
      
      <div className="flex items-center space-x-4 mb-6">
        <span className="px-4 py-1.5 text-md font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Đã Lưu
        </span>
      </div>

      {/* Ảnh Công Thức */}
      <div className="mb-8">
         
        <img 
          src={IMAGE_URL} 
          alt={`Ảnh ${recipe.info.name}`} 
          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} 
          className="w-full h-80 object-cover rounded-lg shadow-lg"
        />
      </div>

      {/* Nội dung công thức */}
      <div className="prose max-w-none text-gray-700 leading-relaxed mb-8">
        <h2 className="text-2xl font-bold border-b pb-2 mb-4">Cách làm</h2>
        <p className="whitespace-pre-wrap">{recipe.info.content || 'Chưa có nội dung chi tiết cho công thức này.'}</p>
      </div>
      
      {/* Nút chỉnh sửa công thức đã lưu */}
      <div className="flex justify-end">
        <Link 
          to={`/saved-recipes/edit/${recipe.id}`}
          className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition duration-300"
        >
          Chỉnh Sửa Thông Tin Đã Lưu
        </Link>
      </div>
    </div>
  );
}

export default SavedRecipeDetailPage;