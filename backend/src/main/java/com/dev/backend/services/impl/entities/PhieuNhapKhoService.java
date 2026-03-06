package com.dev.backend.services.impl.entities;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.constant.enums.TrangThaiPhieuNhap;
import com.dev.backend.dto.request.ChiTietPhieuNhapKhoCreating;
import com.dev.backend.dto.request.KhaiBaoLoRequest;
import com.dev.backend.dto.request.PhieuNhapKhoCreating;
import com.dev.backend.dto.response.customize.LoHangKhaiBaoDto;
import com.dev.backend.dto.response.entities.ChiTietPhieuNhapKhoDto;
import com.dev.backend.dto.response.entities.PhieuNhapKhoItemDto;
import com.dev.backend.entities.*;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.repository.*;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

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

    @Autowired
    private PhieuXuatKhoRepository phieuXuatKhoRepository;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public PhieuNhapKhoService(PhieuNhapKhoRepository repository) {
        super(repository);
    }

    @Transactional
    public PhieuNhapKho createDraft(PhieuNhapKhoCreating request) {
        if (request.getChiTietPhieuNhapKhos() == null
                || request.getChiTietPhieuNhapKhos().isEmpty()) {
            throw new RuntimeException("Danh sách sản phẩm nhập không được rỗng");
        }

        DonMuaHang donMuaHang = donMuaHangRepository.findById(request.getDonMuaHangId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy PO"));
        Integer currentKhoId = SecurityContextHolder.getKhoId();

        if (currentKhoId == null) {
            throw new RuntimeException("Không xác định được kho hiện tại");
        }

        if (donMuaHang.getKhoNhap() == null
                || !donMuaHang.getKhoNhap().getId().equals(currentKhoId)) {

            throw new RuntimeException(
                    "PO không thuộc kho hiện tại. " +
                            "Kho PO: " +
                            (donMuaHang.getKhoNhap() != null
                                    ? donMuaHang.getKhoNhap().getId()
                                    : "null") +
                            " | Kho hiện tại: " + currentKhoId
            );
        }

        int retry = 0;
        int maxRetry = 5;
        while (true) {
            try {
                PhieuNhapKho phieuNhapKho = PhieuNhapKho.builder()
                        .soPhieuNhap(generateSoPhieu())
                        .donMuaHang(donMuaHang)
                        .nhaCungCap(donMuaHang.getNhaCungCap())
                        .ngayNhap(null)
                        .kho(donMuaHang.getKhoNhap())
                        .ghiChu(request.getGhiChu())
                        .trangThai(TrangThaiPhieuNhap.DRAFT.getValue())
                        .tongTien(BigDecimal.ZERO)
                        .build();

                phieuNhapKho = repository.save(phieuNhapKho);

                BigDecimal tongTien = BigDecimal.ZERO;
                for (ChiTietPhieuNhapKhoCreating item : request.getChiTietPhieuNhapKhos()) {
                    ChiTietDonMuaHang ctPo = donMuaHang.getChiTietDonMuaHangs().stream()
                            .filter(poItem ->
                                    poItem.getBienTheSanPham().getId()
                                            .equals(item.getBienTheSanPhamId())
                            )
                            .findFirst()
                            .orElseThrow(() ->
                                    new RuntimeException("Sản phẩm không thuộc PO")
                            );

                    BigDecimal soLuongNhap = item.getSoLuongDuKienNhap();
                    if (soLuongNhap == null
                            || soLuongNhap.compareTo(BigDecimal.ZERO) <= 0) {
                        throw new RuntimeException(
                                "Số lượng nhập phải lớn hơn 0"
                        );
                    }
                    BigDecimal soLuongDat = ctPo.getSoLuongDat();
                    BigDecimal soLuongDaNhan =
                            ctPo.getSoLuongDaNhan() != null
                                    ? ctPo.getSoLuongDaNhan()
                                    : BigDecimal.ZERO;
                    BigDecimal soLuongConLai =
                            soLuongDat.subtract(soLuongDaNhan);
                    if (soLuongNhap.compareTo(soLuongConLai) > 0) {
                        throw new RuntimeException(
                                "Sản phẩm "
                                        + ctPo.getBienTheSanPham().getMaSku()
                                        + " nhập vượt quá số lượng còn lại ("
                                        + soLuongConLai + ")"
                        );
                    }
                    ChiTietPhieuNhapKho ct = ChiTietPhieuNhapKho.builder()
                            .phieuNhapKho(phieuNhapKho)
                            .bienTheSanPham(ctPo.getBienTheSanPham())
                            .soLuongNhap(soLuongNhap)
                            .donGia(ctPo.getDonGia())
                            .loHang(null)
                            .build();
                    chiTietPhieuNhapKhoRepository.save(ct);
                    tongTien = tongTien.add(
                            ctPo.getDonGia().multiply(soLuongNhap)
                    );
                }
                phieuNhapKho.setTongTien(tongTien);
                repository.save(phieuNhapKho);
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
                .orElseThrow(() -> new CommonException("Không tìm thấy phiếu nhập id: " + id));

        // LOGIC MỚI: Group theo biến thể để tính tổng số lượng
        Map<Integer, PhieuNhapKhoItemDto> itemsMap = new LinkedHashMap<>();

        for (ChiTietPhieuNhapKho ct : phieu.getChiTietPhieuNhapKhos()) {
            Integer btId = ct.getBienTheSanPham().getId();
            PhieuNhapKhoItemDto dto = itemsMap.computeIfAbsent(btId, k -> PhieuNhapKhoItemDto.builder()
                    .bienTheSanPhamId(btId)
                    .sku(ct.getBienTheSanPham().getMaSku())
                    .tenBienThe(ct.getBienTheSanPham().getSanPham().getTenSanPham())
                    .soLuongCanNhap(BigDecimal.ZERO)
                    .soLuongDaKhaiBao(BigDecimal.ZERO)
                    .build());

            if (ct.getLoHang() == null) {
                // Luồng PO: Dòng chứa số lượng dự kiến nhập từ nhà cung cấp
                dto.setSoLuongCanNhap(ct.getSoLuongNhap());
            } else {
                // Các dòng đã khai báo lô cụ thể (Hoặc dòng từ Chuyển kho)
                BigDecimal slMoi = ct.getSoLuongNhap() != null ? ct.getSoLuongNhap() : BigDecimal.ZERO;
                dto.setSoLuongDaKhaiBao(dto.getSoLuongDaKhaiBao().add(slMoi));

                // Nếu là chuyển kho nội bộ (không có dòng null), số lượng cần nhập chính bằng số lượng đã chuyển đi
                if (phieu.getDonMuaHang() == null) {
                    dto.setSoLuongCanNhap(dto.getSoLuongDaKhaiBao());
                }
            }
        }
        itemsMap.values().forEach(item -> {
            boolean daDu = item.getSoLuongDaKhaiBao().compareTo(item.getSoLuongCanNhap()) >= 0
                    && item.getSoLuongCanNhap().compareTo(BigDecimal.ZERO) > 0;
            item.setDaDuLo(daDu);
        });

        List<PhieuNhapKhoItemDto> items = new ArrayList<>(itemsMap.values());
        ChiTietPhieuNhapKhoDto.ChiTietPhieuNhapKhoDtoBuilder builder = ChiTietPhieuNhapKhoDto.builder()
                .id(phieu.getId())
                .soPhieuNhap(phieu.getSoPhieuNhap())
                .trangThai(phieu.getTrangThai())
                .ngayNhap(phieu.getNgayNhap())
                .khoId(phieu.getKho().getId())
                .tenKho(phieu.getKho().getTenKho())
                .items(items)
                .tenNguoiNhap(phieu.getNguoiNhap() != null ? phieu.getNguoiNhap().getHoTen() : null)
                .tenNguoiDuyet(phieu.getNguoiDuyet() != null ? phieu.getNguoiDuyet().getHoTen() : null);

        if (phieu.getDonMuaHang() == null) {
            builder.loaiNhap("Chuyển kho nội bộ");
            List<String> tenKhoNguonList = lichSuGiaoDichKhoRepository.findTenKhoNguonByPhieuNhap(id);
            if (!tenKhoNguonList.isEmpty()) builder.tenKhoChuyenTu(tenKhoNguonList.get(0));
        } else {
            builder.loaiNhap("Nhập từ đơn mua hàng");
            builder.donMuaHangId(phieu.getDonMuaHang().getId()).soDonMua(phieu.getDonMuaHang().getSoDonMua());
            if (phieu.getNhaCungCap() != null) {
                builder.nhaCungCapId(phieu.getNhaCungCap().getId()).tenNhaCungCap(phieu.getNhaCungCap().getTenNhaCungCap());
            }
        }
        return builder.build();
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
    @Transactional
    public void completeTransferReceipt(Integer phieuNhapId, Integer nguoiNhapId) {
        //Tìm phiếu nhập
        PhieuNhapKho phieu = repository.findById(phieuNhapId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

        if (phieu.getTrangThai() != 2) {
            throw new RuntimeException("Chỉ phiếu đang chờ nhận hàng mới có thể hoàn tất");
        }

        //FIX LOGIC TRÍCH XUẤT MÃ PHIẾU
        String ghiChu = phieu.getGhiChu();
        String soPhieuXuat = "";

        if (ghiChu.contains("Nhập hoàn trả tự động do hủy phiếu chuyển: ")) {
            // Nếu là luồng Hủy - Nhập trả kho A
            soPhieuXuat = ghiChu.replace("Nhập hoàn trả tự động do hủy phiếu chuyển: ", "").trim();
        } else if (ghiChu.contains("Nhập kho tự động từ phiếu chuyển ")) {
            // Nếu là luồng Chuyển kho bình thường - Nhập kho B
            soPhieuXuat = ghiChu.replace("Nhập kho tự động từ phiếu chuyển ", "").trim();
        } else {
            throw new RuntimeException("Ghi chú không đúng định dạng để tìm phiếu xuất gốc");
        }

        //Tìm phiếu xuất gốc dựa trên mã đã trích xuất
        PhieuXuatKho phieuXuatGoc = phieuXuatKhoRepository.findBySoPhieuXuat(soPhieuXuat)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu xuất gốc tham chiếu"));

        NguoiDung nguoiNhap = nguoiDungRepository.findById(nguoiNhapId).orElseThrow();
        Kho khoDich = phieu.getKho(); // Kho A nếu là trả hàng, Kho B nếu là nhập mới

        //Lấy kho trung chuyển
        Kho khoTransit = entityManager.createQuery("SELECT k FROM Kho k WHERE k.maKho = 'KHO_TRANSIT'", Kho.class)
                .getSingleResult();

        //Xử lý dịch chuyển tồn kho: KHO_TRANSIT -> KHO_DICH
        List<ChiTietPhieuNhapKho> details = chiTietPhieuNhapKhoRepository.findAllByPhieuNhapKhoIdAndCoLo(phieuNhapId);

        for (ChiTietPhieuNhapKho ct : details) {
            BigDecimal qty = ct.getSoLuongNhap();
            LoHang lo = ct.getLoHang();

            // TRỪ TỒN TẠI KHO TRUNG CHUYỂN
            TonKhoTheoLo tonTransit = tonKhoTheoLoRepository
                    .findByKho_IdAndLoHang_Id(khoTransit.getId(), lo.getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hàng trong kho trung chuyển cho lô: " + lo.getMaLo()));

            BigDecimal tonTruocTransit = tonTransit.getSoLuongTon();
            tonTransit.setSoLuongTon(tonTruocTransit.subtract(qty));
            tonKhoTheoLoRepository.save(tonTransit);

            // CỘNG TỒN VÀO KHO ĐÍCH (KHO A hoặc B)
            TonKhoTheoLo tonDich = tonKhoTheoLoRepository
                    .findByKho_IdAndLoHang_Id(khoDich.getId(), lo.getId())
                    .orElse(TonKhoTheoLo.builder()
                            .kho(khoDich).loHang(lo)
                            .soLuongTon(BigDecimal.ZERO).soLuongDaDat(BigDecimal.ZERO)
                            .build());

            BigDecimal tonTruocDich = tonDich.getSoLuongTon();
            tonDich.setSoLuongTon(tonTruocDich.add(qty));
            tonDich.setNgayNhapGanNhat(Instant.now());
            tonKhoTheoLoRepository.save(tonDich);

            // GHI LỊCH SỬ GIAO DỊCH
            String loaiGiaoDichNote = ghiChu.contains("hoàn trả") ? "Hoàn trả nhập kho: " : "Nhập chuyển kho từ: ";
            LichSuGiaoDichKho history = LichSuGiaoDichKho.builder()
                    .ngayGiaoDich(Instant.now())
                    .loaiGiaoDich("nhap_kho")
                    .loaiThamChieu("phieu_nhap_kho")
                    .idThamChieu(phieu.getId())
                    .bienTheSanPham(ct.getBienTheSanPham())
                    .loHang(lo)
                    .kho(khoDich)
                    .soLuong(qty)
                    .soLuongTruoc(tonTruocDich)
                    .soLuongSau(tonDich.getSoLuongTon())
                    .giaVon(ct.getDonGia())
                    .nguoiDung(nguoiNhap)
                    .ghiChu(loaiGiaoDichNote + phieuXuatGoc.getSoPhieuXuat())
                    .build();
            lichSuGiaoDichKhoRepository.save(history);
        }

        //Cập nhật trạng thái kết thúc
        phieu.setTrangThai(3); // Hoàn thành Nhập kho
        phieu.setNgayNhap(Instant.now());
        phieu.setNguoiNhap(nguoiNhap);
        repository.save(phieu);

        // CHỈ cập nhật trạng thái phiếu xuất sang 5 (Hoàn tất) nếu là luồng nhập thành công cho B
        // Nếu là luồng hoàn trả (ghiChu chứa "hoàn trả"), giữ nguyên trạng thái 4 (Đã hủy) cho PXG
        if (!ghiChu.contains("hoàn trả")) {
            phieuXuatGoc.setTrangThai(5); // Hoàn tất quy trình chuyển kho
            phieuXuatKhoRepository.save(phieuXuatGoc);
        }
    }
}