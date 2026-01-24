import apiClient from "./apiClient";
/**
 * Backend response shape:
 * {
 *   status: number,
 *   data: T,
 *   message: string,
 *   error: any
 * }
 */

export const adminService = {
    getUserListByAdmin: (params) => {
        return apiClient.get("/api/v1/admin/user-list", {
            params,
        });
    },

    filterUsersByAdmin: (payload) => {
        return apiClient.post("/api/v1/admin/filter", payload);
    },


    async getByIdByAdmin(id) {
        const res = await apiClient.get(`/api/v1/admin/users/${id}`);
        return res.data;
    },
    createUserByAdmin(data) {
        return apiClient.post("/api/v1/admin/add-user", data);
    },
    resetUserPasswordByAdmin(userId, payload) {
        return apiClient.post(`/api/v1/admin/users/${userId}/reset-password`, payload);
    },
    toggleUserStatusByAdmin(userId) {
        return apiClient.post(`/api/v1/admin/users/${userId}/toggle-status`);
    }
}