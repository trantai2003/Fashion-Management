package com.dev.backend.dto.response.entities;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.Instant;

/**
 * DTO for {@link com.dev.backend.entities.NguoiDung}
 */
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@EqualsAndHashCode(of = {"id"})
public class NguoiDungDto implements Serializable {
    Integer id;
    String tenDangNhap;
    String hoTen;
    String email;
    String soDienThoai;
    String vaiTro;
    Integer trangThai;
    Instant ngayTao;
    Instant ngayCapNhat;
}