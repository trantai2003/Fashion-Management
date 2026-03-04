package com.dev.backend.controller;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.constant.enums.FilterLogicType;
import com.dev.backend.constant.enums.FilterOperation;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.FilterCriteria;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.customize.TransferDetailDto;
import com.dev.backend.dto.response.entities.PhieuXuatKhoDto;
import com.dev.backend.entities.PhieuXuatKho;
import com.dev.backend.mapper.PhieuXuatKhoMapper;
import com.dev.backend.services.impl.entities.PhieuXuatKhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/phieu-chuyen-kho")
public class PhieuChuyenKhoController {

    @Autowired
    private PhieuXuatKhoService phieuXuatKhoService;

    @Autowired
    private PhieuXuatKhoMapper phieuXuatKhoMapper;

    /**
     * API lấy danh sách phiếu chuyển kho (Màn hình List)
     * Tự động lọc theo kho hiện tại và loại xuất là 'chuyen_kho'
     */
    @PostMapping("/filter")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho, IRoleType.nhan_vien_kho},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<Page<PhieuXuatKhoDto>>> filter(@RequestBody BaseFilterRequest request) {
        List<FilterCriteria> filters = request.getFilters();
        if (filters == null) filters = new ArrayList<>();
        else filters = new ArrayList<>(filters);
        filters.add(0, FilterCriteria.builder()
                .fieldName("kho.id")
                .operation(FilterOperation.EQUALS)
                .value(SecurityContextHolder.getKhoId())
                .logicType(FilterLogicType.AND)
                .build());
        filters.add(FilterCriteria.builder()
                .fieldName("loaiXuat")
                .operation(FilterOperation.EQUALS)
                .value("chuyen_kho")
                .logicType(FilterLogicType.AND)
                .build());
        request.setFilters(filters);
        Page<PhieuXuatKho> pageEntity = phieuXuatKhoService.filter(request);
        Page<PhieuXuatKhoDto> pageDto = pageEntity.map(phieuXuatKhoMapper::toDto);
        return ResponseEntity.ok(
                ResponseData.<Page<PhieuXuatKhoDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(pageDto)
                        .message("Lấy danh sách phiếu chuyển kho thành công")
                        .build()
        );
    }
    @GetMapping("/{id}")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho, IRoleType.nhan_vien_kho},
            inWarehouse = true
    )
    public ResponseEntity<ResponseData<TransferDetailDto>> getDetail(@PathVariable Integer id) {
        TransferDetailDto data = phieuXuatKhoService.getTransferDetail(id);
        return ResponseEntity.ok(
                ResponseData.<TransferDetailDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(data)
                        .message("Lấy chi tiết phiếu chuyển thành công")
                        .build()
        );
    }
    @PutMapping("/{id}/submit")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho, IRoleType.nhan_vien_kho},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<String>> submitTransfer(@PathVariable Integer id) {
        phieuXuatKhoService.submitTransfer(id);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .message("Gửi duyệt phiếu chuyển kho thành công")
                        .data("SUCCESS")
                        .build()
        );
    }
    @PutMapping("/{id}/approve")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho},
            inWarehouse = true, // Annotation này sẽ kiểm tra user có thuộc kho nào đó không
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<String>> approveTransfer(@PathVariable Integer id) {
        Integer managerId = SecurityContextHolder.getUser().getId();
        phieuXuatKhoService.approveTransfer(id, managerId);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .message("Phê duyệt phiếu chuyển kho thành công")
                        .data("SUCCESS")
                        .build()
        );
    }
}