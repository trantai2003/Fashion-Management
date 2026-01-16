package com.dev.backend.workers;

import com.dev.backend.constant.GlobalCache;
import com.dev.backend.dto.OtpScheduleObj;
import com.dev.backend.entities.NguoiDung;
import com.dev.backend.services.impl.entities.NguoiDungService;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Component
@Slf4j
@Getter
public class SchedulingJob {
    @Autowired
    private NguoiDungService nguoiDungService;


    @Transactional
    @Scheduled(fixedDelay = 60000)
    public void cleanOutOfDateOtp(){
        Instant now = Instant.now();
        for(OtpScheduleObj otpScheduleObj : GlobalCache.OTP_SCHEDULE_OBJS) {
            if(now.isAfter(otpScheduleObj.getCreatedAt().plusSeconds(300))){
                Optional<NguoiDung> findingNguoiDung = nguoiDungService.findByEmail(otpScheduleObj.getEmail());
                if(findingNguoiDung.isPresent()){
                    if(findingNguoiDung.get().getTrangThai().equals(0)){
                        nguoiDungService.delete(findingNguoiDung.get().getId());
                    }
                }
                GlobalCache.OTP_SCHEDULE_OBJS.remove(otpScheduleObj);
            }
        }
    }


    public void add(OtpScheduleObj otpScheduleObj) {
        GlobalCache.OTP_SCHEDULE_OBJS.add(otpScheduleObj);
    }
}
