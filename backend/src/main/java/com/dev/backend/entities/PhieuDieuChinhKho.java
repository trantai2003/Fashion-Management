package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "phieu_dieu_chinh_kho")
public class PhieuDieuChinhKho {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 50)
    @NotNull
    @Column(name = "so_phieu", nullable = false, length = 50)
    private String soPhieu;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dot_kiem_ke_id", nullable = false)
    private DotKiemKe dotKiemKe;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kho_id", nullable = false)
    private Kho kho;

    @ColumnDefault("'ca_hai'")
    @Lob
    @Column(name = "loai_dieu_chinh")
    private String loaiDieuChinh;

    @NotNull
    @Column(name = "ngay_dieu_chinh", nullable = false)
    private Instant ngayDieuChinh;

    @ColumnDefault("0")
    @Column(name = "trang_thai")
    private Boolean trangThai;

    @ColumnDefault("0.00")
    @Column(name = "tong_gia_tri_tang", precision = 15, scale = 2)
    private BigDecimal tongGiaTriTang;

    @ColumnDefault("0.00")
    @Column(name = "tong_gia_tri_giam", precision = 15, scale = 2)
    private BigDecimal tongGiaTriGiam;

    @ColumnDefault("0.00")
    @Column(name = "gia_tri_chenh_lech_thuan", precision = 15, scale = 2)
    private BigDecimal giaTriChenhLechThuan;

    @Lob
    @Column(name = "ly_do")
    private String lyDo;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_lap_id", nullable = false)
    private NguoiDung nguoiLap;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_duyet_id")
    private NguoiDung nguoiDuyet;

    @Column(name = "ngay_duyet")
    private Instant ngayDuyet;

    @Lob
    @Column(name = "ghi_chu")
    private String ghiChu;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_tao")
    private Instant ngayTao;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_cap_nhat")
    private Instant ngayCapNhat;


}