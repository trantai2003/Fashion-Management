package com.dev.backend.controller;

import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.ChatLieuDto;
import com.dev.backend.mapper.ChatLieuMapper;
import com.dev.backend.services.impl.entities.ChatLieuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat-lieu")
public class ChatLieuController {

    @Autowired
    private ChatLieuService chatLieuService;

    @Autowired
    private ChatLieuMapper chatLieuMapper;


    @GetMapping("/all")
    public ResponseEntity<ResponseData<List<ChatLieuDto>>> getAll() {
        return ResponseEntity.ok(
                ResponseData.<List<ChatLieuDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(chatLieuMapper.toDtoList(chatLieuService.getAll()))
                        .build()
        );
    }

}
