package com.dev.backend.dto.response;

import java.math.BigDecimal;

public interface KhachHangTangTruongDTO {
    String     getNhanThoiGian();
    Long       getSoKhachMoi();        // Khách hàng mới trong kỳ   → CỘT
    Long       getSoKhachQuayLai();    // Khách mua lại trong kỳ    → CỘT
    Long       getTongKhachMua();      // Tổng khách có đơn trong kỳ
    Long       getTichLuyKhachMoi();   // Tổng cộng dồn khách mới   → ĐƯỜNG
    BigDecimal getTyLeTangTruong();    // % tăng so với kỳ trước    → ĐƯỜNG PHỤ
    Integer    getSortKey();
}