import apiClient from './apiClient';

const API_URL = '/api/supplier';

// Lấy danh sách (có search)
export const getAllSupplier = async (search = '') => {
    try {
        const response = await apiClient.get(API_URL, { params: { search } });
        return response.data.data || []; // Trả về mảng từ response.data.data
    } catch (error) {
        console.error('Lỗi lấy danh sách nhà cung cấp:', error);
        throw error;
    }
};

// Lấy chi tiết theo ID
export const getSupplierById = async (id) => {
    try {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response.data.data;
    } catch (error) {
        console.error('Lỗi lấy chi tiết nhà cung cấp:', error);
        throw error;
    }
};

// Tạo mới
export const createSupplier = async (data) => {
    try {
        const response = await apiClient.post(API_URL, data);
        return response.data.data;
    } catch (error) {
        console.error('Lỗi tạo nhà cung cấp:', error);
        throw error;
    }
};

// Cập nhật
export const updateSupplier = async (id, data) => {
    try {
        const response = await apiClient.put(`${API_URL}/${id}`, data);
        return response.data.data;
    } catch (error) {
        console.error('Lỗi cập nhật nhà cung cấp:', error);
        throw error;
    }
};

// Xóa
export const deleteSupplier = async (id) => {
    try {
        await apiClient.delete(`${API_URL}/${id}`);
    } catch (error) {
        console.error('Lỗi xóa nhà cung cấp:', error);
        throw error;
    }
};