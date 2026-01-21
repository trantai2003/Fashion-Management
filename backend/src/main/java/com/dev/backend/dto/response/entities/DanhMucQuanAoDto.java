package com.dev.backend.dto.response.entities;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.Instant;
import java.util.Set;

/**
 * DTO for {@link com.dev.backend.entities.DanhMucQuanAo}
 */
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@EqualsAndHashCode(of = {"id"})
public class DanhMucQuanAoDto implements Serializable {
    Integer id;
    String maDanhMuc;
    String tenDanhMuc;
    String moTa;
    Integer trangThai;
    Instant ngayTao;
    Set<DanhMucQuanAoDto> danhMucCons;
}