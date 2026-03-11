package com.dev.backend.dto.response;

import java.math.BigDecimal;

/**
 * Projection interface cho báo cáo Nhật ký Nhập - Xuất kho.
 *
 * Tên getter phải khớp chính xác (case-insensitive) với alias trong native query.
 */
public interface NhatKyNhapXuatDTO {

    /** Nhãn trục X / tên kho: "01/06", "Tuần 1", "T1/2025", "2025", "KHO01"... */
    String     getNhanThoiGian();

    /** Tổng số lượng nhập trong kỳ (đơn vị: sản phẩm) */
    BigDecimal getTongNhap();

    /** Tổng số lượng xuất trong kỳ (luôn dương để hiển thị) */
    BigDecimal getTongXuat();

    /** Chênh lệch tồn kho = tongNhap - tongXuat (có thể âm) */
    BigDecimal getChenhLech();

    /** Tổng giá trị hàng nhập = Σ(số lượng × giá vốn) cho phiếu nhập */
    BigDecimal getTongGiaTriNhap();

    /** Tổng giá trị hàng xuất = Σ(số lượng × giá vốn) cho phiếu xuất */
    BigDecimal getTongGiaTriXuat();

    /** Số phiếu nhập kho trong kỳ */
    Long getSoPhieuNhap();

    /** Số phiếu xuất kho (bán hàng + chuyển kho + điều chỉnh) trong kỳ */
    Long getSoPhieuXuat();

    /** Khóa sắp xếp nội bộ — không render ra UI */
    Integer getSortKey();
}
