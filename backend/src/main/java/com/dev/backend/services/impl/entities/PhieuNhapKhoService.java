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

        int retry = 0;
        int maxRetry = 5;
        while (true) {
            try {
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
            } catch (org.springframework.dao.DataIntegrityViolationException ex) {

                // 👉 chỉ retry khi trùng so_phieu_nhap
                if (isDuplicateSoPhieu(ex) && retry < maxRetry) {
                    retry++;
                    continue;
                }

                throw ex;
            }
        }
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
                                    chiTietPhieuNhapKhoRepository.sumSoLuongDaKhaiBao(
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

    @Transactional
    public void huyPhieuNhap(Integer id) {
        PhieuNhapKho phieuNhapKho = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

        if (phieuNhapKho.getTrangThai() == 1) {
            throw new RuntimeException("Phiếu nhập đã hoàn thành, không thể huỷ");
        }

        if (phieuNhapKho.getTrangThai() == 2) {
            throw new RuntimeException("Phiếu nhập đã bị huỷ trước đó");
        }
        System.out.println("BEFORE = " + phieuNhapKho.getTrangThai());
        phieuNhapKho.setTrangThai(2);
        repository.save(phieuNhapKho);
        repository.flush();
        System.out.println("AFTER = " + phieuNhapKho.getTrangThai());
    }

    private String generateSoPhieu() {
            String dateStr = java.time.LocalDate.now()
                    .format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);

            String prefix = "PN" + dateStr;

            long countToday = ((PhieuNhapKhoRepository) repository)
                    .countBySoPhieuPrefix(prefix);

            long stt = countToday + 1;

            return prefix + stt;
    }

    private boolean isDuplicateSoPhieu(Exception ex) {
        Throwable cause = ex;
        while (cause != null) {
            if (cause.getMessage() != null &&
                    cause.getMessage().contains("uk_phieu_nhap_kho_so_phieu")) {
                return true;
            }
            cause = cause.getCause();
        }
        return false;
    }

    }
