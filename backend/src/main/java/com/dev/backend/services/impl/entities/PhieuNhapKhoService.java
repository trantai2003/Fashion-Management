package com.dev.backend.services.impl.entities;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.dto.request.PhieuNhapKhoCreating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.PhieuNhapKhoDto;
import com.dev.backend.entities.*;
import com.dev.backend.mapper.PhieuNhapKhoMapper;
import com.dev.backend.repository.*;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class PhieuNhapKhoService extends BaseServiceImpl<PhieuNhapKho, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Autowired
    private DonMuaHangRepository donMuaHangRepository;

    @Autowired
    private KhoRepository khoRepository;

    @Autowired
    private PhieuNhapKhoMapper phieuNhapKhoMapper;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public PhieuNhapKhoService(PhieuNhapKhoRepository repository) {
        super(repository);
    }

    /**
     * CREATE GOODS RECEIPT (DRAFT)
     * Đúng luồng: chỉ tạo phiếu, không nhập lô, không cập nhật tồn kho
     */
    public ResponseEntity<ResponseData<PhieuNhapKhoDto>> create(PhieuNhapKhoCreating creating) {
        // 1. Validate PO tồn tại
        DonMuaHang donMuaHang = donMuaHangRepository.findById(creating.getDonMuaHangId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn mua hàng"));
        // 2. Validate kho
        Kho kho = khoRepository.findById(creating.getKhoId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kho"));
        // 3. Tạo phiếu nhập kho (DRAFT)
        PhieuNhapKho entity = PhieuNhapKho.builder()
                .soPhieuNhap(generateSoPhieu())
                .donMuaHang(donMuaHang)
                .nhaCungCap(donMuaHang.getNhaCungCap())
                .kho(kho)
                .ngayNhap(
                        creating.getNgayNhap() != null
                                ? creating.getNgayNhap()
                                : Instant.now()
                )
                .ghiChu(creating.getGhiChu())
                .nguoiNhap(
                        SecurityContextHolder.getUser() != null
                                ? entityManager.getReference(
                                NguoiDung.class,
                                SecurityContextHolder.getUser().getId()
                        )
                                : null
                )
                .trangThai(0) // 0 = Draft
                .build();
        entity = repository.save(entity);
        return ResponseEntity.ok(
                ResponseData.<PhieuNhapKhoDto>builder()
                        .status(200)
                        .message("Tạo phiếu nhập kho thành công")
                        .data(phieuNhapKhoMapper.toDto(entity))
                        .build()
        );
    }
    private String generateSoPhieu() {
        return "PN" + System.currentTimeMillis();
    }
}
