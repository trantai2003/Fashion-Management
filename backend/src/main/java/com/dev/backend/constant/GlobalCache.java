package com.dev.backend.constant;

import com.dev.backend.dto.ApplicationRequestObj;
import com.dev.backend.dto.OtpScheduleObj;

import java.util.HashSet;
import java.util.Set;

public interface GlobalCache {
    //Lưu danh sách OTP của người dùng
    Set<OtpScheduleObj> OTP_SCHEDULE_OBJS = new HashSet<>();
    Set<ApplicationRequestObj> APPLICATION_REQUEST_OBJS = new HashSet<>();
}
