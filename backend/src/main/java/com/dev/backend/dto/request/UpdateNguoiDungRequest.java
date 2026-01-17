package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@ToString
public class UpdateNguoiDungRequest {
    String tenDangNhap;
    String hoTen;
    String email;
    String soDienThoai;
}
