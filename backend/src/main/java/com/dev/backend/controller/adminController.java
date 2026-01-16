package com.dev.backend.controller;

import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.NguoiDungDto;
import com.dev.backend.mapper.NguoiDungMapper;
import com.dev.backend.services.impl.entities.NguoiDungService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/")
public class adminController {
    private final NguoiDungService nguoiDungService;

    private final NguoiDungMapper nguoiDungMapper;

    public adminController(NguoiDungService nguoiDungService, NguoiDungMapper nguoiDungMapper) {
        this.nguoiDungService = nguoiDungService;
        this.nguoiDungMapper = nguoiDungMapper;
    }

    @PostMapping("/filter")
    public ResponseEntity<ResponseData<Page<NguoiDungDto>>> filter(
            @RequestBody BaseFilterRequest filter) {

        return ResponseEntity.ok(
                ResponseData.<Page<NguoiDungDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(
                                nguoiDungMapper.toDtoPage(
                                        nguoiDungService.filter(filter)
                                )
                        )
                        .message("Success")
                        .build()
        );
    }

    @GetMapping("/user-list")
    public ResponseEntity<ResponseData<Page<NguoiDungDto>>> getUserList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        return ResponseEntity.ok(
                ResponseData.<Page<NguoiDungDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(
                                nguoiDungMapper.toDtoPage(
                                        nguoiDungService.getUserList(
                                                PageRequest.of(page, size)
                                        )
                                )
                        )
                        .message("Lấy danh sách người dùng thành công")
                        .build()
        );
    }
}

