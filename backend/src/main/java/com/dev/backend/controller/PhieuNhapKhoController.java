package com.dev.backend.controller;

import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.response.entities.PhieuNhapKhoDto;
import com.dev.backend.entities.PhieuNhapKho;
import com.dev.backend.mapper.PhieuNhapKhoMapper;
import com.dev.backend.services.impl.entities.PhieuNhapKhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/phieu-nhap-kho")
public class PhieuNhapKhoController {

    @Autowired
    private PhieuNhapKhoService phieuNhapKhoService;

    @Autowired
    private PhieuNhapKhoMapper phieuNhapKhoMapper;

    //Goods Receipt List
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
    public Page<PhieuNhapKhoDto> filter(
            @RequestBody BaseFilterRequest request) {
        Page<PhieuNhapKho> pageEntity = phieuNhapKhoService.filter(request);
        return pageEntity.map(phieuNhapKhoMapper::toDto);
    }
}
