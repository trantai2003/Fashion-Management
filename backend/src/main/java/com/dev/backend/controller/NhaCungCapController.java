package com.dev.backend.controller;

import com.dev.backend.dto.request.NhaCungCapCreating;
import com.dev.backend.dto.request.NhaCungCapUpdating;
import com.dev.backend.dto.response.entities.NhaCungCapDto;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.services.impl.entities.NhaCungCapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplier")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // Cho phép frontend gọi
public class NhaCungCapController {

    private final NhaCungCapService service;

    @GetMapping
    public ResponseEntity<ResponseData> getAll(@RequestParam(required = false) String search) {
        List<NhaCungCapDto> dtos = service.findAll(search);
        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .data(dtos)
                .message("Lấy danh sách nhà cung cấp thành công")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseData> getById(@PathVariable Integer id) {
        NhaCungCapDto dto = service.findByIdDto(id);
        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .data(dto)
                .message("Lấy chi tiết nhà cung cấp thành công")
                .build());
    }

    @PostMapping
    public ResponseEntity<ResponseData> create(@RequestBody NhaCungCapCreating creating) {
        NhaCungCapDto dto = service.create(creating);
        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .data(dto)
                .message("Thêm nhà cung cấp mới thành công")
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseData> update(@PathVariable Integer id, @RequestBody NhaCungCapUpdating updating) {
        NhaCungCapDto dto = service.update(id, updating);
        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .data(dto)
                .message("Cập nhật nhà cung cấp thành công")
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseData> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .message("Xóa nhà cung cấp thành công")
                .build());
    }
}