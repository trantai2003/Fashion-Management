package com.dev.backend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChatLieuUpdating {

    @Size(max = 50, message = "Mã chất liệu tối đa 50 ký tự")
    private String maChatLieu;

    @Size(max = 100, message = "Tên chất liệu tối đa 100 ký tự")
    private String tenChatLieu;

    private String moTa;
}