import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createSavedRecipe, getSavedRecipeById, updateSavedRecipe, uploadSavedRecipeImage } from '../api/savedRecipes';

function SavedRecipeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      getSavedRecipeById(id)
        .then(response => {
          const recipe = response.data;
          setName(recipe.info.name || '');
          setContent(recipe.info.content || '');
        })
        .catch(err => {
          setError('Không thể tải dữ liệu công thức đã lưu.');
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
    };

    try {
      let response;
      if (isEditMode) {
        response = await updateSavedRecipe(id, recipeData);
      } else {
        response = await createSavedRecipe(recipeData);
      }

      const recipeId = isEditMode ? id : response.data.id; 

      if (imageFile) {
        await uploadSavedRecipeImage(recipeId, imageFile);
      }

      alert(`${isEditMode ? 'Cập nhật' : 'Tạo mới'} công thức đã lưu thành công!`);
      navigate(`/saved-recipes`);
    } catch (err) {
      setError(`Lỗi khi ${isEditMode ? 'cập nhật' : 'tạo mới'} công thức đã lưu.`);
      console.error(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <div className="text-center p-8">Đang tải dữ liệu công thức...</div>;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-yellow-700">
        {isEditMode ? 'Chỉnh Sửa Thông Tin Đã Lưu' : 'Thêm Công Thức Đã Lưu Mới'}
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
            className="w-full px-4 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="content">Nội Dung/Ghi Chú</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            className="w-full px-4 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="image">Tải Ảnh (Tùy chọn)</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
          />
          {imageFile && <p className="mt-2 text-sm text-gray-500">Đã chọn: {imageFile.name}</p>}
        </div>

        <button
          type="submit"
          className={`w-full text-white py-2 px-4 rounded-lg font-semibold transition duration-300 ${loading ? 'bg-gray-400' : 'bg-yellow-600 hover:bg-yellow-700'}`}
          disabled={loading}
        >
          {loading ? 'Đang Xử Lý...' : (isEditMode ? 'Lưu Thay Đổi' : 'Tạo Mới Công Thức Đã Lưu')}
        </button>
      </form>
    </div>
  );
}

export default SavedRecipeFormPage;