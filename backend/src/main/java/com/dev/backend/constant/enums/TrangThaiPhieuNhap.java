package com.dev.backend.constant.enums;

public enum TrangThaiPhieuNhap {
    DRAFT(0),      // Nháp
    PENDING(1),    // Chờ duyệt
    APPROVED(2),   // Đã duyệt
    COMPLETED(3),  // Hoàn tất (Đã nhập kho)
    CANCELLED(4);  // Đã hủy
    private final int value;
    TrangThaiPhieuNhap(int value) { this.value = value; }
    public int getValue() { return value; }
}
