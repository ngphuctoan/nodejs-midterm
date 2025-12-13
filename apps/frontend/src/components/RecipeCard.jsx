import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment'; 

function RecipeCard({ recipe }) {
  const { id, info, reminder, isDone } = recipe;
  
  const image_url = `/recipes/${id}/image`; 

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden border-t-4 border-blue-500">
      
      <div className="relative h-40">
        
        <img
          src={image_url}
          alt={info.name}
          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} 
          className="w-full h-full object-cover"
        />
        
        <span 
          className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full shadow-md ${
            isDone 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-500 text-white'
          }`}
        >
          {isDone ? 'HOÀN THÀNH' : 'ĐANG LÀM'}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-2">
          {info.name}
        </h3>
        
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {info.content || 'Chưa có nội dung chi tiết cho công thức này.'}
        </p>

        {reminder && !isDone && (
            <p className="text-sm text-red-500 flex items-center mb-4">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Nhắc nhở: {moment(reminder).fromNow()}
            </p>
        )}

        <div className="flex justify-end mt-3">
          <Link
            to={`/recipes/${id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 text-sm"
          >
            Xem Chi Tiết →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;