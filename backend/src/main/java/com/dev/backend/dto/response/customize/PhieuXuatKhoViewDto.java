package com.dev.backend.dto.response.customize;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.*;

import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class PhieuXuatKhoViewDto {
    private Integer id;
    private String soPhieuXuat;
    private Instant ngayXuat;
    private Integer trangThai;
    private String ghiChu;
    private String tenKho;
    private String soDonHang;
    private String nguoiDuyet;
    private String nguoiXuat;
}

