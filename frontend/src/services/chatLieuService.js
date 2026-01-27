// frontend/src/services/chatLieuService.js
import apiClient from './apiClient';

// Base URL cho API chất liệu
const CHAT_LIEU_API = '/api/material';

/**
 * Lấy danh sách chất liệu (có search)
 * Pattern: GIỐNG HỆT supplierService - trả về response.data.data || []
 * @param {string} search - Từ khóa tìm kiếm (mã hoặc tên chất liệu)
 * @returns {Promise<Array>} - Danh sách chất liệu
 */
export const getAllChatLieu = async (search = '') => {
    try {
        const response = await apiClient.get(CHAT_LIEU_API, {
            params: { search }
        });
        // Trả về mảng từ response.data.data - GIỐNG supplierService
        return response.data.data || [];
    } catch (error) {
        console.error('Lỗi lấy danh sách chất liệu:', error);
        throw error;
    }
};

/**
 * Lấy chi tiết chất liệu theo ID
 * @param {number|string} id - ID của chất liệu
 * @returns {Promise<Object>} - Thông tin chất liệu
 */
export const getChatLieuById = async (id) => {
    try {
        const response = await apiClient.get(`${CHAT_LIEU_API}/${id}`);
        // Trả về response.data.data - GIỐNG supplierService
        return response.data.data;
    } catch (error) {
        console.error('Lỗi lấy chi tiết chất liệu:', error);
        throw error;
    }
};

/**
 * Tạo chất liệu mới
 * @param {Object} data - Dữ liệu chất liệu mới
 * @param {string} data.maChatLieu - Mã chất liệu
 * @param {string} data.tenChatLieu - Tên chất liệu
 * @param {string} data.moTa - Mô tả (optional)
 * @returns {Promise<Object>} - Kết quả tạo mới
 */
export const createChatLieu = async (data) => {
    try {
        const response = await apiClient.post(CHAT_LIEU_API, data);
        return response.data.data;
    } catch (error) {
        console.error('Lỗi tạo chất liệu:', error);
        throw error;
    }
};

/**
 * Cập nhật chất liệu theo ID
 * @param {number|string} id - ID của chất liệu cần cập nhật
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<Object>} - Kết quả cập nhật
 */
export const updateChatLieu = async (id, data) => {
    try {
        const response = await apiClient.put(`${CHAT_LIEU_API}/${id}`, data);
        // Trả về response.data.data - GIỐNG supplierService
        return response.data.data;
    } catch (error) {
        console.error('Lỗi cập nhật chất liệu:', error);
        throw error;
    }
};

/**
 * Xóa chất liệu theo ID
 * @param {number|string} id - ID của chất liệu cần xóa
 * @returns {Promise<void>}
 */
export const deleteChatLieu = async (id) => {
    try {
        // Delete không cần return data
        await apiClient.delete(`${CHAT_LIEU_API}/${id}`);
    } catch (error) {
        console.error('Lỗi xóa chất liệu:', error);
        throw error;
    }
};