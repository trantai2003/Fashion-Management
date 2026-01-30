package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "san_pham_quan_ao")
public class SanPhamQuanAo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 50)
    @NotNull
    @Column(name = "ma_san_pham", nullable = false, length = 50)
    private String maSanPham;

    @Size(max = 200)
    @NotNull
    @Column(name = "ten_san_pham", nullable = false, length = 200)
    private String tenSanPham;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "danh_muc_id", nullable = false)
    private DanhMucQuanAo danhMuc;


    @Column(name = "mo_ta")
    private String moTa;

    @Size(max = 100)
    @Column(name = "ma_vach", length = 100)
    private String maVach;

    @ColumnDefault("0.00")
    @Column(name = "gia_von_mac_dinh", precision = 15, scale = 2)
    private BigDecimal giaVonMacDinh;

    @ColumnDefault("0.00")
    @Column(name = "gia_ban_mac_dinh", precision = 15, scale = 2)
    private BigDecimal giaBanMacDinh;

    @ColumnDefault("0")
    @Column(name = "muc_ton_toi_thieu")
    private Integer mucTonToiThieu;

    @ColumnDefault("0")
    @Column(name = "trang_thai")
    private Integer trangThai;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_tao_id")
    private NguoiDung nguoiTao;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_tao")
    private Instant ngayTao;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.UPDATE)
    @Column(name = "ngay_cap_nhat")
    private Instant ngayCapNhat;

    @OneToMany(mappedBy = "quanAo", fetch = FetchType.LAZY)
    private List<AnhQuanAo> anhQuanAos;

    @OneToMany(mappedBy = "sanPham", fetch = FetchType.LAZY)
    private List<BienTheSanPham> bienTheSanPhams;


}