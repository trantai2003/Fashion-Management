package com.dev.backend.dto.request;

import com.dev.backend.constant.enums.RoleType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NguoiDungCreating {
    String tenDangNhap;
    String email;
    String hoTen;
    String soDienThoai;
    RoleType vaiTro;
    String matKhau;
}
