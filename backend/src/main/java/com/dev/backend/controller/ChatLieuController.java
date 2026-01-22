package com.dev.backend.controller;

import com.dev.backend.dto.request.ChatLieuCreating;
import com.dev.backend.dto.request.ChatLieuUpdating;
import com.dev.backend.dto.response.entities.ChatLieuDto;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.services.impl.entities.ChatLieuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat-lieu")
@RequiredArgsConstructor
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class ChatLieuController {

    private final ChatLieuService service;

    @GetMapping
    public ResponseEntity<ResponseData> getAll(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String search) {

        List<ChatLieuDto> dtos = service.findAll(search);

        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .data(dtos)
                .message("Lấy danh sách chất liệu thành công")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseData> getById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id) {

        ChatLieuDto dto = service.findByIdDto(id);

        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .data(dto)
                .message("Lấy chi tiết chất liệu thành công")
                .build());
    }

    @PostMapping
    public ResponseEntity<ResponseData> create(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ChatLieuCreating creating) {

        ChatLieuDto dto = service.create(creating);

        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .data(dto)
                .message("Thêm chất liệu mới thành công")
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseData> update(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id,
            @RequestBody ChatLieuUpdating updating) {

        ChatLieuDto dto = service.update(id, updating);

        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .data(dto)
                .message("Cập nhật chất liệu thành công")
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseData> delete(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id) {

        service.delete(id);

        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .message("Xóa chất liệu thành công")
                .build());
    }
}
