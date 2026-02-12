package com.dev.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OtpDonMuaHangGetting {
    Integer donMuaHangId;
    String email;
}
