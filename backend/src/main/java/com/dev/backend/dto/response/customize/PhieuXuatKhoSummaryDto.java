package com.dev.backend.dto.response.customize;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PhieuXuatKhoSummaryDto {
    Integer id;
    String soPhieuXuat;
    Instant ngayXuat;
    Integer trangThai;
    String ghiChu;
}
