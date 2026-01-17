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
    getUserListAdmin: (params) => {
        return apiClient.get("/api/v1/admin/user-list", {
            params,
        });
    },

    filterUsers: (payload) => {
        return apiClient.post("/api/v1/admin/filter", payload);
    },


    async getById(id) {
        const res = await apiClient.get(`/api/v1/admin/users/${id}`);
        return res.data;
    },
}