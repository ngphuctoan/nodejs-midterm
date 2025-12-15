import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {getRecipeById} from '../api/recipes';
import moment from 'moment';
import api from '../api/api';

function RecipeDetailPage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await getRecipeById(id);
        setRecipe(response.data);

        const res = await api.get(`http://localhost:3000/recipes/${id}/image`);
        setImageUrl(res.data);
      } catch (err) {
        setError('Không thể tải chi tiết công thức này.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) return <div className="text-center p-8 text-xl text-blue-500">Đang tải chi tiết công thức...</div>;
  if (error) return <div className="text-center p-8 text-xl text-red-500">{error}</div>;
  if (!recipe) return <div className="text-center p-8 text-xl text-gray-500">Không tìm thấy công thức.</div>;

  return (
    <div className="container mx-auto p-6 max-w-4xl bg-white shadow-xl rounded-xl mt-8">
      <h1 className="text-4xl font-extrabold mb-4 text-gray-800">{recipe.info.name}</h1>
      
      {/* Trạng thái và Nhắc nhở */}
      <div className="flex items-center space-x-4 mb-6">
        <span className={`px-4 py-1.5 text-md font-semibold rounded-full ${recipe.is_done ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {recipe.is_done ? 'Đã Hoàn Thành' : 'Đang Thực Hiện'}
        </span>
        {recipe.reminder && (
          <span className="text-gray-600 flex items-center">
            <svg className="w-5 h-5 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Nhắc nhở: {moment(recipe.reminder).format('HH:mm, DD/MM/YYYY')}
          </span>
        )}
      </div>

      <div className="mb-8">
        <img 
          src={imageUrl} 
          alt={`Ảnh ${recipe.info.name}`} 
          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} 
          className="w-full h-80 object-cover rounded-lg shadow-lg"
        />
      </div>

      <div className="prose max-w-none text-gray-700 leading-relaxed mb-8">
        <h2 className="text-2xl font-bold border-b pb-2 mb-4">Cách làm</h2>
        <p className="whitespace-pre-wrap">{recipe.info.content || 'Chưa có nội dung chi tiết cho công thức này.'}</p>
      </div>
      
      <div className="flex justify-end">
        <Link 
          to={`/recipes/edit/${recipe.id}`}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
        >
          Chỉnh Sửa Công Thức
        </Link>
      </div>
    </div>
  );
}

export default RecipeDetailPage;