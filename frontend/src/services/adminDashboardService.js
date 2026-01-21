import apiClient from "./apiClient";

export const adminDashboardService = {
  getDashboard: () =>
    apiClient.get("/api/v1/admin/dashboard"),
};