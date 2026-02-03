package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
@Table(name = "quyen_han")
public class QuyenHan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    Integer id;

    @Size(max = 50)
    @NotNull
    @Column(name = "ma_quyen", nullable = false, length = 50)
    String maQuyen;

    @Size(max = 100)
    @NotNull
    @Column(name = "ten_quyen", nullable = false, length = 100)
    String tenQuyen;

    @Column(name = "mo_ta")
    String moTa;

    @NotNull
    @Column(name = "nhom_quyen", nullable = false)
    String nhomQuyen;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Generated(event = EventType.INSERT)
    @Column(name = "ngay_tao")
    Instant ngayTao;


}