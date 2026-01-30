package com.dev.backend.controller;

import com.dev.backend.constant.variables.IPermissionType;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.KhoCreating;
import com.dev.backend.dto.request.KhoUpdating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.KhoDto;
import com.dev.backend.entities.Kho;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.KhoMapper;
import com.dev.backend.services.impl.entities.KhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/kho")
public class KhoController {
    @Autowired
    private KhoService khoService;

    @Autowired
    private KhoMapper khoMapper;


    @GetMapping("/get-by-id/{id}")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho}
    )
    public ResponseEntity<ResponseData<KhoDto>> getById(@PathVariable Integer id){
        Optional<Kho> findingKho = khoService.getOne(id);
        if(findingKho.isEmpty()){
            throw new CommonException("Không tìm thấy kho id: " + id);
        }
        return ResponseEntity.ok(
                ResponseData.<KhoDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(khoMapper.toDto(findingKho.get()))
                        .message("Success")
                        .build()
        );
    }

    @PostMapping("/filter")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho}
    )
    public ResponseEntity<ResponseData<Page<KhoDto>>> filter(@RequestBody BaseFilterRequest filter){
        return ResponseEntity.ok(
                ResponseData.<Page<KhoDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(khoMapper.toDtoPage(khoService.filter(filter)))
                        .message("Success")
                        .build()
        );
    }

    @PostMapping("/create")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien}
    )
    public ResponseEntity<ResponseData<KhoDto>> create(@RequestBody KhoCreating creating){
        return khoService.create(creating);
    }

    @PutMapping("/update")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien}
    )
    public ResponseEntity<ResponseData<KhoDto>> update(@RequestBody KhoUpdating updating){
        return khoService.update(updating);
    }

    @DeleteMapping("soft-delete/{id}")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien}
    )
    public ResponseEntity<ResponseData<String>> softDelete(@PathVariable Integer id){
        Optional<Kho> findingKho = khoService.getOne(id);
        if(findingKho.isEmpty()){
            throw new CommonException("Không tìm thấy kho id: " + id);
        }
        Kho kho = findingKho.get();
        kho.setTrangThai(0);
        khoService.update(kho.getId(), kho);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Success")
                        .message("Success")
                        .build()
        );
    }
}
