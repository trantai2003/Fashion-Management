package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@ToString
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminUpdateRequest {
    String newPassword;
    Boolean trangThai;        // khóa / mở user
    Integer roleId;           // đổi quyền
    String email;             // đổi email
}
