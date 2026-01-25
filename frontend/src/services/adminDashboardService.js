import apiClient from "./apiClient";

export const adminDashboardService = {
  getDashboardByAdmin: () =>
    apiClient.get("/api/v1/admin/dashboard"),
};