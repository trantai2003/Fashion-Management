package com.dev.backend.controller;

import com.dev.backend.constant.variables.IPermissionType;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.customize.TonKhoChiTietDTO;
import com.dev.backend.services.multitable.ThongKeHeThongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@RestController
@RequestMapping("/api/v1/thong-ke-he-thong")
public class ThongKeHeThongController {

    @Autowired
    private ThongKeHeThongService thongKeHeThongService;

    @GetMapping("/ton-kho")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_kho,
                    IRoleType.nhan_vien_mua_hang,
                    IRoleType.nhan_vien_ban_hang
            },
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<List<TonKhoChiTietDTO>>> tonKho(
            @RequestHeader("kho_id") Integer khoId
    ) {
        return thongKeHeThongService.findTonKhoChiTietByKho(khoId);
    }

}
