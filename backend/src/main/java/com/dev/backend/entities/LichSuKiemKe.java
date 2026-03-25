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
@Table(name = "lich_su_kiem_ke")
public class LichSuKiemKe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "dot_kiem_ke_id", nullable = false)
    private DotKiemKe dotKiemKe;

    @Size(max = 100)
    @NotNull
    @Column(name = "hanh_dong", nullable = false, length = 100)
    private String hanhDong;

    @Lob
    @Column(name = "noi_dung")
    private String noiDung;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_thuc_hien_id", nullable = false)
    private NguoiDung nguoiThucHien;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_thuc_hien")
    private Instant ngayThucHien;


}