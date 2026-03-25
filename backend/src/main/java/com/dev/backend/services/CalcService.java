package com.dev.backend.services;

public interface CalcService {
    String getRandomActiveCode(Long lenghtOfString);
    String getRandomProductCode(String prefix);
}
