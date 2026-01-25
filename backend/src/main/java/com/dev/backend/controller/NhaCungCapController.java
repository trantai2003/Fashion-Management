package com.dev.backend.controller;

import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
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
public class NhaCungCapController {

    private final NhaCungCapService service;

    // Supplier List - GET /api/supplier
    @GetMapping
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho, IRoleType.nhan_vien_mua_hang}
    )
    public ResponseEntity<ResponseData> getAll(@RequestParam(required = false) String search) {
        List<NhaCungCapDto> dtos = service.findAll(search);
        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .data(dtos)
                .message("Lấy danh sách nhà cung cấp thành công")
                .build());
    }

    // Supplier Detail (View & Edit) - GET /api/supplier/{id}
    // Endpoint này dùng chung cho cả xem chi tiết và lấy dữ liệu để edit
    @GetMapping("/{id}")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho, IRoleType.nhan_vien_mua_hang}
    )
    public ResponseEntity<ResponseData> getById(@PathVariable Integer id) {
        NhaCungCapDto dto = service.findByIdDto(id);
        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .data(dto)
                .message("Lấy chi tiết nhà cung cấp thành công")
                .build());
    }

    // Add Supplier - POST /api/supplier
    @PostMapping
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.nhan_vien_mua_hang}
    )
    public ResponseEntity<ResponseData> create(@RequestBody NhaCungCapCreating creating) {
        NhaCungCapDto dto = service.create(creating);
        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .data(dto)
                .message("Thêm nhà cung cấp mới thành công")
                .build());
    }

    // Edit Supplier - PUT /api/supplier/{id}
    @PutMapping("/{id}")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.nhan_vien_mua_hang}
    )
    public ResponseEntity<ResponseData> update(@PathVariable Integer id, @RequestBody NhaCungCapUpdating updating) {
        NhaCungCapDto dto = service.update(id, updating);
        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .data(dto)
                .message("Cập nhật nhà cung cấp thành công")
                .build());
    }

    // Delete Supplier - DELETE /api/supplier/{id}
    @DeleteMapping("/{id}")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.nhan_vien_mua_hang}
    )
    public ResponseEntity<ResponseData> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok(ResponseData.builder()
                .status(200)
                .message("Xóa nhà cung cấp thành công")
                .build());
    }
}