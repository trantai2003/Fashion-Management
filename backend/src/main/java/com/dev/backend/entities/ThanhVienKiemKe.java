package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "thanh_vien_kiem_ke")
public class ThanhVienKiemKe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "dot_kiem_ke_id", nullable = false)
    private DotKiemKe dotKiemKe;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private NguoiDung nguoiDung;

    @ColumnDefault("'thanh_vien'")
    @Lob
    @Column(name = "vai_tro")
    private String vaiTro;

    @Size(max = 200)
    @Column(name = "phan_khu_vuc", length = 200)
    private String phanKhuVuc;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_tham_gia")
    private Instant ngayThamGia;

    @ColumnDefault("1")
    @Column(name = "trang_thai")
    private Boolean trangThai;

    @Lob
    @Column(name = "ghi_chu")
    private String ghiChu;


}