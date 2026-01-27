package com.dev.backend.dto;

import com.dev.backend.constant.enums.OtpType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode( of = {"email"})
public class OtpScheduleObj {

    String email;
    String otp;
    OtpType type;
    @Builder.Default
    Instant createdAt = Instant.now();
}
