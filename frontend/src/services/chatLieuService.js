// frontend/src/services/chatLieuService.js
import apiClient from './apiClient';

const CHAT_LIEU_API = '/api/chat-lieu';

export const getAllChatLieu = async (search = '') => {
    try {
        const response = await apiClient.get(CHAT_LIEU_API, {
            params: { search },
        });
        return response.data.data; // giả định response { success: true, data: [...] }
    } catch (error) {
        console.error('Lỗi lấy danh sách chất liệu:', error);
        throw error;
    }
};

export const getChatLieuById = async (id) => {
    try {
        const response = await apiClient.get(`${CHAT_LIEU_API}/${id}`);
        return response.data.data;
    } catch (error) {
        console.error('Lỗi lấy chi tiết chất liệu:', error);
        throw error;
    }
};

export const createChatLieu = async (data) => {
    try {
        const response = await apiClient.post(CHAT_LIEU_API, data);
        return response.data;
    } catch (error) {
        console.error('Lỗi tạo chất liệu:', error);
        throw error.response?.data || error;
    }
};

export const updateChatLieu = async (id, data) => {
    try {
        const response = await apiClient.put(`${CHAT_LIEU_API}/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Lỗi cập nhật chất liệu:', error);
        throw error.response?.data || error;
    }
};

export const deleteChatLieu = async (id) => {
    try {
        await apiClient.delete(`${CHAT_LIEU_API}/${id}`);
    } catch (error) {
        console.error('Lỗi xóa chất liệu:', error);
        throw error;
    }
};