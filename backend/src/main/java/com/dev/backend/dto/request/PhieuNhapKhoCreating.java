package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PhieuNhapKhoCreating {
    Integer donMuaHangId;
    Integer khoId;
    Instant ngayNhap;
    String ghiChu;
}
