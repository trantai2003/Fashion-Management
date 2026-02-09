package com.dev.backend.controller;

import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.PhieuXuatKhoCreating;
import com.dev.backend.dto.response.entities.PhieuXuatKhoDto;
import com.dev.backend.entities.PhieuXuatKho;
import com.dev.backend.mapper.PhieuXuatKhoMapper;
import com.dev.backend.services.impl.entities.PhieuXuatKhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
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
            inWarehouse = true
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

}
