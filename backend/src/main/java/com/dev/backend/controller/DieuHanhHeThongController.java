package com.dev.backend.controller;

import com.dev.backend.constant.variables.IPermissionType;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.GanVaiTro;
import com.dev.backend.dto.request.PhanQuyenNguoiDungKhoCreating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.QuyenHanDto;
import com.dev.backend.entities.NguoiDung;
import com.dev.backend.entities.PhanQuyenNguoiDungKho;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.QuyenHanMapper;
import com.dev.backend.services.impl.entities.NguoiDungService;
import com.dev.backend.services.impl.entities.PhanQuyenNguoiDungKhoService;
import com.dev.backend.services.impl.entities.QuyenHanService;
import com.dev.backend.services.multitable.DieuHanhHeThongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dieu-hanh-he-thong")
class DieuHanhHeThongController {
    @Autowired
    private QuyenHanService quyenHanService;

    @Autowired
    private DieuHanhHeThongService dieuHanhHeThongService;

    @Autowired
    private PhanQuyenNguoiDungKhoService phanQuyenNguoiDungKhoService;

    @Autowired
    private QuyenHanMapper quyenHanMapper;

    @Autowired
    private NguoiDungService nguoiDungService;


    //Lấy danh sách quyền hạn trong hệ thống
    @GetMapping("/quyen-han/all")
    public ResponseEntity<ResponseData<List<QuyenHanDto>>> getAll() {
        return ResponseEntity.ok(
                ResponseData.<List<QuyenHanDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(
                                quyenHanMapper.toDtoList(quyenHanService.getAll())
                        ).message("Success").build()
        );
    }

    // Gán quyền cho một user trong hệ thống vào một kho nào đó
    @PostMapping("/quyen-han/gan-quyen")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho},
            permissions = {IPermissionType.cap_quyen_nhan_vien},
            inWarehouse = true,
            permissionsLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<String>> ganQuyenNhanVienKho(
            @RequestBody PhanQuyenNguoiDungKhoCreating pqndkCreating) {

        return dieuHanhHeThongService.ganQuyenNhanVienKho(pqndkCreating);
    }

    @DeleteMapping("/quyen-han/xoa-quyen/{id}")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho},
            permissions = {IPermissionType.cap_quyen_nhan_vien},
            inWarehouse = true,
            permissionsLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<String>> xoaQuyenNhanVienKho(
            @PathVariable Integer id
    ){
        PhanQuyenNguoiDungKho phanQuyenNguoiDungKho = phanQuyenNguoiDungKhoService.getOne(id).orElseThrow(
                () -> new CommonException("Không tìm thấy phân quyền người dùng kho id: " + id)
        );

        phanQuyenNguoiDungKhoService.delete(phanQuyenNguoiDungKho.getId());
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .message("Success")
                        .build()
        );
    }

    @PutMapping("/vai-tro/gan-vai-tro")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho}
    )
    public ResponseEntity<ResponseData<String>> ganVaiTro(
            @RequestBody GanVaiTro ganVaiTro) {
        NguoiDung nguoiDung  = nguoiDungService.getOne(ganVaiTro.getId()).orElseThrow(
                () -> new CommonException("Không tìm thấy người dùng id: " + ganVaiTro.getId())
        );
        nguoiDung.setVaiTro(ganVaiTro.getVaiTro());
        nguoiDungService.update(ganVaiTro.getId(), nguoiDung);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .message("Success")
                        .build()
        );
    }


}
