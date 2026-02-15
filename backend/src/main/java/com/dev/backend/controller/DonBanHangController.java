package com.dev.backend.controller;

import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.DonBanHangDto;
import com.dev.backend.entities.DonBanHang;
import com.dev.backend.mapper.DonBanHangMapper;
import com.dev.backend.services.impl.entities.DonBanHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/don-ban-hang")
public class DonBanHangController {

    @Autowired
    private DonBanHangService donBanHangService;

    @Autowired
    private DonBanHangMapper donBanHangMapper;

    @PostMapping("/filter")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_kho,
                    IRoleType.nhan_vien_ban_hang
            },
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<Page<DonBanHangDto>>> filter(
            @RequestBody BaseFilterRequest request
    ) {

        Page<DonBanHang> pageEntity =
                donBanHangService.filter(request);

        return ResponseEntity.ok(
                ResponseData.<Page<DonBanHangDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(pageEntity.map(donBanHangMapper::toDto))
                        .message("Success")
                        .error(null)
                        .build()
        );
    }
}