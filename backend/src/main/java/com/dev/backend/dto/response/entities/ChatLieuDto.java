package com.dev.backend.dto.response.entities;

import lombok.Data;

import java.time.Instant;

@Data
public class ChatLieuDto {
    private Integer id;
    private String maChatLieu;
    private String tenChatLieu;
    private String moTa;
    private Instant ngayTao;
}