package com.dev.backend.controller;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.response.GoiDangKiDto;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.NguoiDungAuthInfo;
import com.dev.backend.entities.GoiDangKi;
import com.dev.backend.entities.NguoiDung;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.GoiDangKiMapper;
import com.dev.backend.services.impl.entities.GoiDangKiService;
import com.dev.backend.services.impl.entities.NguoiDungService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController("/api/v1/goi-dang-ki")
public class GoiDangKiController {

    @Autowired
    private GoiDangKiMapper goiDangKiMapper;

    @Autowired
    private GoiDangKiService goiDangKiService;
    @Autowired
    private NguoiDungService nguoiDungService;


    @PostMapping("/dang-ky/{maGoi}")
    @RequireAuth(roles = {IRoleType.all})
    public ResponseEntity<ResponseData<Void>> dangKy(@PathVariable String maGoi) {
        NguoiDungAuthInfo auth = SecurityContextHolder.getUser();

        NguoiDung nguoiTao = nguoiDungService.getOne(auth.getId()).orElseThrow(
                () -> new CommonException("Không tìm thấy người dùng")
        );
        double thanhTien = 0;
        int trangThai = 0;
        switch (maGoi) {
            case "premium": {
                thanhTien = 219000;
                break;
            }
            case "plus": {
                thanhTien = 159000;
                break;
            }
            default: {
                maGoi = "free";
                trangThai = 1;
                thanhTien = 0;
            }
        }
        GoiDangKi goiDangKi = GoiDangKi.builder()
                .maGoi(maGoi)
                .nguoiTao(nguoiTao)
                .ngayTao(Instant.now())
                .thanhTien(thanhTien)
                .trangThai(trangThai)
                .ngayDuyet(trangThai == 1 ? Instant.now() : null)
                // cộng với 1 tháng
                .ngayHetHan(trangThai == 1 ? Instant.now().plusSeconds(24 * 3600 * 30) : null)
                .build();

        goiDangKiService.create(goiDangKi);

        return ResponseEntity.ok(
                ResponseData.<Void>builder()
                        .status(200)
                        .message("Success")
                        .build()
        );
    }

    @PostMapping("/filter")
    public ResponseEntity<ResponseData<Page<GoiDangKiDto>>> filter(@RequestBody BaseFilterRequest filter) {
        return ResponseEntity.ok(
                ResponseData.<Page<GoiDangKiDto>>builder()
                        .status(200)
                        .message("Success")
                        .data(
                                goiDangKiMapper.toDtoPage(goiDangKiService.filter(filter))
                        )
                        .error(null)
                        .build()
        );
    }

    @RequireAuth(roles = {IRoleType.all})
    @PutMapping("/duyet/{id}/{trangThai}")
    public ResponseEntity<ResponseData<Void>> duyetHuy(
            @PathVariable Integer id, @PathVariable Integer trangThai
    ) {
        // 1 là xác nhận 2 là reject
        NguoiDungAuthInfo auth = SecurityContextHolder.getUser();

        NguoiDung nguoiDuyet = nguoiDungService.getOne(auth.getId()).orElseThrow(
                () -> new CommonException("Không tìm thấy người dùng")
        );

        GoiDangKi goiDangKi = goiDangKiService.getOne(id).orElseThrow(
                () -> new CommonException("Không tìm thấy gói đăng kí id: " + id)
        );


        if(trangThai == 1) {
            goiDangKi.setNgayDuyet(Instant.now());
            goiDangKi.setNgayHetHan(Instant.now().plusSeconds(24 * 3600 * 30));
        } else if(trangThai == 2) {
            goiDangKi.setNgayDuyet(Instant.now());
        }
        goiDangKi.setNguoiDuyet(nguoiDuyet);
        goiDangKi.setTrangThai(trangThai);

        goiDangKiService.update(id,goiDangKi);



        return ResponseEntity.ok(
                ResponseData.<Void>builder()
                        .status(200)
                        .message("Success")
                        .data(null)
                        .error(null)
                        .build()
        );
    }
}
