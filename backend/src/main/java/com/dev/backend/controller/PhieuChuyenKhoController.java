package com.dev.backend.controller;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.constant.enums.FilterLogicType;
import com.dev.backend.constant.enums.FilterOperation;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.FilterCriteria;
import com.dev.backend.dto.request.PhieuChuyenKhoCreating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.customize.TransferDetailDto;
import com.dev.backend.dto.response.entities.PhieuXuatKhoDto;
import com.dev.backend.entities.PhieuXuatKho;
import com.dev.backend.mapper.PhieuXuatKhoMapper;
import com.dev.backend.services.impl.entities.PhieuXuatKhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
        Integer khoId = SecurityContextHolder.getKhoId();
        String keyword = null;
        Integer trangThai = null;
        String khoNhapTen = null;

        // Bóc tách filter từ JSON Frontend gửi lên
        if (request.getFilters() != null) {
            for (FilterCriteria f : request.getFilters()) {
                if ("soPhieuXuat".equals(f.getFieldName())) {
                    keyword = f.getValue() != null ? f.getValue().toString().trim() : null;
                    if (keyword != null && keyword.isEmpty()) keyword = null;
                } else if ("trangThai".equals(f.getFieldName())) {
                    String ttVal = f.getValue() != null ? f.getValue().toString() : "";
                    trangThai = !ttVal.isEmpty() ? Integer.valueOf(ttVal) : null;
                } else if ("khoChuyenDen.tenKho".equals(f.getFieldName())) {
                    khoNhapTen = f.getValue() != null ? f.getValue().toString().trim() : null;
                    if (khoNhapTen != null && khoNhapTen.isEmpty()) khoNhapTen = null;
                }
            }
        }

        // Tự động nhận diện cấu hình Sort từ Frontend (Mặc định: ngayTao DESC)
        Sort sort = Sort.by(Sort.Direction.DESC, "ngayTao");
        if (request.getSorts() != null && !request.getSorts().isEmpty()) {
            String sortField = request.getSorts().get(0).getFieldName();
            Sort.Direction sortDir = "ASC".equalsIgnoreCase(String.valueOf(request.getSorts().get(0).getDirection()))
                    ? Sort.Direction.ASC : Sort.Direction.DESC;
            sort = Sort.by(sortDir, sortField);
        }

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        // Gọi Custom Query
        Page<PhieuXuatKho> pageEntity = phieuXuatKhoService.getDanhSachYeuCauChuyenKhoCustom(khoId, keyword, trangThai, khoNhapTen, pageable);
        Page<PhieuXuatKhoDto> pageDto = pageEntity.map(phieuXuatKhoMapper::toDto);

        return ResponseEntity.ok(
                ResponseData.<Page<PhieuXuatKhoDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(pageDto)
                        .message("Lấy danh sách yêu cầu chuyển kho thành công")
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
            inWarehouse = true,
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
    @PostMapping("/{id}/create-export")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho, IRoleType.nhan_vien_kho},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<PhieuXuatKhoDto>> createExportFromTransfer(@PathVariable Integer id) {
        PhieuXuatKho entity = phieuXuatKhoService.createExportFromTransfer(id);
        PhieuXuatKhoDto dto = phieuXuatKhoMapper.toDto(entity);
        return ResponseEntity.ok(
                ResponseData.<PhieuXuatKhoDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(dto)
                        .message("Tạo phiếu xuất kho thủ công thành công")
                        .build()
        );
    }
    @PutMapping("/{id}/cancel")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho, IRoleType.nhan_vien_kho},
            inWarehouse = true
    )
    public ResponseEntity<ResponseData<String>> cancelTransfer(@PathVariable Integer id) {
        phieuXuatKhoService.cancelTransfer(id);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .message("Hủy phiếu chuyển kho thành công")
                        .data("SUCCESS")
                        .build()
        );
    }
    @PostMapping("/create")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho, IRoleType.nhan_vien_kho},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<PhieuXuatKhoDto>> createTransfer(@RequestBody PhieuChuyenKhoCreating request) {
        PhieuXuatKho entity = phieuXuatKhoService.createTransfer(request); //chạy hàm create tranfer bên service
        PhieuXuatKhoDto dto = phieuXuatKhoMapper.toDto(entity);
        return ResponseEntity.ok(
                ResponseData.<PhieuXuatKhoDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(dto)
                        .message("Tạo yêu cầu điều chuyển hàng hóa thành công")
                        .build()
        );
    }
}