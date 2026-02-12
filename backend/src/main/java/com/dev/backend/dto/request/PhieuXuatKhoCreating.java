package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.Instant;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PhieuXuatKhoCreating {
    Integer donBanHangId;
    Instant ngayXuat;
    String ghiChu;
    List<ChiTietPhieuXuatKhoCreating> chiTietXuat;
}
