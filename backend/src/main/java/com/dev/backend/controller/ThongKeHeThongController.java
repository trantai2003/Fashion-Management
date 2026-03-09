package com.dev.backend.controller;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.constant.variables.IPermissionType;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.customize.TonKhoChiTietDTO;
import com.dev.backend.dto.response.entities.SanPhamQuanAoDto;
import com.dev.backend.dto.response.entities.TonKhoTheoLoDto;
import com.dev.backend.entities.SanPhamQuanAo;
import com.dev.backend.mapper.TonKhoTheoLoMapper;
import com.dev.backend.services.impl.entities.TonKhoTheoLoService;
import com.dev.backend.services.multitable.ThongKeHeThongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/thong-ke-he-thong")
public class ThongKeHeThongController {

    @Autowired
    private ThongKeHeThongService thongKeHeThongService;

    @Autowired
    private TonKhoTheoLoService tonKhoTheoLoService;
    @Autowired
    private TonKhoTheoLoMapper tonKhoTheoLoMapper;

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
    ) {
        return thongKeHeThongService.findTonKhoChiTietByKho(SecurityContextHolder.getKhoId());
    }


    @GetMapping("/ton-kho-bien-the/{bienTheId}")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_kho,
                    IRoleType.nhan_vien_mua_hang,
                    IRoleType.nhan_vien_ban_hang
            },
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<List<TonKhoChiTietDTO>>> tonKhoBienThe(@PathVariable Integer bienTheId) {
        return thongKeHeThongService.findTonKhoChiTietByBienThe(bienTheId);
    }

    @GetMapping("/san-pham/ban-chay/{top}")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_ban_hang
            },
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<List<SanPhamQuanAoDto>>> sanPhamBanChay(@PathVariable Integer top){
        return tonKhoTheoLoService.sanPhamBanChay(top);
    }

}
