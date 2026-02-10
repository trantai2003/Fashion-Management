package com.dev.backend.services.impl.entities;

import com.dev.backend.dto.request.ChiTietPhieuXuatKhoCreating;
import com.dev.backend.dto.request.PhieuXuatKhoCreating;
import com.dev.backend.dto.response.entities.ChiTietPhieuNhapKhoResponse;
import com.dev.backend.dto.response.entities.ChiTietPhieuXuatKhoDto;
import com.dev.backend.dto.response.entities.PhieuXuatKhoDto;
import com.dev.backend.entities.*;
import com.dev.backend.repository.ChiTietDonBanHangRepository;
import com.dev.backend.repository.ChiTietPhieuXuatKhoRepository;
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

    @Autowired
    private ChiTietPhieuXuatKhoRepository chiTietPhieuXuatKhoRepository;

    @Transactional(readOnly = true)
    public ChiTietPhieuNhapKhoResponse getDetail(Integer id) {

        PhieuXuatKho phieu = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu xuất"));

        String soDonHang = null;
        String tenKhoChuyenDen = null;

        if ("ban_hang".equals(phieu.getLoaiXuat())
                && phieu.getDonBanHang() != null) {
            soDonHang = phieu.getDonBanHang().getSoDonHang();
        }

        if ("chuyen_kho".equals(phieu.getLoaiXuat())
                && phieu.getKhoChuyenDen() != null) {
            tenKhoChuyenDen = phieu.getKhoChuyenDen().getTenKho();
        }

        PhieuXuatKhoDto phieuDto = PhieuXuatKhoDto.builder()
                .id(phieu.getId())
                .soPhieuXuat(phieu.getSoPhieuXuat())
                .loaiXuat(phieu.getLoaiXuat())
                .soDonHang(soDonHang)
                .tenKho(phieu.getKho().getTenKho())
                .tenKhoChuyenDen(tenKhoChuyenDen)
                .ngayXuat(phieu.getNgayXuat())
                .trangThai(phieu.getTrangThai())
                .ghiChu(phieu.getGhiChu())
                .build();
        List<ChiTietPhieuXuatKho> chiTietList =
                chiTietPhieuXuatKhoRepository
                        .findByPhieuXuatKhoIdAndLoHangIsNull(phieu.getId());

        List<ChiTietPhieuXuatKhoDto> chiTietDtos =
                chiTietList.stream()
                        .map(ct -> ChiTietPhieuXuatKhoDto.builder()
                                .id(ct.getId())
                                .bienTheSanPhamId(ct.getBienTheSanPham().getId())
                                .sku(ct.getBienTheSanPham().getMaSku())
                                .tenBienThe((ct.getBienTheSanPham().getSanPham().getTenSanPham() +" /"
                                        + ct.getBienTheSanPham().getMauSac().getTenMau() +" /"
                                        + ct.getBienTheSanPham().getSize().getTenSize() +" /"
                                        + ct.getBienTheSanPham().getChatLieu().getTenChatLieu()))
                                .soLuongCanXuat(ct.getSoLuongXuat())
                                .soLuongDaPick(BigDecimal.ZERO) // chưa pick lô
                                .duSoLuong(false)
                                .build()
                        )
                        .toList();

        return ChiTietPhieuNhapKhoResponse.builder()
                .phieu(phieuDto)
                .chiTiet(chiTietDtos)
                .build();
    }

    @Transactional
    public void cancel(Integer id) {

        PhieuXuatKho phieu = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu xuất"));

        if (phieu.getTrangThai() == 1) {
            throw new RuntimeException("Phiếu xuất đã hoàn thành, không thể huỷ");
        }

        if (phieu.getTrangThai() == 2) {
            throw new RuntimeException("Phiếu xuất đã bị huỷ trước đó");
        }
        phieu.setTrangThai(2);
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
