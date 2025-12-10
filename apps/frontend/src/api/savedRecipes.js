import api from './api';

export const getSavedRecipes = () => api.get('/saved-recipes');

export const getSavedRecipeById = (id) => api.get(`/saved-recipes/${id}`);

export const createSavedRecipe = (data) => api.post('/saved-recipes', data);

export const updateSavedRecipe = (id, data) => api.patch(`/saved-recipes/${id}`, data);

export const uploadSavedRecipeImage = (id, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  return api.post(`/saved-recipes/${id}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// export const deleteSavedRecipe = (id) => api.delete(`/saved-recipes/${id}`);