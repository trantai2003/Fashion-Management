package com.dev.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@ToString
public class RegisterRequest {
     @Size(min = 6, message = "Tên đăng nhập phải lớn hớn 6 ký tự và không vượt quá 15 k tự", max = 50)
     String tenDangNhap;
     String matKhau;
     @Size(min = 6, message = "Họ tên phải lớn hớn 6 ký tự và không vượt quá 15 k tự", max = 100)
     String hoTen;
     @Email
     String email;
     @Size(message = "Sdt phải ít hơn 11 ký tự", min =10, max = 11)
     String soDienThoai;
}
