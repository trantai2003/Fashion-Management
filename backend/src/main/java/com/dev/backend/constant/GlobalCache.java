package com.dev.backend.constant;

import com.dev.backend.dto.OtpScheduleObj;

import java.util.HashSet;
import java.util.Set;

public interface GlobalCache {

    Set<OtpScheduleObj> OTP_SCHEDULE_OBJS = new HashSet<>();

//    default OtpScheduleObj findRegisterOtpScheduleObj(String email){
//        return OTP_SCHEDULE_OBJS.stream().filter(registerOtpScheduleObj -> registerOtpScheduleObj.getEmail().equals(email)).findFirst().orElse(null);
//    }
//
//    default void add(OtpScheduleObj registerOtpScheduleObj){
//        OTP_SCHEDULE_OBJS.add(registerOtpScheduleObj);
//    }
//
//    default void removeByEmail(String email){
//        OTP_SCHEDULE_OBJS.removeIf(registerOtpScheduleObj -> registerOtpScheduleObj.getEmail().equals(email));
//    }
//
//    default void clear(){
//        OTP_SCHEDULE_OBJS.clear();
//    }
}
