package com.dev.backend.controller;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.constant.enums.FilterLogicType;
import com.dev.backend.constant.enums.FilterOperation;
import com.dev.backend.constant.variables.IPermissionType;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.BaseFilterRequest;
import com.dev.backend.dto.request.FilterCriteria;
import com.dev.backend.dto.request.PhieuXuatKhoCreating;
import com.dev.backend.dto.request.PickLoHangRequest;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.customize.PickedLotDto;
import com.dev.backend.dto.response.entities.ChiTietPhieuNhapKhoResponse;
import com.dev.backend.dto.response.entities.PhieuXuatKhoDto;
import com.dev.backend.dto.response.entities.TonKhoTheoLoDto;
import com.dev.backend.entities.PhieuXuatKho;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.PhieuXuatKhoMapper;
import com.dev.backend.services.impl.entities.PhieuXuatKhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/phieu-xuat-kho")
public class PhieuXuatKhoController {

    @Autowired
    private PhieuXuatKhoService phieuXuatKhoService;

    @Autowired
    private PhieuXuatKhoMapper phieuXuatKhoMapper;

    @PostMapping("/create")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho, IRoleType.nhan_vien_kho},
            permissions = {IPermissionType.tao_phieu_xuat},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public Map<String, Object> create(@RequestBody PhieuXuatKhoCreating request) {
        PhieuXuatKho phieu = phieuXuatKhoService.createFromSO(request);
        return Map.of(
                "id", phieu.getId(),
                "soPhieuXuat", phieu.getSoPhieuXuat()
        );
    }

    @GetMapping("/{id}")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho, IRoleType.nhan_vien_kho},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ChiTietPhieuNhapKhoResponse getDetail(@PathVariable Integer id) {
        return phieuXuatKhoService.getDetail(id);
    }

    @PutMapping("/{id}/submit")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho, IRoleType.nhan_vien_kho},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<String>> submit(@PathVariable Integer id) {
        phieuXuatKhoService.submit(id);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .message("Gửi duyệt phiếu xuất thành công")
                        .data("SUCCESS")
                        .build()
        );
    }

    @PutMapping("/{id}/approve")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho},
            permissions = {IPermissionType.duyet_phieu_xuat},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<String>> approve(@PathVariable Integer id) {
        Integer managerId = SecurityContextHolder.getUser().getId();
        phieuXuatKhoService.approve(id, managerId);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .message("Phê duyệt phiếu xuất thành công")
                        .data("SUCCESS")
                        .build()
        );
    }

    @PutMapping("/{id}/complete")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho, IRoleType.nhan_vien_kho},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<String>> complete(@PathVariable Integer id) {
        Integer staffId = SecurityContextHolder.getUser().getId();
        phieuXuatKhoService.complete(id, staffId);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .message("Xác nhận xuất kho thành công")
                        .data("SUCCESS")
                        .build()
        );
    }

    @PutMapping("/{id}/cancel")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho},
            permissions = {IPermissionType.huy_phieu_xuat},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<String>> cancel(@PathVariable Integer id) {
        phieuXuatKhoService.cancel(id);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .message("Hủy phiếu xuất thành công")
                        .data("SUCCESS")
                        .build()
        );
    }

    @PostMapping("/{phieuXuatKhoId}/pick-lo")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho, IRoleType.nhan_vien_kho},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<String>> pickLoHang(
            @PathVariable Integer phieuXuatKhoId,
            @RequestBody PickLoHangRequest request
    ) {
        phieuXuatKhoService.pickLoHang(phieuXuatKhoId, request);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .message("Pick lô thành công")
                        .data("SUCCESS")
                        .build()
        );
    }

    @GetMapping("/{phieuXuatKhoId}/available-lots")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho, IRoleType.nhan_vien_kho},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public ResponseEntity<ResponseData<List<TonKhoTheoLoDto>>> getAvailableLots(
            @PathVariable Integer phieuXuatKhoId,
            @RequestParam Integer bienTheSanPhamId
    ) {
        List<TonKhoTheoLoDto> data = phieuXuatKhoService.getAvailableLots(
                phieuXuatKhoId,
                bienTheSanPhamId
        );
        return ResponseEntity.ok(
                ResponseData.<List<TonKhoTheoLoDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(data)
                        .message("OK")
                        .build()
        );
    }

    @GetMapping("/{phieuXuatKhoId}/picked-lots/{chiTietPhieuXuatKhoId}")
    @RequireAuth(
            roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho, IRoleType.nhan_vien_kho},
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR
    )
    public List<PickedLotDto> getPickedLots(
            @PathVariable Integer phieuXuatKhoId,
            @PathVariable Integer chiTietPhieuXuatKhoId
    ) {
        return phieuXuatKhoService.getPickedLots(
                phieuXuatKhoId,
                chiTietPhieuXuatKhoId
        );
    }

    // Bình
    @PostMapping("/filter")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_kho
            },
            inWarehouse = true
    )
    public ResponseEntity<ResponseData<Page<PhieuXuatKhoDto>>> filter(@RequestBody BaseFilterRequest filter) {
        List<FilterCriteria> filters = filter.getFilters();
        if (filters == null) {
            filters = new ArrayList<>();
        }

        // Đảm bảo là mutable list
        if (!(filters instanceof ArrayList)) {
            filters = new ArrayList<>(filters);
        }

        FilterCriteria khoFilter = FilterCriteria.builder()
                .fieldName("kho.id")
                .operation(FilterOperation.EQUALS)
                .value(SecurityContextHolder.getKhoId())
                .logicType(FilterLogicType.AND)
                .build();

        filters.add(0, khoFilter);
        filter.setFilters(filters);
        return ResponseEntity.ok(
                ResponseData.<Page<PhieuXuatKhoDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(phieuXuatKhoMapper.toDtoPage(phieuXuatKhoService.filter(filter)))
                        .build()
        );
    }

    @PostMapping("/get-by-id/{id}")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_kho
            },
            inWarehouse = true
    )
    public ResponseEntity<ResponseData<PhieuXuatKhoDto>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(
                ResponseData.<PhieuXuatKhoDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(
                                phieuXuatKhoMapper.toDto(phieuXuatKhoService.getOne(id).orElseThrow(
                                        () -> new CommonException("Không tìm thấy phiếu xuất kho id: " + id)
                                ))
                        )
                        .build()
        );
    }
}