package com.dev.backend.services.impl.entities;

import com.dev.backend.dto.request.ChiTietPhieuXuatKhoCreating;
import com.dev.backend.dto.request.PhieuXuatKhoCreating;
import com.dev.backend.entities.*;
import com.dev.backend.repository.ChiTietDonBanHangRepository;
import com.dev.backend.repository.PhieuXuatKhoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class PhieuXuatKhoService extends BaseServiceImpl<PhieuXuatKho, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Autowired
    private ChiTietDonBanHangRepository chiTietDonBanHangRepository;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public PhieuXuatKhoService(PhieuXuatKhoRepository repository) {
        super(repository);
    }

    @Transactional
    public PhieuXuatKho createFromSO(PhieuXuatKhoCreating request) {
        if (request.getChiTietXuat() == null
                || request.getChiTietXuat().isEmpty()) {
            throw new RuntimeException("Phiếu xuất phải có ít nhất 1 sản phẩm");
        }
        DonBanHang donBanHang = entityManager.find(
                DonBanHang.class,
                request.getDonBanHangId()
        );
        if (donBanHang == null) {
            throw new RuntimeException("Đơn bán không tồn tại");
        }
        Kho khoXuat = donBanHang.getKhoXuat();
        int retry = 0;
        int maxRetry = 5;
        while (true) {
            try {
                PhieuXuatKho phieu = PhieuXuatKho.builder()
                        .soPhieuXuat(generateSoPhieu())
                        .donBanHang(donBanHang)
                        .kho(khoXuat)
                        .ngayXuat(
                                request.getNgayXuat() != null
                                        ? request.getNgayXuat()
                                        : Instant.now()
                        )
                        .ghiChu(request.getGhiChu())
                        .trangThai(0)
                        .build();
                phieu = repository.save(phieu);
                List<ChiTietDonBanHang> chiTietSOList =
                        chiTietDonBanHangRepository
                                .findByDonBanHangId(donBanHang.getId());
                for (ChiTietPhieuXuatKhoCreating reqCt : request.getChiTietXuat()) {
                    ChiTietDonBanHang ctSO = chiTietSOList.stream()
                            .filter(ct ->
                                    ct.getBienTheSanPham().getId()
                                            .equals(reqCt.getBienTheSanPhamId())
                            )
                            .findFirst()
                            .orElseThrow(() ->
                                    new RuntimeException("SP không thuộc đơn bán")
                            );
                    BigDecimal conLai =
                            ctSO.getSoLuongDat()
                                    .subtract(ctSO.getSoLuongDaGiao());
                    if (reqCt.getSoLuongXuat().compareTo(conLai) > 0) {
                        throw new RuntimeException(
                                "Số lượng xuất vượt quá số lượng còn lại trong SO"
                        );
                    }
                    if (reqCt.getSoLuongXuat().compareTo(BigDecimal.ZERO) <= 0) {
                        throw new RuntimeException("Số lượng xuất phải > 0");
                    }
                    ChiTietPhieuXuatKho ctXuat =
                            ChiTietPhieuXuatKho.builder()
                                    .phieuXuatKho(phieu)
                                    .bienTheSanPham(ctSO.getBienTheSanPham())
                                    .soLuongXuat(reqCt.getSoLuongXuat())
                                    .giaVon(null)
                                    .loHang(null)
                                    .build();
                    entityManager.persist(ctXuat);
                }
                return phieu;
            } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                if (isDuplicateSoPhieu(ex) && retry < maxRetry) {
                    retry++;
                    continue;
                }
                throw ex;
            }
        }
    }
    private String generateSoPhieu() {
        String dateStr = java.time.LocalDate.now()
                .format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);

        String prefix = "PX" + dateStr;

        long countToday = ((PhieuXuatKhoRepository) repository)
                .countBySoPhieuXuatStartingWith(prefix);

        long stt = countToday + 1;

        return prefix + stt;
    }
    private boolean isDuplicateSoPhieu(Exception ex) {
        Throwable cause = ex;
        while (cause != null) {
            if (cause.getMessage() != null &&
                    cause.getMessage().contains("uk_phieu_xuat_kho_so_phieu")) {
                return true;
            }
            cause = cause.getCause();
        }
        return false;
    }
}
