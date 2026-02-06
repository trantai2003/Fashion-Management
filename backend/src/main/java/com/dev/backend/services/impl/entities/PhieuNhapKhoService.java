package com.dev.backend.services.impl.entities;

import com.dev.backend.dto.request.ChiTietPhieuNhapKhoCreating;
import com.dev.backend.dto.request.PhieuNhapKhoCreating;
import com.dev.backend.dto.response.entities.ChiTietPhieuNhapKhoDto;
import com.dev.backend.dto.response.entities.PhieuNhapKhoItemDto;
import com.dev.backend.entities.*;
import com.dev.backend.repository.*;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class PhieuNhapKhoService extends BaseServiceImpl<PhieuNhapKho, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Autowired
    private DonMuaHangRepository donMuaHangRepository;

    @Autowired
    private ChiTietPhieuNhapKhoRepository chiTietPhieuNhapKhoRepository;


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
    @Transactional
    public PhieuNhapKho createDraft(PhieuNhapKhoCreating request) {

        if (request.getChiTietPhieuNhapKhos() == null || request.getChiTietPhieuNhapKhos().isEmpty()) {
            throw new RuntimeException("Danh sách sản phẩm nhập không được rỗng");
        }

        DonMuaHang donMuaHang = donMuaHangRepository.findById(request.getDonMuaHangId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy PO"));

        PhieuNhapKho phieuNhapKho = PhieuNhapKho.builder()
                .soPhieuNhap(generateSoPhieu())
                .donMuaHang(donMuaHang)
                .nhaCungCap(donMuaHang.getNhaCungCap())
                .kho(donMuaHang.getKhoNhap())
                .ngayNhap(
                        request.getNgayNhap() != null
                                ? request.getNgayNhap()
                                : Instant.now()
                )
                .ghiChu(request.getGhiChu())
                .trangThai(0)
                .tongTien(BigDecimal.ZERO)
                .build();

        phieuNhapKho = repository.save(phieuNhapKho);

        for (ChiTietPhieuNhapKhoCreating item : request.getChiTietPhieuNhapKhos()) {
            ChiTietDonMuaHang ctPo =
                    donMuaHang.getChiTietDonMuaHangs().stream()
                            .filter(poItem ->
                                    poItem.getBienTheSanPham().getId()
                                            .equals(item.getBienTheSanPhamId())
                            )
                            .findFirst()
                            .orElseThrow(() ->
                                    new RuntimeException("Không tìm thấy sản phẩm trong PO")
                            );

            ChiTietPhieuNhapKho ct = ChiTietPhieuNhapKho.builder()
                    .phieuNhapKho(phieuNhapKho)
                    .bienTheSanPham(ctPo.getBienTheSanPham())
                    .soLuongNhap(item.getSoLuongDuKienNhap())
                    .donGia(ctPo.getDonGia())   // lấy tu PO
                    .loHang(null)               // Draft chưa có lô
                    .build();

            chiTietPhieuNhapKhoRepository.save(ct);
        }

        return phieuNhapKho;
    }

    // ================= DETAIL =================
    @Transactional(readOnly = true)
    public ChiTietPhieuNhapKhoDto getDetail(Integer id) {

        PhieuNhapKho phieuNhapKho = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

        List<PhieuNhapKhoItemDto> items =
                phieuNhapKho.getChiTietPhieuNhapKhos().stream()
                        .map(ct -> {

                            BigDecimal soLuongCanNhap = ct.getSoLuongNhap();

                            BigDecimal soLuongDaKhaiBaoLo =
                                    chiTietPhieuNhapKhoRepository.sumSoLuongDaNhap(
                                            phieuNhapKho.getId(),
                                            ct.getBienTheSanPham().getId()
                                    );

                            boolean daDuLo =
                                    soLuongDaKhaiBaoLo.compareTo(soLuongCanNhap) >= 0;

                            return PhieuNhapKhoItemDto.builder()
                                    .bienTheSanPhamId(ct.getBienTheSanPham().getId())
                                    .sku(ct.getBienTheSanPham().getMaSku())
                                    .tenBienThe(ct.getBienTheSanPham().getSanPham().getTenSanPham())
                                    .soLuongCanNhap(soLuongCanNhap)
                                    .soLuongDaNhap(soLuongDaKhaiBaoLo)
                                    .daDuLo(daDuLo)
                                    .build();
                        })
                        .toList();

        return ChiTietPhieuNhapKhoDto.builder()
                .id(phieuNhapKho.getId())
                .soPhieuNhap(phieuNhapKho.getSoPhieuNhap())
                .trangThai(phieuNhapKho.getTrangThai())
                .ngayNhap(phieuNhapKho.getNgayNhap())
                .donMuaHangId(phieuNhapKho.getDonMuaHang().getId())
                .soDonMua(phieuNhapKho.getDonMuaHang().getSoDonMua())
                .nhaCungCapId(phieuNhapKho.getNhaCungCap().getId())
                .tenNhaCungCap(phieuNhapKho.getNhaCungCap().getTenNhaCungCap())
                .khoId(phieuNhapKho.getKho().getId())
                .tenKho(phieuNhapKho.getKho().getTenKho())
                .items(items)
                .build();
    }

    private String generateSoPhieu() {
        return "PN" + System.currentTimeMillis();
    }
}
