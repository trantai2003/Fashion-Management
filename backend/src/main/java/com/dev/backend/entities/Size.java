package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.time.Instant;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "size")
public class Size {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    Integer id;

    @jakarta.validation.constraints.Size(max = 20)
    @NotNull
    @Column(name = "ma_size", nullable = false, length = 20)
    String maSize;

    @jakarta.validation.constraints.Size(max = 50)
    @NotNull
    @Column(name = "ten_size", nullable = false, length = 50)
    String tenSize;

    @ColumnDefault("'chu'")
    @Generated(event = EventType.INSERT)
    @Lob
    @Column(name = "loai_size")
    String loaiSize;

    @ColumnDefault("0")
    @Generated(event = EventType.INSERT)
    @Column(name = "thu_tu_sap_xep")
    Integer thuTuSapXep;

    @Lob
    @Column(name = "mo_ta")
    String moTa;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_tao")
    Instant ngayTao;


}