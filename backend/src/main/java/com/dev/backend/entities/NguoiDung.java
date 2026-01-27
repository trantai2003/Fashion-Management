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
@Table(name = "nguoi_dung")
public class NguoiDung {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 50)
    @NotNull
    @Column(name = "ten_dang_nhap", nullable = false, length = 50)
    private String tenDangNhap;

    @Size(max = 255)
    @NotNull
    @Column(name = "mat_khau_hash", nullable = false)
    private String matKhauHash;

    @Size(max = 100)
    @NotNull
    @Column(name = "ho_ten", nullable = false, length = 100)
    private String hoTen;

    @Size(max = 100)
    @Column(name = "email", length = 100)
    private String email;

    @Size(max = 20)
    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @NotNull
    
    @Column(name = "vai_tro", nullable = false)
    private String vaiTro;

    @ColumnDefault("0")
    @Column(name = "trang_thai")
    private Integer trangThai;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_tao")
    @Generated(event = EventType.INSERT)
    private Instant ngayTao;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_cap_nhat")
    @Generated(event = EventType.UPDATE)
    private Instant ngayCapNhat;


}