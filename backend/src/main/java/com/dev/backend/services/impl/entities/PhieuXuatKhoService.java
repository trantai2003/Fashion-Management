package com.dev.backend.services.impl.entities;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.dto.request.ChiTietPhieuXuatKhoCreating;
import com.dev.backend.dto.request.PhieuChuyenKhoCreating;
import com.dev.backend.dto.request.PhieuXuatKhoCreating;
import com.dev.backend.dto.request.PickLoHangRequest;
import com.dev.backend.dto.response.customize.PhieuXuatKhoViewDto;
import com.dev.backend.dto.response.customize.PickedLotDto;
import com.dev.backend.dto.response.customize.TransferDetailDto;
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
import java.util.Optional;

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

    @Autowired
    private PhieuNhapKhoRepository phieuNhapKhoRepository;

    @Autowired
    private ChiTietPhieuNhapKhoRepository chiTietPhieuNhapKhoRepository;

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
            throw new RuntimeException("Phiếu xuất phải có nhất 1 sản phẩm");
        }

        DonBanHang donBanHang = entityManager.find(DonBanHang.class, request.getDonBanHangId());
        if (donBanHang == null) {
            throw new RuntimeException("Đơn bán không tồn tại");
        }
        if (donBanHang.getTrangThai() == 4) {
            throw new RuntimeException("Đơn bán đã bị huỷ");
        }

        // 1. Lấy thông tin người dùng và kho từ Request
        Integer requestKhoId = request.getKhoId();
        if (requestKhoId == null) {
            throw new RuntimeException("Vui lòng chọn kho xuất hàng");
        }

        // 2. Kiểm tra quyền hạn kho
        // Admin được phép chọn mọi kho, Nhân viên chỉ được chọn kho mình thuộc về
        boolean isAdmin = SecurityContextHolder.getUser().getVaiTro()
                .contains(IRoleType.quan_tri_vien);
        Integer userInventoryId = SecurityContextHolder.getKhoId();

        if (!isAdmin && !requestKhoId.equals(userInventoryId)) {
            throw new RuntimeException("Bạn không có quyền xuất hàng từ kho này");
        }

        Kho khoXuat = entityManager.find(Kho.class, requestKhoId);
        if (khoXuat == null) {
            throw new RuntimeException("Kho đã chọn không tồn tại");
        }

        // 3. Kiểm tra logic đơn hàng với kho đã chọn
        if (donBanHang.getKhoXuat() == null) {
            donBanHang.setKhoXuat(khoXuat);
        } else if (!donBanHang.getKhoXuat().getId().equals(requestKhoId)) {
            throw new RuntimeException("Đơn bán này đã được chỉ định cho kho: " + donBanHang.getKhoXuat().getTenKho());
        }

        // Kiểm tra sản phẩm còn lại
        List<ChiTietDonBanHang> chiTietSOList = chiTietDonBanHangRepository.findByDonBanHangId(donBanHang.getId());
        boolean hasRemaining = chiTietSOList.stream().anyMatch(ct -> {
            BigDecimal daGiao = ct.getSoLuongDaGiao() != null ? ct.getSoLuongDaGiao() : BigDecimal.ZERO;
            return ct.getSoLuongDat().compareTo(daGiao) > 0;
        });

        if (!hasRemaining) {
            throw new RuntimeException("Đơn bán đã giao đủ toàn bộ sản phẩm");
        }

        int retry = 0;
        int maxRetry = 5;
        while (true) {
            try {
                PhieuXuatKho phieu = PhieuXuatKho.builder()
                        .soPhieuXuat(generateSoPhieu())
                        .donBanHang(donBanHang)
                        .ngayXuat(null)
                        .kho(khoXuat) // Sử dụng kho từ request
                        .ghiChu(request.getGhiChu())
                        .loaiXuat("ban_hang")
                        .trangThai(0)
                        .build();

                phieu = repository.save(phieu);

                for (ChiTietPhieuXuatKhoCreating reqCt : request.getChiTietXuat()) {
                    ChiTietDonBanHang ctSO = chiTietSOList.stream()
                            .filter(ct -> ct.getBienTheSanPham().getId().equals(reqCt.getBienTheSanPhamId()))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("Sản phẩm không thuộc đơn bán"));

                    BigDecimal daGiao = ctSO.getSoLuongDaGiao() != null ? ctSO.getSoLuongDaGiao() : BigDecimal.ZERO;
                    BigDecimal conLai = ctSO.getSoLuongDat().subtract(daGiao);

                    if (reqCt.getSoLuongXuat().compareTo(conLai) > 0) {
                        throw new RuntimeException("Sản phẩm " + ctSO.getBienTheSanPham().getMaSku() + " xuất vượt quá số lượng còn lại");
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
        PhieuXuatKho phieu = repository.findById(phieuXuatKhoId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu"));

        // 1. KIỂM TRA TRẠNG THÁI PHÙ HỢP
        boolean isChuyenKho = "chuyen_kho".equals(phieu.getLoaiXuat());
        if (isChuyenKho) {
            if (phieu.getTrangThai() != 2) { // Đối với chuyển kho, phải Đã duyệt mới được pick
                throw new RuntimeException("Chỉ được pick lô cho phiếu chuyển kho ở trạng thái Đã duyệt (2)");
            }
        } else {
            if (phieu.getTrangThai() != 0) { // Đối với SO, phải ở trạng thái Nháp mới được pick
                throw new RuntimeException("Chỉ được chỉnh sửa pick lô cho đơn bán hàng ở trạng thái Mới tạo (0)");
            }
        }

        ChiTietPhieuXuatKho ctGoc = chiTietPhieuXuatKhoRepository.findById(request.getChiTietPhieuXuatKhoId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dòng phiếu xuất gốc"));

        if (ctGoc.getLoHang() != null) throw new RuntimeException("Vui lòng thực hiện pick lô từ dòng sản phẩm gốc");

        BigDecimal tongPickLanNay = request.getLoHangPicks().stream()
                .map(PickLoHangRequest.Item::getSoLuongXuat)
                .filter(sl -> sl != null && sl.compareTo(BigDecimal.ZERO) > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (tongPickLanNay.compareTo(ctGoc.getSoLuongXuat()) > 0) {
            throw new RuntimeException("Tổng số lượng bốc lô vượt quá số lượng yêu cầu");
        }

        // 2. RẼ NHÁNH HOÀN LẠI SO_LUONG_DA_DAT (Chỉ áp dụng cho Chuyển kho)
        if (isChuyenKho) {
            List<ChiTietPhieuXuatKho> oldPicks = chiTietPhieuXuatKhoRepository
                    .findByPhieuXuatKhoIdAndBienTheSanPhamIdAndLoHangIsNotNull(phieuXuatKhoId, ctGoc.getBienTheSanPham().getId());

            for (ChiTietPhieuXuatKho old : oldPicks) {
                tonKhoTheoLoRepository.findByKho_IdAndLoHang_Id(phieu.getKho().getId(), old.getLoHang().getId())
                        .ifPresent(t -> {
                            BigDecimal currentDaDat = t.getSoLuongDaDat() != null ? t.getSoLuongDaDat() : BigDecimal.ZERO;
                            t.setSoLuongDaDat(currentDaDat.subtract(old.getSoLuongXuat()));
                            tonKhoTheoLoRepository.save(t);
                        });
            }
        }

        // 3. Xóa các dòng pick cũ
        chiTietPhieuXuatKhoRepository.deletePickedByPhieuAndBienThe(phieuXuatKhoId, ctGoc.getBienTheSanPham().getId());

        // 4. LƯU PICK MỚI VÀ RẼ NHÁNH CẬP NHẬT SO_LUONG_DA_DAT
        for (PickLoHangRequest.Item item : request.getLoHangPicks()) {
            if (item.getSoLuongXuat() == null || item.getSoLuongXuat().compareTo(BigDecimal.ZERO) <= 0) continue;

            LoHang loHang = loHangRepository.findById(item.getLoHangId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy lô hàng"));

            TonKhoTheoLo tonKho = tonKhoTheoLoRepository.findByKho_IdAndLoHang_Id(phieu.getKho().getId(), loHang.getId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không có tồn kho trong lô đã chọn tại kho này"));

            // Kiểm tra tồn khả dụng (Chỉ áp dụng cho Chuyển kho vì SO đã giữ hàng từ trước)
            if (isChuyenKho && item.getSoLuongXuat().compareTo(tonKho.getSoLuongKhaDung()) > 0) {
                throw new RuntimeException("Lô " + loHang.getMaLo() + " không đủ tồn khả dụng để chuyển đi");
            }

            // CHỈ CẬP NHẬT SO_LUONG_DA_DAT NẾU LÀ CHUYỂN KHO
            if (isChuyenKho) {
                BigDecimal currentDaDat = tonKho.getSoLuongDaDat() != null ? tonKho.getSoLuongDaDat() : BigDecimal.ZERO;
                tonKho.setSoLuongDaDat(currentDaDat.add(item.getSoLuongXuat()));
                tonKhoTheoLoRepository.save(tonKho);
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
        if (user.getVaiTro().contains(IRoleType.nhan_vien_ban_hang)) {
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

    @Transactional(readOnly = true)
    public TransferDetailDto getTransferDetail(Integer id) {
        PhieuXuatKho phieu = repository.findById(id)
                .orElseThrow(() -> new CommonException("Không tìm thấy phiếu chuyển kho id: " + id));

        if (!"chuyen_kho".equals(phieu.getLoaiXuat())) {
            throw new RuntimeException("Đây không phải là phiếu chuyển kho");
        }

        // 1. Lấy danh sách hàng hóa yêu cầu (những dòng chưa có lo_hang_id)
        List<ChiTietPhieuXuatKho> itemsGoc = chiTietPhieuXuatKhoRepository.findByPhieuXuatKhoIdAndLoHangIsNull(id);

        List<TransferDetailDto.TransferItemDto> itemDtos = itemsGoc.stream().map(ct -> {
            // Tính tổng số lượng đã pick lô cho biến thể này (nếu có)
            BigDecimal daPick = chiTietPhieuXuatKhoRepository.sumSoLuongDaPick(id, ct.getBienTheSanPham().getId());

            return TransferDetailDto.TransferItemDto.builder()
                    .bienTheId(ct.getBienTheSanPham().getId())
                    .sku(ct.getBienTheSanPham().getMaSku())
                    .tenSanPham(ct.getBienTheSanPham().getSanPham().getTenSanPham() + " - " + ct.getBienTheSanPham().getMauSac().getTenMau())
                    .soLuongYeuCau(ct.getSoLuongXuat())
                    .soLuongDaPick(daPick != null ? daPick : BigDecimal.ZERO)
                    .build();
        }).toList();

        return TransferDetailDto.builder()
                .id(phieu.getId())
                .soPhieuXuat(phieu.getSoPhieuXuat())
                .khoXuatId(phieu.getKho().getId())
                .khoXuatTen(phieu.getKho().getTenKho())
                .khoNhapId(phieu.getKhoChuyenDen().getId())
                .khoNhapTen(phieu.getKhoChuyenDen().getTenKho())
                .nguoiXuatTen(phieu.getNguoiXuat() != null ? phieu.getNguoiXuat().getHoTen() : "N/A")
                .nguoiDuyetTen(phieu.getNguoiDuyet() != null ? phieu.getNguoiDuyet().getHoTen() : "Chưa duyệt")
                .ngayTao(phieu.getNgayTao())
                .trangThai(phieu.getTrangThai())
                .ghiChu(phieu.getGhiChu())
                .items(itemDtos)
                .build();
    }
    @Transactional
    public void submitTransfer(Integer id) {
        //Tìm phiếu
        PhieuXuatKho phieu = repository.findById(id)
                .orElseThrow(() -> new CommonException("Không tìm thấy phiếu chuyển kho id: " + id));
        //Kiểm tra loại phiếu và trạng thái hợp lệ
        if (!"chuyen_kho".equals(phieu.getLoaiXuat())) {
            throw new RuntimeException("Đây không phải là phiếu chuyển kho nội bộ");
        }
        if (phieu.getTrangThai() != 0) { // 0 là Nháp
            throw new RuntimeException("Chỉ phiếu ở trạng thái Nháp mới có thể gửi duyệt");
        }
        //Kiểm tra xem phiếu đã có ít nhất 1 sản phẩm chưa
        List<ChiTietPhieuXuatKho> details = chiTietPhieuXuatKhoRepository.findByPhieuXuatKhoIdAndLoHangIsNull(id);
        if (details.isEmpty()) {
            throw new RuntimeException("Vui lòng thêm ít nhất một sản phẩm vào phiếu trước khi gửi duyệt");
        }
        //Cập nhật trạng thái sang 1 (Chờ duyệt)
        phieu.setTrangThai(1);
        repository.save(phieu);
    }
    @Transactional
    public void approveTransfer(Integer id, Integer nguoiDuyetId) {
        //Tìm phiếu
        PhieuXuatKho phieu = repository.findById(id)
                .orElseThrow(() -> new CommonException("Không tìm thấy phiếu chuyển kho id: " + id));
        //Kiểm tra loại phiếu và trạng thái (Phải là Chờ duyệt - 1)
        if (!"chuyen_kho".equals(phieu.getLoaiXuat())) {
            throw new RuntimeException("Đây không phải là phiếu chuyển kho nội bộ");
        }
        if (phieu.getTrangThai() != 1) {
            throw new RuntimeException("Chỉ phiếu ở trạng thái Chờ duyệt mới có thể phê duyệt");
        }

        // KIỂM TRA QUYỀN: Phải là Quản lý Kho A (Kho xuất) mới được duyệt cho đi
        boolean isAdmin = SecurityContextHolder.getUser().getVaiTro().contains(IRoleType.quan_tri_vien);
        Integer userWarehouseId = SecurityContextHolder.getKhoId();

        if (!isAdmin && !phieu.getKho().getId().equals(userWarehouseId)) {
            throw new AccessDeniedException("Bạn không có quyền duyệt phiếu này. Chỉ quản lý tại kho xuất ("
                    + phieu.getKho().getTenKho() + ") mới có quyền cho phép xuất hàng.");
        }

        NguoiDung nguoiDuyet = nguoiDungRepository.findById(nguoiDuyetId).orElseThrow();

        //Cập nhật trạng thái sang 2 (Đã duyệt)
        phieu.setTrangThai(2);
        phieu.setNguoiDuyet(nguoiDuyet);
        repository.save(phieu);
    }
    @Transactional
    public void startShipping(Integer id, Integer nguoiXuatId) {
        // Tìm phiếu và kiểm tra tính hợp lệ
        PhieuXuatKho phieu = repository.findById(id)
                .orElseThrow(() -> new CommonException("Không tìm thấy phiếu chuyển kho id: " + id));

        if (!"chuyen_kho".equals(phieu.getLoaiXuat()) || phieu.getTrangThai() != 2) {
            throw new RuntimeException("Chỉ phiếu chuyển kho đã duyệt mới có thể bắt đầu vận chuyển");
        }

        // Lấy thông tin kho Trung chuyển (mã 'KHO_TRANSIT')
        Kho khoTransit = entityManager.createQuery("SELECT k FROM Kho k WHERE k.maKho = 'KHO_TRANSIT'", Kho.class)
                .getSingleResult();

        NguoiDung nguoiXuat = nguoiDungRepository.findById(nguoiXuatId).orElseThrow();

        // Lấy danh sách các lô hàng đã được pick (những dòng có lo_hang_id)
        List<ChiTietPhieuXuatKho> detailedPicks = chiTietPhieuXuatKhoRepository.findAll().stream()
                .filter(ct -> ct.getPhieuXuatKho().getId().equals(id) && ct.getLoHang() != null)
                .toList();

        if (detailedPicks.isEmpty()) {
            throw new RuntimeException("Phiếu chưa được pick lô hàng cụ thể, không thể xuất kho");
        }

        for (ChiTietPhieuXuatKho pick : detailedPicks) {
            BigDecimal qty = pick.getSoLuongXuat();

            // TRỪ TỒN TẠI KHO A (Trừ tồn thực tế và trừ số lượng đã đặt)
            TonKhoTheoLo tonA = tonKhoTheoLoRepository
                    .findByKho_IdAndLoHang_Id(phieu.getKho().getId(), pick.getLoHang().getId())
                    .orElseThrow(() -> new RuntimeException("Lỗi dữ liệu tồn kho A"));

            BigDecimal tonTruocA = tonA.getSoLuongTon();
            tonA.setSoLuongTon(tonTruocA.subtract(qty));
            tonA.setSoLuongDaDat(tonA.getSoLuongDaDat().subtract(qty)); // Giải phóng hàng đã giữ
            tonKhoTheoLoRepository.save(tonA);

            // CỘNG TỒN VÀO KHO TRUNG CHUYỂN (Hàng đang đi trên đường)
            TonKhoTheoLo tonTransit = tonKhoTheoLoRepository
                    .findByKho_IdAndLoHang_Id(khoTransit.getId(), pick.getLoHang().getId())
                    .orElse(TonKhoTheoLo.builder()
                            .kho(khoTransit).loHang(pick.getLoHang())
                            .soLuongTon(BigDecimal.ZERO).soLuongDaDat(BigDecimal.ZERO)
                            .build());

            BigDecimal tonTruocTransit = tonTransit.getSoLuongTon();
            tonTransit.setSoLuongTon(tonTruocTransit.add(qty));
            tonTransit.setNgayNhapGanNhat(Instant.now());
            tonKhoTheoLoRepository.save(tonTransit);

            // C. GHI LỊCH SỬ GIAO DỊCH (2 dòng: Xuất A và Nhập Transit)
            saveHistory(phieu, pick, phieu.getKho(), "xuat_kho", "Xuất chuyển kho: " + phieu.getSoPhieuXuat(), nguoiXuat, tonTruocA, tonA.getSoLuongTon());
            saveHistory(phieu, pick, khoTransit, "nhap_kho", "Hàng đang đi đường: " + phieu.getSoPhieuXuat(), nguoiXuat, tonTruocTransit, tonTransit.getSoLuongTon());
        }

        // TỰ ĐỘNG SINH PHIẾU NHẬP KHO CHO KHO B
        createAutoPhieuNhapForKhoB(phieu, detailedPicks);

        // Cập nhật trạng thái phiếu xuất sang 3
        phieu.setTrangThai(3);
        phieu.setNgayXuat(Instant.now());
        phieu.setNguoiXuat(nguoiXuat);
        repository.save(phieu);
    }

    private String generateSoPhieuNhapTransfer() {
        String dateStr = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
        String prefix = "PN-TRF-" + dateStr;
        long countToday = phieuNhapKhoRepository.countBySoPhieuPrefix(prefix);

        return prefix + (countToday + 1);
    }

    private void createAutoPhieuNhapForKhoB(PhieuXuatKho px, List<ChiTietPhieuXuatKho> picks) {
        PhieuNhapKho pn = PhieuNhapKho.builder()
                .soPhieuNhap(generateSoPhieuNhapTransfer())
                .kho(px.getKhoChuyenDen())
                .trangThai(2) // 2: Đã duyệt
                .nguoiDuyet(px.getNguoiDuyet())
                .ngayTao(Instant.now())
                .ghiChu("Nhập kho tự động từ phiếu chuyển " + px.getSoPhieuXuat())
                .build();
        pn = phieuNhapKhoRepository.save(pn);

        for (ChiTietPhieuXuatKho pick : picks) {
            ChiTietPhieuNhapKho ct = ChiTietPhieuNhapKho.builder()
                    .phieuNhapKho(pn)
                    .bienTheSanPham(pick.getBienTheSanPham())
                    .soLuongNhap(pick.getSoLuongXuat())
                    .donGia(pick.getLoHang().getGiaVon())
                    .loHang(pick.getLoHang()) // QUAN TRỌNG: Kế thừa lô hàng để Kho B không phải chọn lại
                    .build();
            chiTietPhieuNhapKhoRepository.save(ct);
        }
    }

    private void saveHistory(PhieuXuatKho p, ChiTietPhieuXuatKho pick, Kho kho, String type, String note, NguoiDung user, BigDecimal truoc, BigDecimal sau) {
        LichSuGiaoDichKho history = LichSuGiaoDichKho.builder()
                .ngayGiaoDich(Instant.now())
                .loaiGiaoDich(type)
                .loaiThamChieu("phieu_xuat_kho")
                .idThamChieu(p.getId())
                .bienTheSanPham(pick.getBienTheSanPham())
                .loHang(pick.getLoHang())
                .kho(kho)
                .soLuong(pick.getSoLuongXuat())
                .soLuongTruoc(truoc)
                .soLuongSau(sau)
                .giaVon(pick.getLoHang().getGiaVon())
                .nguoiDung(user)
                .ghiChu(note)
                .build();
        lichSuGiaoDichKhoRepository.save(history);
    }
    @Transactional
    public void cancelTransfer(Integer id) {
        PhieuXuatKho phieu = repository.findById(id)
                .orElseThrow(() -> new CommonException("Không tìm thấy phiếu chuyển kho id: " + id));

        if (!"chuyen_kho".equals(phieu.getLoaiXuat())) {
            throw new RuntimeException("Đây không phải là phiếu chuyển kho nội bộ");
        }

        int currentStatus = phieu.getTrangThai();
        if (currentStatus == 5) throw new RuntimeException("Phiếu đã hoàn tất, không thể hủy");
        if (currentStatus == 4) throw new RuntimeException("Phiếu đã được hủy trước đó");

        // Lấy danh sách các lô hàng đã bốc
        List<ChiTietPhieuXuatKho> detailedPicks = chiTietPhieuXuatKhoRepository.findAll().stream()
                .filter(ct -> ct.getPhieuXuatKho().getId().equals(id) && ct.getLoHang() != null)
                .toList();

        if (currentStatus == 2) {
            // TRẠNG THÁI ĐÃ DUYỆT (Chưa xuất): Chỉ cần hoàn trả số lượng đã đặt (giữ hàng) tại Kho A
            for (ChiTietPhieuXuatKho pick : detailedPicks) {
                TonKhoTheoLo tonA = tonKhoTheoLoRepository
                        .findByKho_IdAndLoHang_Id(phieu.getKho().getId(), pick.getLoHang().getId())
                        .orElse(null);
                if (tonA != null) {
                    BigDecimal currentDaDat = tonA.getSoLuongDaDat() != null ? tonA.getSoLuongDaDat() : BigDecimal.ZERO;
                    tonA.setSoLuongDaDat(currentDaDat.subtract(pick.getSoLuongXuat()));
                    tonKhoTheoLoRepository.save(tonA);
                }
            }
        }
        else if (currentStatus == 3) {
            // TRẠNG THÁI ĐANG VẬN CHUYỂN: Hàng đã rời kho A và đang ở Transit
            // 1. KHÔNG cộng trực tiếp. Thay vào đó, AUTO tạo phiếu Nhập kho cho Kho A (Nhập trả)
            createAutoPhieuNhapHoanTra(phieu, detailedPicks);

            // 2. Hủy phiếu nhập kho dự kiến ban đầu của Kho B (vì hàng không đến B nữa)
            cancelLinkedReceipt(phieu.getSoPhieuXuat());
        }

        // Cập nhật trạng thái phiếu chuyển sang Đã hủy
        phieu.setTrangThai(4);
        repository.save(phieu);
    }
    private void createAutoPhieuNhapHoanTra(PhieuXuatKho px, List<ChiTietPhieuXuatKho> picks) {
        NguoiDung currentUser = nguoiDungRepository.findById(SecurityContextHolder.getUser().getId())
                .orElseThrow(() -> new CommonException("Không tìm thấy người dùng hiện tại"));

        PhieuNhapKho pn = PhieuNhapKho.builder()
                .soPhieuNhap(generateSoPhieuReturn(px.getSoPhieuXuat()))
                .kho(px.getKho()) // Nhập về chính Kho A (Kho nguồn ban đầu)
                .trangThai(2)
                .nguoiDuyet(currentUser)
                .ngayTao(Instant.now())
                .ghiChu("Nhập hoàn trả tự động do hủy phiếu chuyển: " + px.getSoPhieuXuat())
                .build();

        pn = phieuNhapKhoRepository.save(pn);

        for (ChiTietPhieuXuatKho pick : picks) {
            ChiTietPhieuNhapKho ct = ChiTietPhieuNhapKho.builder()
                    .phieuNhapKho(pn)
                    .bienTheSanPham(pick.getBienTheSanPham())
                    .soLuongNhap(pick.getSoLuongXuat())
                    .donGia(pick.getLoHang().getGiaVon())
                    .loHang(pick.getLoHang())
                    .build();
            chiTietPhieuNhapKhoRepository.save(ct);
        }
    }
    private String generateSoPhieuReturn(String soPhieuXuat) {
        return "PN-RET-" + soPhieuXuat;
    }

    private void cancelLinkedReceipt(String soPhieuXuat) {
        String ghiChuSearch = "Nhập kho tự động từ phiếu chuyển " + soPhieuXuat;
        Optional<PhieuNhapKho> phieuNhap = phieuNhapKhoRepository.findByGhiChuContaining(ghiChuSearch);
        if (phieuNhap.isPresent()) {
            PhieuNhapKho pn = phieuNhap.get();
            pn.setTrangThai(4); // 4: Đã hủy (Theo mapping của module Nhập kho)
            phieuNhapKhoRepository.save(pn);
        }
    }
    private String generateSoPhieuTransfer() {
        String dateStr = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "PX-TRF-" + dateStr;
        long countToday = ((PhieuXuatKhoRepository) repository).countBySoPhieuXuatStartingWith(prefix);
        return prefix + (countToday + 1);
    }

    @Transactional
    public PhieuXuatKho createTransfer(PhieuChuyenKhoCreating request) {
        // Kiểm tra cơ bản
        if (request.getChiTietXuat() == null || request.getChiTietXuat().isEmpty()) {
            throw new CommonException("Yêu cầu điều chuyển phải có ít nhất 1 sản phẩm");
        }
        if (request.getKhoXuatId().equals(request.getKhoNhapId())) {
            throw new CommonException("Kho gửi và kho nhận không được trùng nhau");
        }

        //Kiểm tra quyền
        NguoiDungAuthInfo currentUser = SecurityContextHolder.getUser();
        boolean isAdmin = currentUser.getVaiTro().contains(IRoleType.quan_tri_vien);
        Integer userWarehouseId = SecurityContextHolder.getKhoId();
        // Nếu không phải Admin, chỉ được tạo request cho chính kho của mình nhận
        if (!isAdmin && !request.getKhoNhapId().equals(userWarehouseId)) {
            throw new AccessDeniedException("Bạn chỉ có quyền tạo yêu cầu nhập hàng cho kho của mình");
        }

        //Tìm và kiểm tra thực thể (Nên ném lỗi nếu null)
        Kho khoA = Optional.ofNullable(entityManager.find(Kho.class, request.getKhoXuatId()))
                .orElseThrow(() -> new CommonException("Kho xuất hàng không tồn tại"));
        Kho khoB = Optional.ofNullable(entityManager.find(Kho.class, request.getKhoNhapId()))
                .orElseThrow(() -> new CommonException("Kho nhận hàng không tồn tại"));

        int retry = 0;
        int maxRetry = 5;
        while (true) {
            try {
                PhieuXuatKho phieu = PhieuXuatKho.builder()
                        .soPhieuXuat(generateSoPhieuTransfer())
                        .kho(khoA)
                        .khoChuyenDen(khoB)
                        .loaiXuat("chuyen_kho")
                        .trangThai(0) // Nháp
                        .ngayTao(Instant.now())
                        .ghiChu(request.getGhiChu())
                        .build();
                phieu = repository.save(phieu);
                for (ChiTietPhieuXuatKhoCreating reqCt : request.getChiTietXuat()) {
                    BienTheSanPham bt = Optional.ofNullable(entityManager.find(BienTheSanPham.class, reqCt.getBienTheSanPhamId()))
                            .orElseThrow(() -> new CommonException("Sản phẩm ID " + reqCt.getBienTheSanPhamId() + " không tồn tại"));

                    // check tồn kho
                    BigDecimal qtyYeuCau = reqCt.getSoLuongXuat();
                    BigDecimal qtyKhaDung = tonKhoTheoLoRepository.sumSoLuongKhaDungByKhoAndBienThe(khoA.getId(), bt.getId());

                    if (qtyKhaDung.compareTo(qtyYeuCau) < 0) {
                        throw new CommonException("Sản phẩm [" + bt.getMaSku() + "] không đủ tồn kho tại kho " + khoA.getTenKho() +
                                " (Yêu cầu: " + qtyYeuCau + ", Hiện có: " + qtyKhaDung + ")");
                    }
                    ChiTietPhieuXuatKho ct = ChiTietPhieuXuatKho.builder()
                            .phieuXuatKho(phieu)
                            .bienTheSanPham(bt)
                            .soLuongXuat(qtyYeuCau)
                            .build();
                    entityManager.persist(ct); // Dùng persist trong vòng lặp Transactional sẽ hiệu quả hơn
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
}