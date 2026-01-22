package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.generator.EventType;

import java.time.Instant;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "phan_quyen_nguoi_dung_kho")
public class PhanQuyenNguoiDungKho {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private NguoiDung nguoiDung;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "kho_id", nullable = false)
    private Kho kho;

    @ColumnDefault("0")
    @Column(name = "la_quan_ly_kho")
    private Integer laQuanLyKho;

    @ColumnDefault("0")
    @Column(name = "trang_thai")
    private Integer trangThai;

    @Column(name = "ngay_bat_dau")
    private Instant ngayBatDau;

    @Column(name = "ngay_ket_thuc")
    private Instant ngayKetThuc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_cap_quyen_id")
    private NguoiDung nguoiCapQuyen;

    @Lob
    @Column(name = "ghi_chu")
    private String ghiChu;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_tao")
    private Instant ngayTao;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.UPDATE)
    @Column(name = "ngay_cap_nhat")
    private Instant ngayCapNhat;

    // join với chi tiết quyền hạn của kho
    @OneToMany(mappedBy = "phanQuyenNguoiDungKho", fetch = FetchType.LAZY)
    private Set<ChiTietQuyenKho> chiTietQuyenKhos;

}