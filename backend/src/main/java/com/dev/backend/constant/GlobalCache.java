package com.dev.backend.constant;

import com.dev.backend.dto.OtpScheduleObj;

import java.util.HashSet;
import java.util.Set;

public interface GlobalCache {
    Set<OtpScheduleObj> OTP_SCHEDULE_OBJS = new HashSet<>();
}
