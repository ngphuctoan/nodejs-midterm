import api from "./api";

export const getRecipes = () => api.get('/recipes');

export const getRecipeById = (id) => api.get(`/recipes/${id}`);

export const createRecipe = (data) => api.post('/recipes', data);

export const updateRecipe = (id, data) => api.patch(`/recipes/${id}`, data);

export const uploadRecipeImage = (id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    return api.post(`/recipes/${id}/image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
