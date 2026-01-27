package com.dev.backend.controller;

import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.*;
import com.dev.backend.dto.response.LoginResponse;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.NguoiDungDto;
import com.dev.backend.entities.NguoiDung;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.NguoiDungMapper;
import com.dev.backend.services.impl.entities.NguoiDungService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/nguoi-dung")
public class NguoiDungController {

    @Autowired
    private NguoiDungService nguoiDungService;

    @Autowired
    private NguoiDungMapper nguoiDungMapper;

    @GetMapping("/get-by-id/{id}")
    public ResponseEntity<ResponseData<NguoiDungDto>> getById(@PathVariable Integer id) {
        Optional<NguoiDung> findingNguoiDung = nguoiDungService.getOne(id);

        if (findingNguoiDung.isEmpty()) {
            throw new CommonException("Không tìm thấy người dùng id: " + id);
        }

        return ResponseEntity.ok(
                ResponseData.<NguoiDungDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(
                                nguoiDungMapper.toDto(findingNguoiDung.get())
                        )
                        .message("Success")
                        .error(null)
                        .build()
        );
    }


    @PostMapping("/register")
    public ResponseEntity<ResponseData<String>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        return nguoiDungService.register(registerRequest);
    }

    @PostMapping("/active-account")
    public ResponseEntity<ResponseData<String>> activeAccount(@RequestBody VerifyAccount verifyDto) {
        return nguoiDungService.activeAccount(verifyDto);
    }


    @PostMapping("/login")
    public ResponseEntity<ResponseData<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        return nguoiDungService.login(loginRequest);
    }

    @PutMapping("/update")
    @RequireAuth(roles = {IRoleType.all})
    public ResponseEntity<ResponseData<NguoiDungDto>> update(@Valid @RequestBody UpdateNguoiDungRequest request) {
        return nguoiDungService.update(request);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseData<String >> forgotPassword(@RequestBody ForgotPasswordRequest fpRequest) {
        return nguoiDungService.forgotPassword(fpRequest);
    }

    @PostMapping("reset-password")
    public ResponseEntity<ResponseData<String >> resetPassword(@RequestBody ResetPasswordRequest rpRequest){
        return nguoiDungService.resetPassword(rpRequest);
    }

    @PostMapping("/filter")
    public ResponseEntity<ResponseData<Page<NguoiDungDto>>> filter(@RequestBody BaseFilterRequest filter) {
        return ResponseEntity.ok(
                ResponseData.<Page<NguoiDungDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(
                                nguoiDungMapper.toDtoPage(nguoiDungService.filter(filter))
                        )
                        .message("Success")
                        .build()
        );
    }
}
