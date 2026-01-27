package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "khach_hang")
public class KhachHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 50)
    @NotNull
    @Column(name = "ma_khach_hang", nullable = false, length = 50)
    private String maKhachHang;

    @Size(max = 200)
    @NotNull
    @Column(name = "ten_khach_hang", nullable = false, length = 200)
    private String tenKhachHang;

    @Size(max = 100)
    @Column(name = "nguoi_lien_he", length = 100)
    private String nguoiLienHe;

    @Size(max = 20)
    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @Size(max = 100)
    @Column(name = "email", length = 100)
    private String email;

    @Lob
    @Column(name = "dia_chi")
    private String diaChi;

    @ColumnDefault("'le'")
    @Generated(event = EventType.INSERT)
    @Lob
    @Column(name = "loai_khach_hang")
    private String loaiKhachHang;

    @ColumnDefault("0")
    @Generated(event = EventType.INSERT)
    @Column(name = "trang_thai")
    private Integer trangThai;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_tao")
    private Instant ngayTao;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_cap_nhat")
    private Instant ngayCapNhat;


}