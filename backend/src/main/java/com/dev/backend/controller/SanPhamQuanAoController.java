package com.dev.backend.controller;

import com.dev.backend.constant.variables.IPermissionType;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.SanPhamQuanAoCreating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.SanPhamQuanAoDto;
import com.dev.backend.services.impl.entities.SanPhamQuanAoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/san-pham-quan-ao")
public class SanPhamQuanAoController {

    @Autowired
    private SanPhamQuanAoService sanPhamQuanAoService;


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

}
