package com.dev.backend.dto.response;

import com.dev.backend.dto.response.entities.NguoiDungDto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Value;

import java.io.Serializable;
import java.time.Instant;

/**
 * DTO for {@link com.dev.backend.entities.GoiDangKi}
 */
@Value
public class GoiDangKiDto implements Serializable {
    Integer id;
    NguoiDungDto nguoiTao;
    NguoiDungDto nguoiDuyet;
    @Size(max = 50)
    String maGoi;
    @NotNull
    Double thanhTien;
    Integer trangThai;
    Instant ngayTao;
    Instant ngayCapNhat;
    Instant ngayDuyet;
    Instant ngayHetHan;
}