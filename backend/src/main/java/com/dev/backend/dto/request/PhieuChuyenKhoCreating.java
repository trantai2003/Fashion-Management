package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PhieuChuyenKhoCreating {
    Integer khoXuatId;      // Kho A
    Integer khoNhapId;      // Kho B
    String ghiChu;
    List<ChiTietPhieuXuatKhoCreating> chiTietXuat;
}
