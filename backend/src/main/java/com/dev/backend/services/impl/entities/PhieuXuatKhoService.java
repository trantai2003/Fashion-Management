package com.dev.backend.services.impl.entities;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.dto.request.ChiTietPhieuXuatKhoCreating;
import com.dev.backend.dto.request.PhieuXuatKhoCreating;
import com.dev.backend.dto.request.PickLoHangRequest;
import com.dev.backend.dto.response.customize.PhieuXuatKhoViewDto;
import com.dev.backend.dto.response.customize.PickedLotDto;
import com.dev.backend.dto.response.entities.*;
import com.dev.backend.entities.*;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.repository.*;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
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

    @Autowired
    private ChiTietPhieuXuatKhoRepository chiTietPhieuXuatKhoRepository;

    @Autowired
    private LoHangRepository loHangRepository;

    @Autowired
    private TonKhoTheoLoRepository tonKhoTheoLoRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private LichSuGiaoDichKhoRepository lichSuGiaoDichKhoRepository;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public PhieuXuatKhoService(PhieuXuatKhoRepository repository) {
        super(repository);
    }

    @Transactional
    public PhieuXuatKho createFromSO(PhieuXuatKhoCreating request) {
        if (request.getChiTietXuat() == null || request.getChiTietXuat().isEmpty()) {
            throw new RuntimeException("Phiếu xuất phải có ít nhất 1 sản phẩm");
        }
        DonBanHang donBanHang = entityManager.find(DonBanHang.class, request.getDonBanHangId());
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
                        .ngayXuat(request.getNgayXuat() != null ? request.getNgayXuat() : Instant.now())
                        .ghiChu(request.getGhiChu())
                        .trangThai(0) // 0 - Mới tạo (Draft)
                        .build();
                phieu = repository.save(phieu);

                List<ChiTietDonBanHang> chiTietSOList = chiTietDonBanHangRepository.findByDonBanHangId(donBanHang.getId());

                for (ChiTietPhieuXuatKhoCreating reqCt : request.getChiTietXuat()) {
                    ChiTietDonBanHang ctSO = chiTietSOList.stream()
                            .filter(ct -> ct.getBienTheSanPham().getId().equals(reqCt.getBienTheSanPhamId()))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("SP không thuộc đơn bán"));

                    BigDecimal conLai = ctSO.getSoLuongDat().subtract(ctSO.getSoLuongDaGiao() != null ? ctSO.getSoLuongDaGiao() : BigDecimal.ZERO);
                    if (reqCt.getSoLuongXuat().compareTo(conLai) > 0) {
                        throw new RuntimeException("Số lượng xuất vượt quá số lượng còn lại trong SO");
                    }
                    if (reqCt.getSoLuongXuat().compareTo(BigDecimal.ZERO) <= 0) {
                        throw new RuntimeException("Số lượng xuất phải > 0");
                    }

                    ChiTietPhieuXuatKho ctXuat = ChiTietPhieuXuatKho.builder()
                            .phieuXuatKho(phieu)
                            .bienTheSanPham(ctSO.getBienTheSanPham())
                            .soLuongXuat(reqCt.getSoLuongXuat())
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

    @Transactional
    public void submit(Integer id) {
        PhieuXuatKho phieu = repository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu"));
        if (phieu.getTrangThai() != 0) throw new RuntimeException("Chỉ được gửi duyệt phiếu ở trạng thái Mới tạo");

        // Kiểm tra xem đã pick đủ hàng cho tất cả các dòng chưa
        validatePickedQuantity(id);

        phieu.setTrangThai(1); // Chờ duyệt
        repository.save(phieu);
    }

    @Transactional
    public void approve(Integer id, Integer nguoiDuyetId) {
        PhieuXuatKho phieu = repository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu"));
        if (phieu.getTrangThai() != 1) throw new RuntimeException("Chỉ được duyệt phiếu ở trạng thái Chờ duyệt");
        NguoiDung nguoiDuyet = nguoiDungRepository.findById(nguoiDuyetId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người duyệt"));
        //Lấy toàn bộ danh sách các dòng đã pick lô của phiếu này
        List<ChiTietPhieuXuatKho> detailedPicks = chiTietPhieuXuatKhoRepository
                .findAll()
                .stream()
                .filter(ct -> ct.getPhieuXuatKho().getId().equals(id) && ct.getLoHang() != null)
                .toList();

        if (detailedPicks.isEmpty()) {
            throw new RuntimeException("Phiếu chưa được pick lô hàng, không thể duyệt");
        }

        //Kiểm tra tồn khả dụng của từng lô TRƯỚC khi thực hiện thay đổi
        for (ChiTietPhieuXuatKho pick : detailedPicks) {
            TonKhoTheoLo tonKho = tonKhoTheoLoRepository
                    .findByKho_IdAndLoHang_Id(phieu.getKho().getId(), pick.getLoHang().getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu tồn kho cho lô: " + pick.getLoHang().getMaLo()));

            //Tồn khả dụng hiện tại có đủ để đáp ứng số lượng xuất không?
            if (tonKho.getSoLuongKhaDung().compareTo(pick.getSoLuongXuat()) < 0) {
                throw new RuntimeException("Lô [" + pick.getLoHang().getMaLo() + "] của biến thể ["
                        + pick.getBienTheSanPham().getMaSku() + "] hiện không còn đủ tồn khả dụng (Chỉ còn: "
                        + tonKho.getSoLuongKhaDung() + "). Vui lòng yêu cầu nhân viên kho chọn lại lô khác.");
            }
        }

        //Nếu tất cả đều đủ tiến hành tăng so_luong_da_dat để giữ hàng
        for (ChiTietPhieuXuatKho pick : detailedPicks) {
            TonKhoTheoLo tonKho = tonKhoTheoLoRepository
                    .findByKho_IdAndLoHang_Id(phieu.getKho().getId(), pick.getLoHang().getId())
                    .get();

            BigDecimal currentDaDat = tonKho.getSoLuongDaDat() != null ? tonKho.getSoLuongDaDat() : BigDecimal.ZERO;
            tonKho.setSoLuongDaDat(currentDaDat.add(pick.getSoLuongXuat()));

            tonKhoTheoLoRepository.save(tonKho);
        }
        phieu.setTrangThai(2); // Đã duyệt
        phieu.setNguoiDuyet(nguoiDuyet);
        repository.save(phieu);
    }

    @Transactional
    public void complete(Integer id, Integer nguoiXuatId) {
        PhieuXuatKho phieu = repository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu"));
        if (phieu.getTrangThai() != 2) throw new RuntimeException("Chỉ phiếu đã duyệt mới có thể xuất kho");
        NguoiDung nguoiXuat = nguoiDungRepository.findById(nguoiXuatId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người xuất"));
        List<ChiTietPhieuXuatKho> detailedPicks = chiTietPhieuXuatKhoRepository.findAll().stream()
                .filter(ct -> ct.getPhieuXuatKho().getId().equals(id) && ct.getLoHang() != null)
                .toList();

        for (ChiTietPhieuXuatKho pick : detailedPicks) {
            TonKhoTheoLo tonKho = tonKhoTheoLoRepository
                    .findByKho_IdAndLoHang_Id(phieu.getKho().getId(), pick.getLoHang().getId())
                    .orElseThrow(() -> new RuntimeException("Lỗi dữ liệu tồn kho"));

            BigDecimal soLuongTruoc = tonKho.getSoLuongTon();
            BigDecimal soLuongXuat = pick.getSoLuongXuat();

            // 1. Cập nhật tồn kho
            tonKho.setSoLuongTon(soLuongTruoc.subtract(soLuongXuat));
            tonKho.setSoLuongDaDat(tonKho.getSoLuongDaDat().subtract(soLuongXuat));
            tonKho.setNgayXuatGanNhat(Instant.now());
            tonKhoTheoLoRepository.save(tonKho);

            // 2. GHI LỊCH SỬ GIAO DỊCH KHO
            LichSuGiaoDichKho lichSu = LichSuGiaoDichKho.builder()
                    .ngayGiaoDich(Instant.now())
                    .loaiGiaoDich("xuat_kho")
                    .loaiThamChieu("phieu_xuat_kho")
                    .idThamChieu(phieu.getId())
                    .bienTheSanPham(pick.getBienTheSanPham())
                    .loHang(pick.getLoHang())
                    .kho(phieu.getKho())
                    .soLuong(soLuongXuat)
                    .soLuongTruoc(soLuongTruoc)
                    .soLuongSau(tonKho.getSoLuongTon())
                    .giaVon(pick.getLoHang().getGiaVon())
                    .nguoiDung(nguoiXuat)
                    .ghiChu("Xuất kho cho phiếu: " + phieu.getSoPhieuXuat())
                    .build();
            lichSuGiaoDichKhoRepository.save(lichSu);

            // 3. Cập nhật đơn bán
            if (phieu.getDonBanHang() != null) {
                updateSoLuongDaGiao(phieu.getDonBanHang().getId(), pick.getBienTheSanPham().getId(), soLuongXuat);
                updateTrangThaiDonBanHang(phieu.getDonBanHang().getId());
            }
        }

        phieu.setTrangThai(3); // Đã xuất (Completed)
        phieu.setNguoiXuat(nguoiXuat);
        phieu.setNgayXuat(Instant.now());
        repository.save(phieu);
    }

    private void updateTrangThaiDonBanHang(Integer donBanHangId) {
        DonBanHang don = entityManager.find(DonBanHang.class, donBanHangId);
        List<ChiTietDonBanHang> list =
                chiTietDonBanHangRepository.findByDonBanHangId(donBanHangId);
        boolean allZero = true;
        boolean allFull = true;
        for (ChiTietDonBanHang ct : list) {
            BigDecimal daGiao =
                    ct.getSoLuongDaGiao() != null ? ct.getSoLuongDaGiao() : BigDecimal.ZERO;
            if (daGiao.compareTo(BigDecimal.ZERO) > 0) {
                allZero = false;
            }
            if (daGiao.compareTo(ct.getSoLuongDat()) < 0) {
                allFull = false;
            }
        }
        if (allFull) {
            don.setTrangThai(3); // Hoàn thành
        } else if (!allZero) {
            don.setTrangThai(2); // Đang xuất kho
        } else {
            don.setTrangThai(1); // Chờ xuất kho
        }
        entityManager.merge(don);
    }


    private void updateSoLuongDaGiao(Integer donHangId, Integer bienTheId, BigDecimal qtyShipped) {
        List<ChiTietDonBanHang> listCtSO = chiTietDonBanHangRepository.findByDonBanHangId(donHangId);
        ChiTietDonBanHang ctSO = listCtSO.stream()
                .filter(ct -> ct.getBienTheSanPham().getId().equals(bienTheId))
                .findFirst()
                .orElse(null);
        if (ctSO != null) {
            BigDecimal hienTai = ctSO.getSoLuongDaGiao() != null ? ctSO.getSoLuongDaGiao() : BigDecimal.ZERO;
            ctSO.setSoLuongDaGiao(hienTai.add(qtyShipped));
            chiTietDonBanHangRepository.save(ctSO);
        }
    }

    @Transactional
    public void cancel(Integer id) {
        PhieuXuatKho phieu = repository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu"));
        if (phieu.getTrangThai() == 3) throw new RuntimeException("Phiếu đã xuất kho, không thể hủy");
        if (phieu.getTrangThai() == 4) throw new RuntimeException("Phiếu đã bị hủy trước đó");
        if (phieu.getTrangThai() == 2) {
            // Lấy tất cả chi tiết đã được pick lô
            List<ChiTietPhieuXuatKho> detailedPicks = chiTietPhieuXuatKhoRepository.findAll().stream()
                    .filter(ct -> ct.getPhieuXuatKho().getId().equals(id) && ct.getLoHang() != null)
                    .toList();
            for (ChiTietPhieuXuatKho pick : detailedPicks) {
                // Tìm bản ghi tồn kho của lô đó tại kho xuất
                TonKhoTheoLo tonKho = tonKhoTheoLoRepository
                        .findByKho_IdAndLoHang_Id(phieu.getKho().getId(), pick.getLoHang().getId())
                        .orElse(null);
                if (tonKho != null) {
                    BigDecimal currentDaDat = tonKho.getSoLuongDaDat() != null ? tonKho.getSoLuongDaDat() : BigDecimal.ZERO;
                    // Trừ số lượng đã đặt
                    BigDecimal extensionDaDat = currentDaDat.subtract(pick.getSoLuongXuat());
                    // Đảm bảo không bị âm do lỗi logic dữ liệu
                    tonKho.setSoLuongDaDat(extensionDaDat.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : extensionDaDat);
                    tonKhoTheoLoRepository.save(tonKho);
                }
            }
        }
        phieu.setTrangThai(4); // Đã hủy
        repository.save(phieu);
    }

    @Transactional
    public void pickLoHang(Integer phieuXuatKhoId, PickLoHangRequest request) {
        PhieuXuatKho phieu = repository.findById(phieuXuatKhoId).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu"));
        if (phieu.getTrangThai() != 0) throw new RuntimeException("Chỉ được chỉnh sửa pick lô khi phiếu ở trạng thái Mới tạo");

        ChiTietPhieuXuatKho ctGoc = chiTietPhieuXuatKhoRepository.findById(request.getChiTietPhieuXuatKhoId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dòng phiếu xuất"));

        if (ctGoc.getLoHang() != null) throw new RuntimeException("Chỉ được pick lô từ dòng gốc");

        BigDecimal tongPickLanNay = request.getLoHangPicks().stream()
                .map(PickLoHangRequest.Item::getSoLuongXuat)
                .filter(sl -> sl != null && sl.compareTo(BigDecimal.ZERO) > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (tongPickLanNay.compareTo(ctGoc.getSoLuongXuat()) > 0) {
            throw new RuntimeException("Tổng số lượng pick vượt quá số lượng cần xuất");
        }

        chiTietPhieuXuatKhoRepository.deletePickedByPhieuAndBienThe(phieuXuatKhoId, ctGoc.getBienTheSanPham().getId());

        for (PickLoHangRequest.Item item : request.getLoHangPicks()) {
            if (item.getSoLuongXuat() == null || item.getSoLuongXuat().compareTo(BigDecimal.ZERO) <= 0) continue;

            LoHang loHang = loHangRepository.findById(item.getLoHangId()).orElseThrow(() -> new RuntimeException("Không tìm thấy lô"));
            TonKhoTheoLo tonKho = tonKhoTheoLoRepository.findByKho_IdAndLoHang_Id(phieu.getKho().getId(), loHang.getId())
                    .orElseThrow(() -> new RuntimeException("Lô không có trong kho xuất"));

            if (item.getSoLuongXuat().compareTo(tonKho.getSoLuongKhaDung()) > 0) {
                throw new RuntimeException("Lô " + loHang.getMaLo() + " không đủ tồn khả dụng");
            }

            ChiTietPhieuXuatKho ctPick = ChiTietPhieuXuatKho.builder()
                    .phieuXuatKho(phieu)
                    .bienTheSanPham(ctGoc.getBienTheSanPham())
                    .loHang(loHang)
                    .soLuongXuat(item.getSoLuongXuat())
                    .giaVon(loHang.getGiaVon())
                    .build();
            chiTietPhieuXuatKhoRepository.save(ctPick);
        }
    }

    private void validatePickedQuantity(Integer phieuId) {
        List<ChiTietPhieuXuatKho> gocList = chiTietPhieuXuatKhoRepository.findByPhieuXuatKhoIdAndLoHangIsNull(phieuId);
        for (ChiTietPhieuXuatKho goc : gocList) {
            BigDecimal daPick = chiTietPhieuXuatKhoRepository.sumSoLuongDaPick(phieuId, goc.getBienTheSanPham().getId());
            if (daPick.compareTo(goc.getSoLuongXuat()) < 0) {
                throw new RuntimeException("Sản phẩm " + goc.getBienTheSanPham().getMaSku() + " chưa được pick đủ số lượng");
            }
        }
    }

    @Transactional(readOnly = true)
    public ChiTietPhieuNhapKhoResponse getDetail(Integer id) {
        PhieuXuatKho phieu = repository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu xuất kho"));

        // 1. Map Kho xuất
        KhoDto khoDto = (phieu.getKho() != null) ? KhoDto.builder()
                .id(phieu.getKho().getId())
                .tenKho(phieu.getKho().getTenKho())
                .maKho(phieu.getKho().getMaKho())
                .build() : null;

        // 2. Map Kho chuyển đến (nếu có)
        KhoDto khoChuyenDenDto = (phieu.getKhoChuyenDen() != null) ? KhoDto.builder()
                .id(phieu.getKhoChuyenDen().getId())
                .tenKho(phieu.getKhoChuyenDen().getTenKho())
                .maKho(phieu.getKhoChuyenDen().getMaKho())
                .build() : null;

        // 3. Map Đơn bán hàng
        DonBanHangDto donBanHangDto = (phieu.getDonBanHang() != null) ? DonBanHangDto.builder()
                .id(phieu.getDonBanHang().getId())
                .soDonHang(phieu.getDonBanHang().getSoDonHang()) // Lấy mã đơn hàng vào đây
                .build() : null;

        NguoiDungDto nguoiXuatDto = (phieu.getNguoiXuat() != null) ? NguoiDungDto.builder()
                .id(phieu.getNguoiXuat().getId())
                .hoTen(phieu.getNguoiXuat().getHoTen())
                .build() : null;

        NguoiDungDto nguoiDuyetDto = (phieu.getNguoiDuyet() != null) ? NguoiDungDto.builder()
                .id(phieu.getNguoiDuyet().getId())
                .hoTen(phieu.getNguoiDuyet().getHoTen())
                .build() : null;

        // 4. Build PhieuXuatKhoDto hoàn chỉnh
        PhieuXuatKhoDto phieuDto = PhieuXuatKhoDto.builder()
                .id(phieu.getId())
                .soPhieuXuat(phieu.getSoPhieuXuat())
                .loaiXuat(phieu.getLoaiXuat())
                .donBanHang(donBanHangDto)
                .kho(khoDto)
                .khoChuyenDen(khoChuyenDenDto)
                .ngayXuat(phieu.getNgayXuat())
                .trangThai(phieu.getTrangThai())
                .ghiChu(phieu.getGhiChu())
                .nguoiXuat(nguoiXuatDto)
                .nguoiDuyet(nguoiDuyetDto)
                .ngayTao(phieu.getNgayTao())
                .ngayCapNhat(phieu.getNgayCapNhat())
                .build();

        List<ChiTietPhieuXuatKho> chiTietList = chiTietPhieuXuatKhoRepository.findByPhieuXuatKhoIdAndLoHangIsNull(phieu.getId());
        List<ChiTietPhieuXuatKhoDto> chiTietDtos = chiTietList.stream().map(ct -> {
            BigDecimal soLuongCanXuat = ct.getSoLuongXuat();
            BigDecimal soLuongDaPick = chiTietPhieuXuatKhoRepository.sumSoLuongDaPick(phieu.getId(), ct.getBienTheSanPham().getId());
            return ChiTietPhieuXuatKhoDto.builder()
                    .id(ct.getId())
                    .bienTheSanPhamId(ct.getBienTheSanPham().getId())
                    .sku(ct.getBienTheSanPham().getMaSku())
                    .tenBienThe(ct.getBienTheSanPham().getSanPham().getTenSanPham() + " / " + ct.getBienTheSanPham().getMauSac().getTenMau())
                    .soLuongCanXuat(soLuongCanXuat)
                    .soLuongDaPick(soLuongDaPick)
                    .duSoLuong(soLuongDaPick.compareTo(soLuongCanXuat) >= 0)
                    .build();
        }).toList();

        return ChiTietPhieuNhapKhoResponse.builder().phieu(phieuDto).chiTiet(chiTietDtos).build();
    }

    @Transactional(readOnly = true)
    public PhieuXuatKhoViewDto viewForSales(Integer id) {

        PhieuXuatKho phieu = repository.findById(id)
                .orElseThrow(() -> new CommonException("Không tìm thấy phiếu xuất"));

        NguoiDungAuthInfo user = SecurityContextHolder.getUser();

        // Nếu là sales thi chỉ được xem phiếu thuộc đơn mình tạo
        if (user.getVaiTro().equals(IRoleType.nhan_vien_ban_hang)) {

            if (phieu.getDonBanHang() == null ||
                    !phieu.getDonBanHang().getNguoiTao().getId().equals(user.getId())) {

                throw new AccessDeniedException("Không có quyền xem phiếu này");
            }
        }

        return PhieuXuatKhoViewDto.builder()
                .id(phieu.getId())
                .soPhieuXuat(phieu.getSoPhieuXuat())
                .ngayXuat(phieu.getNgayXuat())
                .trangThai(phieu.getTrangThai())
                .ghiChu(phieu.getGhiChu())
                .tenKho(phieu.getKho().getTenKho())
                .soDonHang(phieu.getDonBanHang().getSoDonHang())
                .nguoiDuyet(phieu.getNguoiDuyet() != null ? phieu.getNguoiDuyet().getHoTen() : null)
                .nguoiXuat(phieu.getNguoiXuat() != null ? phieu.getNguoiXuat().getHoTen() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TonKhoTheoLoDto> getAvailableLots(Integer phieuXuatKhoId, Integer bienTheSanPhamId) {
        PhieuXuatKho phieu = repository.findById(phieuXuatKhoId).orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu"));
        return tonKhoTheoLoRepository.findAvailableLots(phieu.getKho().getId(), bienTheSanPhamId, phieuXuatKhoId).stream()
                .map(t -> TonKhoTheoLoDto.builder()
                        .loHangId(t.getLoHang().getId())
                        .maLo(t.getLoHang().getMaLo())
                        .ngayNhapGanNhat(t.getNgayNhapGanNhat())
                        .soLuongKhaDung(t.getSoLuongKhaDung())
                        .build()).toList();
    }

    @Transactional(readOnly = true)
    public List<PickedLotDto> getPickedLots(Integer phieuXuatKhoId, Integer chiTietPhieuXuatKhoId) {
        ChiTietPhieuXuatKho ct = chiTietPhieuXuatKhoRepository.findById(chiTietPhieuXuatKhoId).orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết"));
        return chiTietPhieuXuatKhoRepository.findPickedLots(phieuXuatKhoId, ct.getBienTheSanPham().getId());
    }

    private String generateSoPhieu() {
        String prefix = "PX" + java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
        return prefix + (((PhieuXuatKhoRepository) repository).countBySoPhieuXuatStartingWith(prefix) + 1);
    }

    private boolean isDuplicateSoPhieu(Exception ex) {
        return ex.getMessage() != null && ex.getMessage().contains("uk_phieu_xuat_kho_so_phieu");
    }
}