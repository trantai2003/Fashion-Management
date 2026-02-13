package com.dev.backend.controller;

import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.KhachHangCreating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.KhachHangDto;
import com.dev.backend.entities.KhachHang;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.KhachHangMapper;
import com.dev.backend.services.impl.entities.KhachHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import com.dev.backend.dto.request.KhachHangUpdating;
import com.dev.backend.services.impl.entities.KhachHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/khach-hang")
public class KhachHangController {

    @Autowired
    private KhachHangService khachHangService;

    @Autowired
    private KhachHangMapper khachHangMapper;

    @PostMapping("/filter")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien, IRoleType.nhan_vien_ban_hang
            }
    )
    public ResponseEntity<ResponseData<Page<KhachHangDto>>> filter(@RequestBody BaseFilterRequest filter) {
        return ResponseEntity.ok(
                ResponseData.<Page<KhachHangDto>>builder()
                        .status(HttpStatus.OK.value())
                        .message("Success")
                        .data(
                                khachHangMapper.toDtoPage(khachHangService.filter(filter))
                        )
                        .build()
        );
    }

    @GetMapping("/get-by-id/{id}")
    public ResponseEntity<ResponseData<KhachHangDto>>getById(@PathVariable Integer id){
        KhachHang khachHang = khachHangService.getOne(id).orElseThrow(
                () -> new CommonException("Không tìm thấy khách hàng id: " + id)
        );

        return ResponseEntity.ok(
                ResponseData.<KhachHangDto>builder()
                        .status(HttpStatus.OK.value())
                        .message("Success")
                        .data(
                                khachHangMapper.toDto(khachHang)
                        )
                        .build()
        );
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseData<String>> create(@RequestBody KhachHangCreating creating) {
        return khachHangService.create(creating);
    }

    @DeleteMapping("/soft-delete/{id}")
    public ResponseEntity<ResponseData<String>> softDelete(@PathVariable Integer id) {
        KhachHang khachHang = khachHangService.getOne(id).orElseThrow(
                () -> new CommonException("Không tìm thấy khách hàng id: " + id)
        );

        khachHang.setTrangThai(0);
        khachHangService.update(khachHang.getId(), khachHang);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .message("Success")
                        .data("Success")
                        .build()
        );
    }
}
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