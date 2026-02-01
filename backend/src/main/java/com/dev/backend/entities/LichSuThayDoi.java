package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "lich_su_thay_doi")
public class LichSuThayDoi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    Integer id;

    @Size(max = 50)
    @Column(name = "loai_tham_chieu", length = 50)
    String loaiThamChieu;

    @Column(name = "id_tham_chieu")
    Integer idThamChieu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kho_id")
    Kho kho;

    @Size(max = 50)
    @Column(name = "hanh_dong", length = 50)
    String hanhDong;

    @Column(name = "gia_tri_cu")
    String giaTriCu;

    @Column(name = "gia_tri_moi")
    String giaTriMoi;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_thuc_hien_id", nullable = false)
    NguoiDung nguoiThucHien;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_thuc_hien")
    Instant ngayThucHien;

    @Column(name = "ghi_chu")
    String ghiChu;


}