// src/main/java/com/dev/backend/entities/DotKiemKe.java
package com.dev.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "dot_kiem_ke")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DotKiemKe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_dot_kiem_ke", length = 50)
    private String maDotKiemKe;

    @Column(name = "ten_dot_kiem_ke", length = 200)
    private String tenDotKiemKe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kho_id", nullable = false)
    private Kho kho;

    @Column(name = "loai_kiem_ke")
    @Enumerated(EnumType.STRING)
    private LoaiKiemKe loaiKiemKe;

    @Column(name = "ngay_bat_dau")
    private Instant ngayBatDau;

    @Column(name = "ngay_ket_thuc")
    private Instant ngayKetThuc;

    @Column(name = "ngay_hoan_thanh")
    private Instant ngayHoanThanh;

    @Column(name = "trang_thai")
    private Byte trangThai; // 0: mới tạo, 1: hoàn thành

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_chu_tri_id")
    private NguoiDung nguoiChuTri;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_duyet_id")
    private NguoiDung nguoiDuyet;

    @Column(name = "ngay_duyet")
    private Instant ngayDuyet;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "ly_do")
    private String lyDo;

    @Column(name = "ghi_chu")
    private String ghiChu;

    @Column(name = "ngay_tao")
    private Instant ngayTao;

    @Column(name = "ngay_cap_nhat")
    private Instant ngayCapNhat;

    public enum LoaiKiemKe {
        toan_bo, theo_danh_muc, theo_khu_vuc, dot_xuat
    }
}