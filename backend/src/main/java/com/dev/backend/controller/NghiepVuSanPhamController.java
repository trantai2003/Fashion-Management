package com.dev.backend.controller;


import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.constant.variables.IPermissionType;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.DonMuaHangCreating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.DonMuaHangDto;
import com.dev.backend.entities.DonMuaHang;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.services.impl.entities.DonMuaHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/nghiep-vu")
public class NghiepVuSanPhamController {

    @Autowired
    private DonMuaHangService donMuaHangService;


    @PostMapping("/create")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.nhan_vien_ban_hang,
                    IRoleType.nhan_vien_mua_hang
            },
            permissions = {
                    IPermissionType.tao_don_mua_hang
            },
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR,
            permissionsLogic = RequireAuth.LogicType.AND
    )
    public ResponseEntity<ResponseData<DonMuaHangDto>> create(DonMuaHangCreating creating) {
        return donMuaHangService.create(creating);
    }


    @PutMapping("/duyet-don/{trangThai}")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien
            },
            inWarehouse = true
    )
    public ResponseEntity<ResponseData<String>> duyetDon(@PathVariable Integer trangThai){

        DonMuaHang donMuaHang = donMuaHangService.getOne(SecurityContextHolder.getKhoId()).orElseThrow(
                () -> new CommonException("Không tìm thấy kho id: " + SecurityContextHolder.getKhoId())
        );
        donMuaHang.setTrangThai(trangThai);
        donMuaHangService.update(donMuaHang.getId(), donMuaHang);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Success")
                        .message("Success")
                        .error(null)
                        .build()
        );
    }
}
