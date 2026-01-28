package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@Entity
@Table(name = "lich_su_thay_doi")
public class LichSuThayDoi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 50)
    @Column(name = "loai_tham_chieu", length = 50)
    private String loaiThamChieu;

    @Column(name = "id_tham_chieu")
    private Integer idThamChieu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kho_id")
    private Kho kho;

    @Size(max = 50)
    @Column(name = "hanh_dong", length = 50)
    private String hanhDong;

    @Column(name = "gia_tri_cu")
    private String giaTriCu;

    @Column(name = "gia_tri_moi")
    private String giaTriMoi;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_thuc_hien_id", nullable = false)
    private NguoiDung nguoiThucHien;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_thuc_hien")
    private Instant ngayThucHien;

    @Lob
    @Column(name = "ghi_chu")
    private String ghiChu;


}