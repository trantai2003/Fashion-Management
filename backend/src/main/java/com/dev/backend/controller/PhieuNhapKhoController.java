package com.dev.backend.controller;

import com.dev.backend.constant.variables.IPermissionType;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.KhaiBaoLoRequest;
import com.dev.backend.dto.request.PhieuNhapKhoCreating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.customize.LoHangKhaiBaoDto;
import com.dev.backend.dto.response.entities.ChiTietPhieuNhapKhoDto;
import com.dev.backend.dto.response.entities.PhieuNhapKhoDto;
import com.dev.backend.entities.PhieuNhapKho;
import com.dev.backend.mapper.PhieuNhapKhoMapper;
import com.dev.backend.services.impl.entities.PhieuNhapKhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    //Goods Receipt Create
    @PostMapping("/create")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_kho
            },
            permissions = {IPermissionType.tao_phieu_nhap},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public PhieuNhapKhoDto create(
            @RequestBody PhieuNhapKhoCreating creating
    ) {
        PhieuNhapKho entity = phieuNhapKhoService.createDraft(creating);
        return phieuNhapKhoMapper.toDto(entity);
    }

    @GetMapping("/{id}/detail")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_kho
            },
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ChiTietPhieuNhapKhoDto getDetail(@PathVariable Integer id) {
        return phieuNhapKhoService.getDetail(id);
    }

    @PutMapping("/{id}/cancel")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
            },
            permissions = {IPermissionType.huy_phieu_nhap},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<String>> huyPhieuNhap(@PathVariable Integer id) {
        phieuNhapKhoService.huyPhieuNhap(id);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .message("Hủy phiếu nhập thành công")
                        .data("SUCCESS")
                        .build()
        );
    }
    @PostMapping("/{id}/khai-bao-lo")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_kho
            },
            inWarehouse = true
    )
    public ResponseEntity<ResponseData<String>> khaiBaoLo(
            @PathVariable Integer id,
            @RequestBody KhaiBaoLoRequest request
    ) {
        phieuNhapKhoService.khaiBaoLo(id, request);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .message("Khai báo lô thành công")
                        .data("SUCCESS")
                        .build()
        );
    }

    @GetMapping("/{phieuNhapKhoId}/bien-the/{bienTheSanPhamId}/lo-hang")
    public ResponseEntity<ResponseData<List<LoHangKhaiBaoDto>>> getDanhSachLoDaKhaiBao(
            @PathVariable Integer phieuNhapKhoId,
            @PathVariable Integer bienTheSanPhamId
    ) {
        List<LoHangKhaiBaoDto> data =
                phieuNhapKhoService.getDanhSachLoDaKhaiBao(
                        phieuNhapKhoId,
                        bienTheSanPhamId
                );

        return ResponseEntity.ok(
                ResponseData.<List<LoHangKhaiBaoDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(data)
                        .message("OK")
                        .build()
        );
    }


}
