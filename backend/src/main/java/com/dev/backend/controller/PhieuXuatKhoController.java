package com.dev.backend.controller;

import com.dev.backend.constant.variables.IPermissionType;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.PhieuXuatKhoCreating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.ChiTietPhieuNhapKhoResponse;
import com.dev.backend.dto.response.entities.ChiTietPhieuXuatKhoDto;
import com.dev.backend.dto.response.entities.PhieuXuatKhoDto;
import com.dev.backend.entities.PhieuXuatKho;
import com.dev.backend.mapper.PhieuXuatKhoMapper;
import com.dev.backend.services.impl.entities.PhieuXuatKhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/phieu-xuat-kho")
public class PhieuXuatKhoController {
    @Autowired
    private PhieuXuatKhoService phieuXuatKhoService;

    @Autowired
    private PhieuXuatKhoMapper phieuXuatKhoMapper;

    @PostMapping("/filter")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_kho
            },
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public Page<PhieuXuatKhoDto> filter(
            @RequestBody BaseFilterRequest request
    ) {
        Page<PhieuXuatKho> pageEntity =
                phieuXuatKhoService.filter(request);

        return pageEntity.map(phieuXuatKhoMapper::toDto);
    }

    @PostMapping("/create")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_kho
            },
            permissions = {IPermissionType.tao_phieu_xuat},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public Map<String, Object> create(
            @RequestBody PhieuXuatKhoCreating request
    ) {
        PhieuXuatKho phieu =
                phieuXuatKhoService.createFromSO(request);
        return Map.of(
                "id", phieu.getId(),
                "soPhieuXuat", phieu.getSoPhieuXuat()
        );
    }

    @GetMapping("/{id}")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_kho
            },
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ChiTietPhieuNhapKhoResponse getDetail(@PathVariable Integer id) {
        return phieuXuatKhoService.getDetail(id);
    }

    @PutMapping("/{id}/cancel")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
            },
            permissions = {IPermissionType.huy_phieu_xuat},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<String>> cancel(@PathVariable Integer id) {
        phieuXuatKhoService.cancel(id);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .message("Hủy phiếu xuất thành công")
                        .data("SUCCESS")
                        .build()
        );
    }
}
