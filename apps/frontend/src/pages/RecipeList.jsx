import React, { useState, useEffect } from 'react';
import { getRecipes } from '../api/recipes';
import RecipeCard from '../components/RecipeCard'; // Component riêng

function RecipeListPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await getRecipes();
        setRecipes(response.data);  
      } catch (err) {
        setError('Không thể tải danh sách công thức.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) return <div className="text-center p-8">Đang tải...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800 border-b pb-2">Công Thức Của Tôi 🥘</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300">
              <div className="mt-4 flex justify-between items-center">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${recipe.isDone ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {recipe.isDone ? 'Hoàn thành' : 'Chưa xong'}
                </span>
                <Link to={`/recipes/${recipe.id}`} className="text-blue-500 hover:text-blue-700 font-medium">Chi tiết →</Link> 
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">Bạn chưa có công thức nào. Hãy thêm một công thức mới!</p>
        )}
      </div>
      <button className="fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition duration-300 text-xl font-bold">
        +
      </button>
    </div>
  );
}

export default RecipeListPage;