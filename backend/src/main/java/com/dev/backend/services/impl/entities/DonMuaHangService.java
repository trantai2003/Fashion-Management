package com.dev.backend.services.impl.entities;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.constant.GlobalCache;
import com.dev.backend.constant.enums.OtpType;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.dto.OtpScheduleObj;
import com.dev.backend.dto.request.*;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.DonMuaHangDto;
import com.dev.backend.dto.response.entities.NguoiDungAuthInfo;
import com.dev.backend.entities.*;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.DonMuaHangMapper;
import com.dev.backend.repository.DonMuaHangRepository;
import com.dev.backend.services.CalcService;
import com.dev.backend.services.EmailService;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

@Service
public class DonMuaHangService extends BaseServiceImpl<DonMuaHang, Integer> {
    @Autowired
    private EntityManager entityManager;
    @Autowired
    private NhaCungCapService nhaCungCapService;
    @Autowired
    private NguoiDungService nguoiDungService;
    @Autowired
    private KhoService khoService;
    @Autowired
    private ChiTietDonMuaHangService chiTietDonMuaHangService;
    @Autowired
    private BienTheSanPhamService bienTheSanPhamService;

    @Autowired
    private DonMuaHangMapper donMuaHangMapper;
    @Autowired
    private EmailService emailService;
    @Autowired
    private CalcService calcService;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public DonMuaHangService(DonMuaHangRepository repository) {
        super(repository);
    }

    private final DonMuaHangRepository donMuaHangRepository = (DonMuaHangRepository) getRepository();

    @Transactional
    public ResponseEntity<ResponseData<DonMuaHangDto>> create(DonMuaHangCreating creating) {

        NhaCungCap nhaCungCap = nhaCungCapService.getOne(creating.getNhaCungCapId()).orElseThrow(
                () -> new CommonException("Không tìm thấy nhà cung cấp id: " + creating.getNhaCungCapId())
        );

        Kho khoNhap = khoService.getOne(SecurityContextHolder.getKhoId()).orElseThrow(
                () -> new CommonException("Không tìm thấy kho id: " + SecurityContextHolder.getKhoId())
        );


        NguoiDungAuthInfo authInfo = SecurityContextHolder.getUser();

        NguoiDung nguoiTao = nguoiDungService.getOne(authInfo.getId()).orElseThrow(
                () -> new CommonException("Không tìm thấy người dùng id :" + authInfo.getId())
        );

        DonMuaHang donMuaHang = DonMuaHang.builder()
                .soDonMua(creating.getSoDonMua())
                .nhaCungCap(nhaCungCap)
                .khoNhap(khoNhap)
                .ngayDatHang(creating.getNgayDatHang())
                .ngayGiaoDuKien(creating.getNgayGiaoDuKien())
                .trangThai(nguoiTao.getVaiTro().equals(IRoleType.quan_tri_vien) ? creating.getTrangThai() : 1)
                .tongTien(BigDecimal.ZERO)
                .ghiChu(creating.getGhiChu())
                .nguoiTao(nguoiTao)
                .nguoiDuyet(nguoiTao.getVaiTro().equals(IRoleType.quan_tri_vien) ? nguoiTao : null)
                .build();

        donMuaHang = create(donMuaHang);

        BigDecimal tongTien = BigDecimal.ZERO;
        int stt = creating.getChiTietDonMuaHangs().size();
        BigDecimal tongSoLuong = BigDecimal.ZERO;

        List<ChiTietDonMuaHang> chiTietDonMuaHangs = new ArrayList<>();

        for (ChiTietDonMuaHangCreating ctdmhCreating : creating.getChiTietDonMuaHangs()) {
            BienTheSanPham bienTheSanPham = bienTheSanPhamService.getOne(ctdmhCreating.getBienTheSanPhamId()).orElseThrow(
                    () -> new CommonException("Không tìm thấy biến thể sản phẩm id: " + ctdmhCreating.getBienTheSanPhamId())
            );
            ChiTietDonMuaHang chiTietDonMuaHang = ChiTietDonMuaHang.builder()
                    .donMuaHang(donMuaHang)
                    .bienTheSanPham(bienTheSanPham)
                    .soLuongDat(ctdmhCreating.getSoLuongDat())
                    .soLuongDaNhan(ctdmhCreating.getSoLuongDaNhan())
                    .donGia(ctdmhCreating.getDonGia())
                    .ghiChu(ctdmhCreating.getGhiChu())
                    .build();
            chiTietDonMuaHangs.add(chiTietDonMuaHang);
            chiTietDonMuaHang = chiTietDonMuaHangService.create(chiTietDonMuaHang);
            tongSoLuong = tongSoLuong.add(chiTietDonMuaHang.getSoLuongDat());
            tongTien = tongTien.add(chiTietDonMuaHang.getThanhTien());
        }
        donMuaHang.setTongTien(tongTien);
        donMuaHang.setChiTietDonMuaHangs(chiTietDonMuaHangs);
        update(donMuaHang.getId(), donMuaHang);
        donMuaHang = getOne(donMuaHang.getId()).orElseThrow(
                () -> new CommonException("Không tìm thấy đơn mua hàng : " + creating.getSoDonMua())
        );

        if (donMuaHang.getTrangThai() == 3) {
            Date now = new Date();
            HashMap<String, Object> params = new HashMap<>();
            params.put("ngay", now.getDate());
            params.put("thang", now.getMonth() + 1);
            params.put("nam", now.getYear() + 1900);
            params.put("soDonMua", donMuaHang.getSoDonMua());

            String trangThaiText = "";
            if (donMuaHang.getTrangThai() == 3) {
                trangThaiText = " Quản lý đã duyệt và gửi mail";
            }
            params.put("trangThaiText", trangThaiText);
            params.put("tenKho", donMuaHang.getKhoNhap().getTenKho());
            params.put("diaChiKho", donMuaHang.getKhoNhap().getDiaChi());
            params.put("tenNhaCungCap", donMuaHang.getNhaCungCap().getTenNhaCungCap());
            params.put("maNhaCungCap", donMuaHang.getNhaCungCap().getMaNhaCungCap());
            params.put("nguoiLienHe", donMuaHang.getNhaCungCap().getNguoiLienHe());
            params.put("soDienThoai", donMuaHang.getNhaCungCap().getSoDienThoai());
            params.put("email", donMuaHang.getNhaCungCap().getEmail());
            params.put("tongSoMatHang", stt);
            params.put("tongSoLuong", tongSoLuong);
            params.put("tongTien", donMuaHang.getTongTien());
            params.put("ghiChu", donMuaHang.getGhiChu());
            params.put("ngayDatHang", donMuaHang.getNgayDatHang());
            params.put("ngayGiaoDuKien", donMuaHang.getNgayGiaoDuKien());
            params.put("hanPheDuyet", donMuaHang.getNgayGiaoDuKien());

            emailService.sendHtmlEmailFromTemplate(
                    donMuaHang.getNhaCungCap().getEmail(),
                    "Phiếu xác nhận nhập hàng",
                    "don_mua.html",
                    params
            );

        }

        return ResponseEntity.ok(
                ResponseData.<DonMuaHangDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(donMuaHangMapper.toDto(donMuaHang))
                        .message("Success")
                        .error(null)
                        .build()
        );
    }

    @Transactional
    public ResponseEntity<ResponseData<String>> getOtpForSupplier(OtpDonMuaHangGetting getting) {
        DonMuaHang donMuaHang = getOne(getting.getDonMuaHangId()).orElseThrow(
                () -> new CommonException("Không tìm thấy đơn mua hàng id: " + getting.getDonMuaHangId())
        );
        if (!getting.getEmail().equals(donMuaHang.getNhaCungCap().getEmail())) {
            throw new CommonException("Email nhà cung cấp không hợp lệ email: " + getting.getEmail());
        }

        if (donMuaHang.getTrangThai() != 3) {
            throw new CommonException("Đơn mua hàng không tồn tại id: " + getting.getDonMuaHangId());
        }

        for (OtpScheduleObj otpScheduleObj : GlobalCache.OTP_SCHEDULE_OBJS) {
            if (otpScheduleObj.getEmail().equals(getting.getEmail())) {
                throw new CommonException("Otp chưa hết hạn chờ 5p để gửi lại otp");
            }
        }

        OtpScheduleObj otpScheduleObj = OtpScheduleObj.builder()
                .email(getting.getEmail())
                .otp(calcService.getRandomActiveCode(6L))
                .type(OtpType.SUPPLIER_MAIL_SIGN_KEY)
                .build();
        GlobalCache.OTP_SCHEDULE_OBJS.add(otpScheduleObj);

        HashMap<String, Object> params = new HashMap<>();

        params.put("userName", donMuaHang.getNhaCungCap().getTenNhaCungCap());
        params.put("otp", otpScheduleObj.getOtp());

        emailService.sendHtmlEmailFromTemplate(getting.getEmail(), "Truy cập phiếu chi tiết", "supplier_otp.html", params);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Success")
                        .message("Success")
                        .error(null)
                        .build()
        );
    }

    @Transactional
    public ResponseEntity<ResponseData<DonMuaHangDto>> confirmOtpForSupplier(OtpDonMuaHangConfirming confirming) {
        for (OtpScheduleObj otpScheduleObj : GlobalCache.OTP_SCHEDULE_OBJS) {
            if (otpScheduleObj.getEmail().equals(confirming.getEmail()) && otpScheduleObj.getOtp().equals(confirming.getOtp())) {
                DonMuaHang donMuaHang = getOne(confirming.getDonMuaHangId()).orElseThrow(
                        () -> new CommonException("Không tìm thấy đơn mua hàng id: " + confirming.getDonMuaHangId())
                );
                if (!donMuaHang.getNhaCungCap().getEmail().equals(confirming.getEmail())) {
                    throw new CommonException("Đơn mua hàng không hợp lệ");
                }
                return ResponseEntity.ok(
                        ResponseData.<DonMuaHangDto>builder()
                                .status(HttpStatus.OK.value())
                                .data(donMuaHangMapper.toDto(donMuaHang))
                                .message("Success")
                                .error(null)
                                .build()
                );
            }
        }
        throw new CommonException("Otp hoặc email nhà cung cấp không hợp lệ");
    }

    @Transactional
    public ResponseEntity<ResponseData<String>> baoGiaDonMuaHang(DonMuaHangBaoGia baoGia) {
        DonMuaHang donMuaHang = getOne(baoGia.getId()).orElseThrow(
                () -> new CommonException("Không tìm thấy đơn mua hàng id: " + baoGia.getId())
        );
        if (donMuaHang.getChiTietDonMuaHangs().size() != baoGia.getChiTietDonMuaHangBaoGias().size()) {
            throw new CommonException("Đơn báo giá không hợp lệ");
        }

        int l = donMuaHang.getChiTietDonMuaHangs().size();
        List<ChiTietDonMuaHang> chiTietDonMuaHangs = donMuaHang.getChiTietDonMuaHangs();
        List<ChiTietDonMuaHangBaoGia> chiTietDonMuaHangBaoGias = baoGia.getChiTietDonMuaHangBaoGias();
// Tính toán tổng tiền để so sánh
        BigDecimal tongTienTinhToan = BigDecimal.ZERO;
        for (int i = 0; i < l; i++) {
            chiTietDonMuaHangs.get(i).setDonGia(chiTietDonMuaHangBaoGias.get(i).getDonGia());
            // so sánh thành tiền
            BigDecimal thanhTienTinToan = chiTietDonMuaHangs.get(i).getSoLuongDat().multiply(chiTietDonMuaHangs.get(i).getDonGia());

            if (thanhTienTinToan.compareTo(chiTietDonMuaHangs.get(i).getThanhTien()) != 0) {
                throw new CommonException("Thành tiền tại mặt hàng có lỗi tên :" + chiTietDonMuaHangs.get(i).getBienTheSanPham().getSanPham().getTenSanPham());
            }
            chiTietDonMuaHangs.get(i).setThanhTien(thanhTienTinToan);
            chiTietDonMuaHangService.update(chiTietDonMuaHangs.get(i).getId(), chiTietDonMuaHangs.get(i));
            tongTienTinhToan = tongTienTinhToan.add(thanhTienTinToan);
        }

        if(tongTienTinhToan.compareTo(donMuaHang.getTongTien()) != 0){
            throw new CommonException("Tổng tìn tính toán sai");
        }
        donMuaHang.setTrangThai(4);
        update(donMuaHang.getId(), donMuaHang);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Success")
                        .message("Success")
                        .error(null)
                        .build()
        );

    }

//    @AllArgsConstructor
//    @NoArgsConstructor
//    @Getter
//    @Setter
//    @Builder
//    @FieldDefaults(level = AccessLevel.PRIVATE)
//    private static class ChiTietDonMuaHangMail {
//        Integer stt;
//        String tenBienThe;
//        BigDecimal soLuong;
//        BigDecimal donGia;
//        String ghiChu;
//    }
}
