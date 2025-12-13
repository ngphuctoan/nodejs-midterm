import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createRecipe, getRecipeById, updateRecipe, uploadRecipeImage } from '../api/recipes';
import moment from 'moment'; 

function RecipeFormPage() {
  const { id } = useParams();  
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [reminder, setReminder] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      getRecipeById(id)
        .then(response => {
          const recipe = response.data;
          setName(recipe.info.name || '');
          setContent(recipe.info.content || '');
          setIsDone(recipe.isDone || false);
          if (recipe.reminder) {
            setReminder(moment(recipe.reminder).format('YYYY-MM-DDTHH:mm'));
          }
        })
        .catch(err => {
          setError('Không thể tải dữ liệu công thức.');
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const recipeData = {
      info: { name, content },
      isDone,
    };
    if (reminder) {
      recipeData.reminder = moment(reminder).toISOString(); 
    }

    try {
      let response;
      if (isEditMode) {
        response = await updateRecipe(id, recipeData);
      } else {
        response = await createRecipe(recipeData);
      }

      const recipeId = isEditMode ? id : response.data.id; 

      if (imageFile) {
        await uploadRecipeImage(recipeId, imageFile); 
      }

      alert(`${isEditMode ? 'Cập nhật' : 'Tạo mới'} công thức thành công!`);
      navigate(`/recipes`);  
    } catch (err) {
      setError(`Lỗi khi ${isEditMode ? 'cập nhật' : 'tạo mới'} công thức.`);
      console.error(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };


  if (loading && isEditMode) return <div className="text-center p-8">Đang tải dữ liệu công thức...</div>;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-700">
        {isEditMode ? 'Chỉnh Sửa Công Thức' : 'Thêm Công Thức Mới'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl">
        {error && <div className="p-3 mb-4 bg-red-100 text-red-600 rounded">{error}</div>}

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="name">Tên Công Thức *</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="content">Nội Dung/Cách Làm</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="reminder">Đặt Lịch Nhắc Nhở</label>
          <input
            type="datetime-local"
            id="reminder"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="mb-4 flex items-center">
            <input
                type="checkbox"
                id="isDone"
                checked={isDone}
                onChange={(e) => setIsDone(e.target.checked)}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-3 text-gray-700 font-medium" htmlFor="isDone">Đã hoàn thành</label>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="image">Tải Ảnh Công Thức</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {imageFile && <p className="mt-2 text-sm text-gray-500">Đã chọn: {imageFile.name}</p>}
        </div>

        <button
          type="submit"
          className={`w-full text-white py-2 px-4 rounded-lg font-semibold transition duration-300 ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
          disabled={loading}
        >
          {loading ? 'Đang Xử Lý...' : (isEditMode ? 'Lưu Thay Đổi' : 'Tạo Công Thức')}
        </button>
      </form>
    </div>
  );
}

export default RecipeFormPage;