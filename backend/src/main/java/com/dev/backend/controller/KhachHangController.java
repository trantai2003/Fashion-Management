// src/main/java/com/dev/backend/controller/KhachHangController.java
package com.dev.backend.controller;

import com.dev.backend.dto.request.KhachHangUpdating;
import com.dev.backend.dto.response.entities.KhachHangDto;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.services.impl.entities.KhachHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")  // Path tiếng Anh, ngắn gọn
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class KhachHangController {

    private final KhachHangService service;

    // Function Customer Details
    @GetMapping("/{id}")
    public ResponseEntity<ResponseData> getById(@PathVariable Integer id) {
        KhachHangDto dto = service.findByIdDto(id);
        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .data(dto)
                .message("Lấy chi tiết khách hàng thành công")
                .build());
    }

    // Function Edit Customer
    @PutMapping("/{id}")
    public ResponseEntity<ResponseData> update(@PathVariable Integer id, @RequestBody KhachHangUpdating updating) {
        KhachHangDto dto = service.update(id, updating);
        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .data(dto)
                .message("Cập nhật khách hàng thành công")
                .build());
    }
}