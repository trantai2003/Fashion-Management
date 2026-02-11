package com.dev.backend.dto.response.entities;

import lombok.*;

import java.util.List;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietPhieuNhapKhoResponse {
        PhieuXuatKhoDto phieu;              // HEADER (reuse)
        List<ChiTietPhieuXuatKhoDto> chiTiet;
}
