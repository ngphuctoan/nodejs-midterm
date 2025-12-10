import React from 'react';
import { Link } from 'react-router-dom';

function SavedRecipeCard({ recipe }) {
  const image_url = `/saved-recipes/${recipe.id}/image`; 

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden border-t-4 border-yellow-500">
      
      <div className="relative h-40">
        
        <img
          src={image_url}
          alt={recipe.info.name}
          onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-recipe-image.jpg'; }} // Dùng ảnh mặc định nếu lỗi
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-2">
          {recipe.info.name}
        </h3>
        
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {recipe.info.content || 'Công thức này chưa có nội dung chi tiết.'}
        </p>

        <div className="flex justify-between items-center mt-3">
          <Link
            to={`/saved-recipes/${recipe.id}`} 
            className="text-yellow-600 hover:text-yellow-700 font-medium transition duration-150"
          >
            Xem chi tiết →
          </Link>
          
          {/* <button className="text-red-500 hover:text-red-700 text-sm">Xóa</button> */}
        </div>
      </div>
    </div>
  );
}

export default SavedRecipeCard;