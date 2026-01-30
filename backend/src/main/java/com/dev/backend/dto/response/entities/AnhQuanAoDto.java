package com.dev.backend.dto.response.entities;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.Instant;

/**
 * DTO for {@link com.dev.backend.entities.AnhQuanAo}
 */
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@EqualsAndHashCode(of = {"id"})
public class AnhQuanAoDto implements Serializable {
    Integer id;
    TepTinDto tepTin;
    Integer anhChinh;
    Integer trangThai;
    Instant ngayTao;
    Instant ngayCapNhat;
}