import React, { useState, useEffect } from 'react';
import { getSavedRecipes } from '../api/savedRecipes';
import SavedRecipeCard from '../components/SavedRecipeCard'; 

function SavedRecipeListPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const response = await getSavedRecipes();
        setRecipes(response.data);
      } catch (err) {
        setError('Không thể tải danh sách công thức đã lưu.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRecipes();
  }, []);

  if (loading) return <div className="text-center p-8">Đang tải...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800 border-b pb-2">Công Thức Đã Lưu 📚</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <SavedRecipeCard key={recipe.id} recipe={recipe} />
          ))
        ) : (
          <p className="text-gray-500 col-span-full">Bạn chưa lưu công thức nào.</p>
        )}
      </div>
    </div>
  );
}

export default SavedRecipeListPage;