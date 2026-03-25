package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "yeu_cau_mua_hang")
public class YeuCauMuaHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kho_nhap_id", nullable = false)
    private Kho khoNhap;

    @Column(name = "ngay_giao_du_kien")
    private Instant ngayGiaoDuKien;

    @ColumnDefault("0")
    @Column(name = "trang_thai")
    private Integer trangThai; //0: Nháp, 1: Đã gửi, 2: Đã duyệt, 3: Đã tạo đơn yêu cầu báo giá cho nhà cung cấp, 4: Từ chối

    @Column(name = "ghi_chu")
    private String ghiChu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_tao_id")
    private NguoiDung nguoiTao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_duyet_id")
    private NguoiDung nguoiDuyet;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_tao")
    private Instant ngayTao;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_cap_nhat")
    private Instant ngayCapNhat;

    //Danh sách chi tiết yêu cầu mua hàng
    @OneToMany(mappedBy = "yeuCauMuaHang", fetch = FetchType.LAZY)
    private List<ChiTietYeuCauMuaHang> chiTietYeuCauMuaHangs;

}