package com.dev.backend.dto.response;

import com.dev.backend.dto.response.entities.NguoiDungDto;
import lombok.*;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@ToString
public class LoginResponse {
    NguoiDungDto nguoiDung;
    String token;
}
