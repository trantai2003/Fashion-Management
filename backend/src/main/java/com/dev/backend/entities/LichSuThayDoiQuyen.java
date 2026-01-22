package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "lich_su_thay_doi_quyen")
public class LichSuThayDoiQuyen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private NguoiDung nguoiDung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kho_id")
    private Kho kho;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quyen_han_id")
    private QuyenHan quyenHan;

    @NotNull
    @Lob
    @Column(name = "hanh_dong", nullable = false)
    private String hanhDong;

    @Lob
    @Column(name = "gia_tri_cu")
    private String giaTriCu;

    @Lob
    @Column(name = "gia_tri_moi")
    private String giaTriMoi;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_thuc_hien_id", nullable = false)
    private NguoiDung nguoiThucHien;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_thuc_hien")
    private Instant ngayThucHien;

    @Lob
    @Column(name = "ghi_chu")
    private String ghiChu;


}