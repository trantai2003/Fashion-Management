package com.dev.backend.services.impl.utils;

import com.dev.backend.services.CalcService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Random;

@Service
public class CalcServiceImpl implements CalcService {

    private final Random random = new Random();

    @Override
    public String getRandomActiveCode(Long lenghtOfString) {
        String characters = "0123456789";
        StringBuilder randomString = new StringBuilder();
        for (int i = 0;
             i < lenghtOfString; i++) {
            int index = random.nextInt(characters.length());
            char randomChar = characters.charAt(index);
            randomString.append(randomChar);
        }
        return randomString.toString();
    }

    @Override
    public String getRandomProductCode(String prefix) {
        Date now = new Date();
        int y = now.getYear() + 1900;
        int m = now.getMonth() + 1;
        int d = now.getDate();
        // random
        String r = String.format("%04d", random.nextInt(10000));
        return prefix + y + m + d + r;
    }
}
