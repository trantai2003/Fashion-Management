package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "don_mua_hang")
public class DonMuaHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    Integer id;

    @Size(max = 50)
    @Column(name = "so_don_mua", nullable = false, length = 50)
    String soDonMua;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nha_cung_cap_id", nullable = false)
    NhaCungCap nhaCungCap;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kho_nhap_id", nullable = false)
    Kho khoNhap;

    @NotNull
    @Column(name = "ngay_dat_hang", nullable = false)
    Instant ngayDatHang;

    @Column(name = "ngay_giao_du_kien")
    Instant ngayGiaoDuKien;

    @ColumnDefault("0")
    @Column(name = "trang_thai")
    Integer trangThai;
    // 0 là bị huỷ, 1 là gửi duyệt, 2 là duyệt,
    // 3 là đã gửi mail nhà cung cấp , 4 là nhà cung cấp đã xác nhận và gửi báo giá,
    // 5 là không chấp nhận báo giá, 6 là đã chấp nhận báo giá, 7 là đã thanh toán, 8 là đã nhận
    @ColumnDefault("0.00")
    @Column(name = "tong_tien", precision = 15, scale = 2)
    BigDecimal tongTien;

    @Column(name = "ghi_chu")
    String ghiChu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_tao_id")
    NguoiDung nguoiTao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_duyet_id")
    NguoiDung nguoiDuyet;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_tao")
    Instant ngayTao;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_cap_nhat")
    Instant ngayCapNhat;


    // Danh sách chi tiết đơn mua hàng
    @OneToMany(mappedBy = "donMuaHang", fetch = FetchType.LAZY)
    List<ChiTietDonMuaHang> chiTietDonMuaHangs;


}