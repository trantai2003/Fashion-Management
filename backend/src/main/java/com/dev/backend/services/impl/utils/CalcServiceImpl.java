package com.dev.backend.services.impl.utils;

import com.dev.backend.services.CalcService;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class CalcServiceImpl implements CalcService {

    @Override
    public String getRandomActiveCode(Long lenghtOfString) {
        String characters = "0123456789";
        StringBuilder randomString = new StringBuilder();
        Random random = new Random();
        for (int i = 0;
             i < lenghtOfString; i++) {
            int index = random.nextInt(characters.length());
            char randomChar = characters.charAt(index);
            randomString.append(randomChar);
        }
        return randomString.toString();
    }
}
