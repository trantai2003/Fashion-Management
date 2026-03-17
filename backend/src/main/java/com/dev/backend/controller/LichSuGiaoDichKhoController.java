package com.dev.backend.controller;

import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.LichSuGiaoDichKhoDto;
import com.dev.backend.services.impl.entities.LichSuGiaoDichKhoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lich-su-giao-dich-kho")
@RequiredArgsConstructor
public class LichSuGiaoDichKhoController {

    private final LichSuGiaoDichKhoService service;

    @GetMapping
    public ResponseEntity<ResponseData> getList() {
        List<LichSuGiaoDichKhoDto> list = service.getAll();
        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .data(list)
                .message("Lấy lịch sử giao dịch thành công")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseData> getChiTiet(@PathVariable Integer id) {
        LichSuGiaoDichKhoDto dto = service.getChiTiet(id);
        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .data(dto)
                .message("Lấy chi tiết lịch sử thành công")
                .build());
    }
}