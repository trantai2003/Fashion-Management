package com.dev.backend.services.impl.entities;

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
                        .filter(ct -> ct.getLoHang() == null)
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
                                    .soLuongDaKhaiBao(soLuongDaKhaiBaoLo)
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
        phieuNhapKho.setTrangThai(2);
        repository.save(phieuNhapKho);
        repository.flush();
    }

    @Transactional
    public void khaiBaoLo(Integer phieuNhapKhoId, KhaiBaoLoRequest request) {

        PhieuNhapKho phieu = repository.findById(phieuNhapKhoId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

        if (phieu.getTrangThai() != 0) {
            throw new RuntimeException("Chỉ được khai báo lô khi phiếu ở trạng thái nháp");
        }

        // dòng draft (lo_hang = null)
        ChiTietPhieuNhapKho dongDraft =
                chiTietPhieuNhapKhoRepository
                        .findFirstByPhieuNhapKho_IdAndBienTheSanPham_IdAndLoHangIsNull(
                                phieuNhapKhoId,
                                request.getBienTheSanPhamId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException("Biến thể không thuộc phiếu nhập")
                        );

        BigDecimal soLuongCanNhap = dongDraft.getSoLuongNhap();

        // tổng đã khai báo (KHÔNG tính draft)
        BigDecimal soLuongDaKhaiBao =
                chiTietPhieuNhapKhoRepository.sumSoLuongDaKhaiBao(
                        phieuNhapKhoId,
                        request.getBienTheSanPhamId()
                );

        // === CHECK: nếu là update thì phải trừ số lượng cũ ===
        Optional<ChiTietPhieuNhapKho> existingCtOpt =
                chiTietPhieuNhapKhoRepository
                        .findByPhieuNhapKho_IdAndBienTheSanPham_IdAndLoHang_MaLo(
                                phieuNhapKhoId,
                                request.getBienTheSanPhamId(),
                                request.getMaLo()
                        );

        BigDecimal soLuongCu = BigDecimal.ZERO;
        if (existingCtOpt.isPresent()) {
            soLuongCu = existingCtOpt.get().getSoLuongNhap();
        }

        BigDecimal tongSauKhaiBao =
                soLuongDaKhaiBao
                        .subtract(soLuongCu)
                        .add(request.getSoLuongNhap());

        if (tongSauKhaiBao.compareTo(soLuongCanNhap) > 0) {
            throw new RuntimeException("Số lượng khai báo vượt quá số lượng cần nhập");
        }

        // === CREATE / UPDATE LO ===
        ChiTietPhieuNhapKho ct;

        if (existingCtOpt.isPresent()) {
            // ===== UPDATE =====
            ct = existingCtOpt.get();

            ct.setSoLuongNhap(request.getSoLuongNhap());
            ct.setGhiChu(request.getGhiChu());

            LoHang lo = ct.getLoHang();
            lo.setNgaySanXuat(request.getNgaySanXuat());
            lo.setGhiChu(request.getGhiChu());

        } else {
            // ===== CREATE =====
            LoHang loHang = loHangRepository.save(
                    LoHang.builder()
                            .bienTheSanPham(dongDraft.getBienTheSanPham())
                            .maLo(request.getMaLo())
                            .ngaySanXuat(request.getNgaySanXuat())
                            .giaVon(dongDraft.getDonGia()) // lấy từ PO
                            .nhaCungCap(phieu.getNhaCungCap())
                            .ghiChu(request.getGhiChu())
                            .build()
            );

            ct = ChiTietPhieuNhapKho.builder()
                    .phieuNhapKho(phieu)
                    .bienTheSanPham(dongDraft.getBienTheSanPham())
                    .loHang(loHang)
                    .soLuongNhap(request.getSoLuongNhap())
                    .donGia(dongDraft.getDonGia())
                    .ghiChu(request.getGhiChu())
                    .build();
        }

        chiTietPhieuNhapKhoRepository.save(ct);
    }


    @Transactional(readOnly = true)
    public List<LoHangKhaiBaoDto> getDanhSachLoDaKhaiBao(
            Integer phieuNhapKhoId,
            Integer bienTheSanPhamId
    ) {
        List<ChiTietPhieuNhapKho> list =
                chiTietPhieuNhapKhoRepository.findDeclaredLots(
                        phieuNhapKhoId,
                        bienTheSanPhamId
                );

        return list.stream()
                .map(ct -> LoHangKhaiBaoDto.builder()
                        .chiTietPhieuNhapKhoId(ct.getId())
                        .loHangId(ct.getLoHang().getId())
                        .maLo(ct.getLoHang().getMaLo())
                        .ngaySanXuat(ct.getLoHang().getNgaySanXuat())
                        .soLuongNhap(ct.getSoLuongNhap())
                        .ghiChu(ct.getGhiChu())
                        .build()
                )
                .toList();
    }

    @Transactional
    public void xoaLo(Integer phieuNhapKhoId, Integer chiTietPhieuNhapKhoId) {
        PhieuNhapKho phieu = repository.findById(phieuNhapKhoId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));
        if (phieu.getTrangThai() != 0) {
            throw new RuntimeException("Chỉ được xoá lô khi phiếu ở trạng thái nháp");
        }
        ChiTietPhieuNhapKho ct =
                chiTietPhieuNhapKhoRepository
                        .findByIdAndPhieuNhapKho_Id(chiTietPhieuNhapKhoId, phieuNhapKhoId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy lô cần xoá"));
        if (ct.getLoHang() == null) {
            throw new RuntimeException("Dòng này không phải lô đã khai báo");
        }
        LoHang loHang = ct.getLoHang();
        //xoá chi tiết phiếu nhập trước
        chiTietPhieuNhapKhoRepository.delete(ct);
        // xoá lô hàng
        loHangRepository.delete(loHang);
    }

    @Transactional
    public void completePhieuNhap(Integer phieuNhapKhoId) {

        PhieuNhapKho phieu = repository.findById(phieuNhapKhoId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));
        //Validate trạng thái
        if (phieu.getTrangThai() == 1) {
            throw new RuntimeException("Phiếu nhập đã hoàn thành");
        }
        if (phieu.getTrangThai() == 2) {
            throw new RuntimeException("Phiếu nhập đã bị huỷ");
        }
        //Kiểm tra đã khai báo đủ lô chưa
        long chuaDuLo =
                chiTietPhieuNhapKhoRepository
                        .countBienTheChuaDuLo(phieuNhapKhoId);

        if (chuaDuLo > 0) {
            throw new RuntimeException("Chưa khai báo đủ lô cho tất cả sản phẩm");
        }
        //Lấy tất cả dòng chi tiết có lô
        List<ChiTietPhieuNhapKho> danhSachNhapTheoLo =
                chiTietPhieuNhapKhoRepository
                        .findAllByPhieuNhapKhoIdAndCoLo(phieuNhapKhoId);
        Kho kho = phieu.getKho();
        //CỘNG TỒN KHO THEO LÔ
        for (ChiTietPhieuNhapKho ct : danhSachNhapTheoLo) {

            LoHang loHang = ct.getLoHang();
            BigDecimal soLuongNhap = ct.getSoLuongNhap();

            TonKhoTheoLo tonKho =
                    tonKhoTheoLoRepository
                            .findByKho_IdAndLoHang_Id(
                                    kho.getId(),
                                    loHang.getId()
                            )
                            .orElse(
                                    TonKhoTheoLo.builder()
                                            .kho(kho)
                                            .loHang(loHang)
                                            .soLuongTon(BigDecimal.ZERO)
                                            .soLuongDaDat(BigDecimal.ZERO)
                                            .build()
                            );
            // cộng tồn
            tonKho.setSoLuongTon(
                    tonKho.getSoLuongTon().add(soLuongNhap)
            );
            tonKho.setNgayNhapGanNhat(Instant.now());
            tonKho.setLanCapNhatCuoi(Instant.now());
            tonKhoTheoLoRepository.save(tonKho);
        }

        // ===== TÍNH TỔNG TIỀN =====
        BigDecimal tongTien = BigDecimal.ZERO;
        for (ChiTietPhieuNhapKho ct : danhSachNhapTheoLo) {
            BigDecimal thanhTienDong =
                    ct.getSoLuongNhap().multiply(ct.getDonGia());

            tongTien = tongTien.add(thanhTienDong);
        }
        phieu.setTongTien(tongTien);

        //Chuyển trạng thái phiếu → HOÀN THÀNH
        phieu.setTrangThai(1);
        repository.save(phieu);
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
