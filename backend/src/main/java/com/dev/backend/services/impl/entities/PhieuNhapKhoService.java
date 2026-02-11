package com.dev.backend.services.impl.entities;

import com.dev.backend.constant.enums.TrangThaiPhieuNhap;
import com.dev.backend.dto.request.ChiTietPhieuNhapKhoCreating;
import com.dev.backend.dto.request.KhaiBaoLoRequest;
import com.dev.backend.dto.request.PhieuNhapKhoCreating;
import com.dev.backend.dto.response.customize.LoHangKhaiBaoDto;
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
import java.util.Optional;

@Service
public class PhieuNhapKhoService extends BaseServiceImpl<PhieuNhapKho, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Autowired
    private DonMuaHangRepository donMuaHangRepository;

    @Autowired
    private ChiTietPhieuNhapKhoRepository chiTietPhieuNhapKhoRepository;

    @Autowired
    private LoHangRepository loHangRepository;

    @Autowired
    private TonKhoTheoLoRepository tonKhoTheoLoRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private LichSuGiaoDichKhoRepository lichSuGiaoDichKhoRepository;

    @Autowired
    private ChiTietDonMuaHangRepository chiTietDonMuaHangRepository;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public PhieuNhapKhoService(PhieuNhapKhoRepository repository) {
        super(repository);
    }

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
                        .ngayNhap(request.getNgayNhap() != null ? request.getNgayNhap() : Instant.now())
                        .ghiChu(request.getGhiChu())
                        .trangThai(TrangThaiPhieuNhap.DRAFT.getValue())
                        .tongTien(BigDecimal.ZERO)
                        .build();

                phieuNhapKho = repository.save(phieuNhapKho);

                for (ChiTietPhieuNhapKhoCreating item : request.getChiTietPhieuNhapKhos()) {
                    ChiTietDonMuaHang ctPo = donMuaHang.getChiTietDonMuaHangs().stream()
                            .filter(poItem -> poItem.getBienTheSanPham().getId().equals(item.getBienTheSanPhamId()))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("Sản phẩm không thuộc PO"));

                    ChiTietPhieuNhapKho ct = ChiTietPhieuNhapKho.builder()
                            .phieuNhapKho(phieuNhapKho)
                            .bienTheSanPham(ctPo.getBienTheSanPham())
                            .soLuongNhap(item.getSoLuongDuKienNhap())
                            .donGia(ctPo.getDonGia())
                            .loHang(null)
                            .build();

                    if (item.getSoLuongDuKienNhap().compareTo(ctPo.getSoLuongDat()) > 0) {
                        throw new RuntimeException("Sản phẩm " + ctPo.getBienTheSanPham().getMaSku() + " nhập quá số lượng đặt");
                    }

                    chiTietPhieuNhapKhoRepository.save(ct);
                }
                return phieuNhapKho;
            } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                if (isDuplicateSoPhieu(ex) && retry < maxRetry) {
                    retry++;
                    continue;
                }
                throw ex;
            }
        }
    }

    @Transactional
    public void guiDuyet(Integer id) {
        PhieuNhapKho phieu = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

        if (phieu.getTrangThai() != TrangThaiPhieuNhap.DRAFT.getValue()) {
            throw new RuntimeException("Chỉ phiếu Nháp mới có thể gửi duyệt");
        }

        long chuaDuLo = chiTietPhieuNhapKhoRepository.countBienTheChuaDuLo(id);
        if (chuaDuLo > 0) {
            throw new RuntimeException("Vui lòng khai báo đủ lô cho sản phẩm trước khi gửi duyệt");
        }

        phieu.setTrangThai(TrangThaiPhieuNhap.PENDING.getValue());
        repository.save(phieu);
    }

    @Transactional
    public void approvePhieu(Integer id, Integer nguoiDuyetId) {
        PhieuNhapKho phieu = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

        if (phieu.getTrangThai() != TrangThaiPhieuNhap.PENDING.getValue()) {
            throw new RuntimeException("Phiếu không ở trạng thái chờ duyệt");
        }

        NguoiDung nguoiDuyet = nguoiDungRepository.findById(nguoiDuyetId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người duyệt"));

        phieu.setTrangThai(TrangThaiPhieuNhap.APPROVED.getValue());
        phieu.setNguoiDuyet(nguoiDuyet);
        repository.save(phieu);
    }

    @Transactional
    public void completePhieuNhap(Integer phieuNhapKhoId, Integer nguoiNhapId) {
        PhieuNhapKho phieu = repository.findById(phieuNhapKhoId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

        if (phieu.getTrangThai() != TrangThaiPhieuNhap.APPROVED.getValue()) {
            throw new RuntimeException("Chỉ phiếu đã duyệt mới có thể hoàn tất nhập kho");
        }

        NguoiDung nguoiNhap = nguoiDungRepository.findById(nguoiNhapId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người nhập"));

        List<ChiTietPhieuNhapKho> danhSachNhapTheoLo = chiTietPhieuNhapKhoRepository.findAllByPhieuNhapKhoIdAndCoLo(phieuNhapKhoId);
        Kho kho = phieu.getKho();
        BigDecimal tongTien = BigDecimal.ZERO;
        DonMuaHang donMuaHang = phieu.getDonMuaHang();

        for (ChiTietPhieuNhapKho ct : danhSachNhapTheoLo) {
            LoHang loHang = ct.getLoHang();
            BigDecimal soLuongNhap = ct.getSoLuongNhap();

            TonKhoTheoLo tonKho = tonKhoTheoLoRepository.findByKho_IdAndLoHang_Id(kho.getId(), loHang.getId())
                    .orElse(TonKhoTheoLo.builder()
                            .kho(kho)
                            .loHang(loHang)
                            .soLuongTon(BigDecimal.ZERO)
                            .soLuongDaDat(BigDecimal.ZERO)
                            .build());

            BigDecimal soLuongTruoc = tonKho.getSoLuongTon();
            BigDecimal soLuongSau = soLuongTruoc.add(soLuongNhap);

            tonKho.setSoLuongTon(soLuongSau);
            tonKho.setNgayNhapGanNhat(Instant.now());
            tonKho.setLanCapNhatCuoi(Instant.now());
            tonKhoTheoLoRepository.save(tonKho);

            ChiTietDonMuaHang ctPo = donMuaHang.getChiTietDonMuaHangs().stream()
                    .filter(item -> item.getBienTheSanPham().getId().equals(ct.getBienTheSanPham().getId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Sản phẩm " + ct.getBienTheSanPham().getMaSku() + " không có trong PO"));

            BigDecimal daNhanHienTai = ctPo.getSoLuongDaNhan() != null ? ctPo.getSoLuongDaNhan() : BigDecimal.ZERO;
            ctPo.setSoLuongDaNhan(daNhanHienTai.add(soLuongNhap));
            chiTietDonMuaHangRepository.save(ctPo);
            
            LichSuGiaoDichKho history = LichSuGiaoDichKho.builder()
                    .ngayGiaoDich(Instant.now())
                    .loaiGiaoDich("nhap_kho")
                    .loaiThamChieu("phieu_nhap_kho")
                    .idThamChieu(phieu.getId())
                    .bienTheSanPham(ct.getBienTheSanPham())
                    .loHang(loHang)
                    .kho(kho)
                    .soLuong(soLuongNhap)
                    .soLuongTruoc(soLuongTruoc)
                    .soLuongSau(soLuongSau)
                    .giaVon(ct.getDonGia())
                    .nguoiDung(nguoiNhap)
                    .ghiChu("Nhập kho từ phiếu: " + phieu.getSoPhieuNhap())
                    .build();
            lichSuGiaoDichKhoRepository.save(history);

            // Cộng tổng tiền cho phiếu
            tongTien = tongTien.add(soLuongNhap.multiply(ct.getDonGia()));
        }

        phieu.setTongTien(tongTien);
        phieu.setTrangThai(TrangThaiPhieuNhap.COMPLETED.getValue());
        phieu.setNguoiNhap(nguoiNhap);
        phieu.setNgayNhap(Instant.now());
        repository.save(phieu);
        donMuaHangRepository.save(donMuaHang);
    }

    @Transactional
    public void huyPhieuNhap(Integer id) {
        PhieuNhapKho phieu = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

        if (phieu.getTrangThai() == TrangThaiPhieuNhap.COMPLETED.getValue()) {
            throw new RuntimeException("Phiếu đã hoàn thành, không thể huỷ");
        }

        phieu.setTrangThai(TrangThaiPhieuNhap.CANCELLED.getValue());
        repository.save(phieu);
    }

    @Transactional
    public void khaiBaoLo(Integer phieuNhapKhoId, KhaiBaoLoRequest request) {
        PhieuNhapKho phieu = repository.findById(phieuNhapKhoId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

        if (phieu.getTrangThai() != TrangThaiPhieuNhap.DRAFT.getValue()) {
            throw new RuntimeException("Chỉ được khai báo lô ở trạng thái Nháp");
        }

        ChiTietPhieuNhapKho dongDraft = chiTietPhieuNhapKhoRepository
                .findFirstByPhieuNhapKho_IdAndBienTheSanPham_IdAndLoHangIsNull(phieuNhapKhoId, request.getBienTheSanPhamId())
                .orElseThrow(() -> new RuntimeException("Sản phẩm không thuộc phiếu này"));

        BigDecimal soLuongCanNhap = dongDraft.getSoLuongNhap();
        BigDecimal soLuongDaKhaiBao = chiTietPhieuNhapKhoRepository.sumSoLuongDaKhaiBao(phieuNhapKhoId, request.getBienTheSanPhamId());

        Optional<ChiTietPhieuNhapKho> existingCtOpt = chiTietPhieuNhapKhoRepository
                .findByPhieuNhapKho_IdAndBienTheSanPham_IdAndLoHang_MaLo(phieuNhapKhoId, request.getBienTheSanPhamId(), request.getMaLo());

        BigDecimal soLuongCu = existingCtOpt.map(ChiTietPhieuNhapKho::getSoLuongNhap).orElse(BigDecimal.ZERO);
        BigDecimal tongSauKhaiBao = soLuongDaKhaiBao.subtract(soLuongCu).add(request.getSoLuongNhap());

        if (tongSauKhaiBao.compareTo(soLuongCanNhap) > 0) {
            throw new RuntimeException("Số lượng khai báo vượt quá số lượng cần nhập");
        }

        if (existingCtOpt.isPresent()) {
            ChiTietPhieuNhapKho ct = existingCtOpt.get();
            ct.setSoLuongNhap(request.getSoLuongNhap());
            ct.setGhiChu(request.getGhiChu());
            LoHang lo = ct.getLoHang();
            lo.setNgaySanXuat(request.getNgaySanXuat());
            lo.setGhiChu(request.getGhiChu());
            chiTietPhieuNhapKhoRepository.save(ct);
        } else {
            LoHang loHang = loHangRepository.save(LoHang.builder()
                    .bienTheSanPham(dongDraft.getBienTheSanPham())
                    .maLo(request.getMaLo())
                    .ngaySanXuat(request.getNgaySanXuat())
                    .giaVon(dongDraft.getDonGia())
                    .nhaCungCap(phieu.getNhaCungCap())
                    .ghiChu(request.getGhiChu())
                    .build());

            chiTietPhieuNhapKhoRepository.save(ChiTietPhieuNhapKho.builder()
                    .phieuNhapKho(phieu)
                    .bienTheSanPham(dongDraft.getBienTheSanPham())
                    .loHang(loHang)
                    .soLuongNhap(request.getSoLuongNhap())
                    .donGia(dongDraft.getDonGia())
                    .ghiChu(request.getGhiChu())
                    .build());
        }
    }

    @Transactional(readOnly = true)
    public List<LoHangKhaiBaoDto> getDanhSachLoDaKhaiBao(Integer phieuNhapKhoId, Integer bienTheSanPhamId) {
        return chiTietPhieuNhapKhoRepository.findDeclaredLots(phieuNhapKhoId, bienTheSanPhamId).stream()
                .map(ct -> LoHangKhaiBaoDto.builder()
                        .chiTietPhieuNhapKhoId(ct.getId())
                        .loHangId(ct.getLoHang().getId())
                        .maLo(ct.getLoHang().getMaLo())
                        .ngaySanXuat(ct.getLoHang().getNgaySanXuat())
                        .soLuongNhap(ct.getSoLuongNhap())
                        .ghiChu(ct.getGhiChu())
                        .build())
                .toList();
    }

    @Transactional
    public void xoaLo(Integer phieuNhapKhoId, Integer chiTietId) {
        PhieuNhapKho phieu = repository.findById(phieuNhapKhoId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu"));
        if (phieu.getTrangThai() != TrangThaiPhieuNhap.DRAFT.getValue()) {
            throw new RuntimeException("Chỉ được xóa lô ở trạng thái Nháp");
        }
        ChiTietPhieuNhapKho ct = chiTietPhieuNhapKhoRepository.findByIdAndPhieuNhapKho_Id(chiTietId, phieuNhapKhoId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lô"));
        LoHang lo = ct.getLoHang();
        chiTietPhieuNhapKhoRepository.delete(ct);
        loHangRepository.delete(lo);
    }

    @Transactional(readOnly = true)
    public ChiTietPhieuNhapKhoDto getDetail(Integer id) {
        PhieuNhapKho phieu = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu"));

        List<PhieuNhapKhoItemDto> items = phieu.getChiTietPhieuNhapKhos().stream()
                .filter(ct -> ct.getLoHang() == null)
                .map(ct -> {
                    BigDecimal soLuongDaKhaiBao = chiTietPhieuNhapKhoRepository.sumSoLuongDaKhaiBao(id, ct.getBienTheSanPham().getId());
                    return PhieuNhapKhoItemDto.builder()
                            .bienTheSanPhamId(ct.getBienTheSanPham().getId())
                            .sku(ct.getBienTheSanPham().getMaSku())
                            .tenBienThe(ct.getBienTheSanPham().getSanPham().getTenSanPham())
                            .soLuongCanNhap(ct.getSoLuongNhap())
                            .soLuongDaKhaiBao(soLuongDaKhaiBao)
                            .daDuLo(soLuongDaKhaiBao.compareTo(ct.getSoLuongNhap()) >= 0)
                            .build();
                }).toList();

        return ChiTietPhieuNhapKhoDto.builder()
                .id(phieu.getId()).soPhieuNhap(phieu.getSoPhieuNhap()).trangThai(phieu.getTrangThai())
                .ngayNhap(phieu.getNgayNhap()).donMuaHangId(phieu.getDonMuaHang().getId())
                .soDonMua(phieu.getDonMuaHang().getSoDonMua()).nhaCungCapId(phieu.getNhaCungCap().getId())
                .tenNhaCungCap(phieu.getNhaCungCap().getTenNhaCungCap()).khoId(phieu.getKho().getId())
                .tenKho(phieu.getKho().getTenKho())
                .items(items).build();
    }

    private String generateSoPhieu() {
        String dateStr = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
        String prefix = "PN" + dateStr;
        long countToday = ((PhieuNhapKhoRepository) repository).countBySoPhieuPrefix(prefix);
        return prefix + (countToday + 1);
    }

    private boolean isDuplicateSoPhieu(Exception ex) {
        Throwable cause = ex;
        while (cause != null) {
            if (cause.getMessage() != null && cause.getMessage().contains("uk_phieu_nhap_kho_so_phieu")) return true;
            cause = cause.getCause();
        }
        return false;
    }
}