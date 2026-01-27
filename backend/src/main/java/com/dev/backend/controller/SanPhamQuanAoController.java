package com.dev.backend.controller;

import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.SanPhamQuanAoCreating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.SanPhamQuanAoDto;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.SanPhamQuanAoMapper;
import com.dev.backend.services.impl.entities.SanPhamQuanAoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/san-pham-quan-ao")
public class SanPhamQuanAoController {

    @Autowired
    private SanPhamQuanAoService sanPhamQuanAoService;
    @Autowired
    private SanPhamQuanAoMapper sanPhamQuanAoMapper;


    @PostMapping(
            value = "/create",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho}
    )
    public ResponseEntity<ResponseData<SanPhamQuanAoDto>> create(
            @RequestPart("creating") SanPhamQuanAoCreating creating,
            @RequestPart(value = "anhSanPhams", required = false) List<MultipartFile> anhSanPhams,
            @RequestPart(value = "anhBienThes", required = false) List<MultipartFile> anhBienThes) {
        return sanPhamQuanAoService.create(creating, anhSanPhams, anhBienThes);

    }

    @GetMapping("/get-by-id/{id}")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_kho,
                    IRoleType.nhan_vien_ban_hang,
                    IRoleType.nhan_vien_mua_hang
            }
    )
    public ResponseEntity<ResponseData<SanPhamQuanAoDto>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(
                ResponseData.<SanPhamQuanAoDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(
                                sanPhamQuanAoMapper.toDto(
                                        sanPhamQuanAoService.getOne(id).orElseThrow(
                                                () -> new CommonException("Không tìm thây sản phẩm quần áo" + id)

                                        ))
                        )
                        .message("Success")
                        .build()
        );
    }

    @PostMapping("/filter")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_kho,
                    IRoleType.nhan_vien_ban_hang,
                    IRoleType.nhan_vien_mua_hang
            }
    )
    public ResponseEntity<ResponseData<Page<SanPhamQuanAoDto>>> filter(@RequestBody BaseFilterRequest filter) {
        return ResponseEntity.ok(
                ResponseData.<Page<SanPhamQuanAoDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(sanPhamQuanAoMapper.toDtoPage(sanPhamQuanAoService.filter(filter)))
                        .build()
        );
    }


    @DeleteMapping("/soft-delete/{id}")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_kho,
                    IRoleType.nhan_vien_ban_hang,
                    IRoleType.nhan_vien_mua_hang
            }
    )
    public ResponseEntity<ResponseData<String>> softDelete(@PathVariable Integer id) {
        sanPhamQuanAoService.changeStatus(id, 0);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Success")
                        .message("Success")
                        .build()
        );
    }
}
