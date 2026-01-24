package com.dev.backend.controller;

import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.response.AdminDashboardResponse;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.services.multitable.AdminDashboardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping
    @RequireAuth(roles = {IRoleType.quan_tri_vien})
    public ResponseEntity<ResponseData<AdminDashboardResponse>> getDashboardByAdmin(
            @RequestHeader("Authorization") String authHeader
    ) {

        return ResponseEntity.ok(
                ResponseData.<AdminDashboardResponse>builder()
                        .status(HttpStatus.OK.value())
                        .data(adminDashboardService.getDashboard())
                        .message("Lấy dashboard admin thành công")
                        .error(null)
                        .build()
        );
    }
}
