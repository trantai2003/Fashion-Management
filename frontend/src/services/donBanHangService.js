import apiClient from "./apiClient";

export const donBanHangService = {
  async filter(payload) {
    const res = await apiClient.post("/api/v1/don-ban-hang/filter",payload);
    return res.data?.data || res.data;
  },
};
