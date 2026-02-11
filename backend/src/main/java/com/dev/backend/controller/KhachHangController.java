package com.dev.backend.controller;

import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.KhachHangDto;
import com.dev.backend.mapper.KhachHangMapper;
import com.dev.backend.services.impl.entities.KhachHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
