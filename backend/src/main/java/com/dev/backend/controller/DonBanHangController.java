package com.dev.backend.controller;

import com.dev.backend.constant.variables.IPermissionType;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.customize.DonBanHangDetailResponse;
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
    @GetMapping("/{id}/detail")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_kho,
                    IRoleType.nhan_vien_ban_hang
            },
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<DonBanHangDetailResponse>> getDetail(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(
                ResponseData.<DonBanHangDetailResponse>builder()
                        .status(200)
                        .data(donBanHangService.getDetail(id))
                        .message("Success")
                        .error(null)
                        .build()
        );
    }
    @PutMapping("/{id}/send-to-warehouse")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.nhan_vien_ban_hang
            },
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<String>> sendToWarehouse(
            @PathVariable Integer id
    ) {
        donBanHangService.sendToWarehouse(id);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(200)
                        .data("Success")
                        .message("Đã gửi đơn sang kho")
                        .error(null)
                        .build()
        );
    }
    @PutMapping("/{id}/cancel")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.nhan_vien_ban_hang
            },
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<String>> cancel(
            @PathVariable Integer id
    ) {
        donBanHangService.cancel(id);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(200)
                        .data("Success")
                        .message("Đã hủy đơn bán")
                        .error(null)
                        .build()
        );
    }
}