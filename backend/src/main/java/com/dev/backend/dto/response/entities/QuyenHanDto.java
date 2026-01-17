package com.dev.backend.dto.response.entities;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.Instant;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@EqualsAndHashCode(of = {"id"})
public class QuyenHanDto implements Serializable {
    Integer id;
    String maQuyen;
    String tenQuyen;
    String moTa;
    String nhomQuyen;
    Instant ngayTao;
}
