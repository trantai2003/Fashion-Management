package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "goi_dang_ki")
public class GoiDangKi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_tao_id")
    private NguoiDung nguoiTao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_duyet_id")
    private NguoiDung nguoiDuyet;

    @Size(max = 50)
    @ColumnDefault("(_utf8mb4'free')")
    @Column(name = "ma_goi", length = 50)
    private String maGoi;

    @NotNull
    @Column(name = "thanh_tien", nullable = false)
    private Double thanhTien;

    @ColumnDefault("0")
    @Column(name = "trang_thai")
    private Integer trangThai; // 0 là chưa thanh toán, 1 là đã thanh toán

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_tao")
    private Instant ngayTao;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_cap_nhat")
    private Instant ngayCapNhat;

    @Column(name = "ngay_duyet")
    private Instant ngayDuyet;

    @Column(name = "`ngay_het_han`")
    private Instant ngayHetHan;


}