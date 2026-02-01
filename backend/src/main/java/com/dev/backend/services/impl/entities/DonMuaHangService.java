package com.dev.backend.services.impl.entities;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.dto.request.ChiTietDonMuaHangCreating;
import com.dev.backend.dto.request.DonMuaHangCreating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.DonMuaHangDto;
import com.dev.backend.dto.response.entities.NguoiDungAuthInfo;
import com.dev.backend.entities.*;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.DonMuaHangMapper;
import com.dev.backend.repository.DonMuaHangRepository;
import com.dev.backend.services.EmailService;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import lombok.*;
import lombok.experimental.FieldDefaults;
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
                .tongTien(creating.getTongTien())
                .ghiChu(creating.getGhiChu())
                .nguoiTao(nguoiTao)
                .nguoiDuyet(nguoiTao.getVaiTro().equals(IRoleType.quan_tri_vien) ? nguoiTao : null)
                .build();

        donMuaHang = create(donMuaHang);

        BigDecimal tongTien = BigDecimal.ZERO;

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
                    .thanhTien(ctdmhCreating.getThanhTien())
                    .ghiChu(ctdmhCreating.getGhiChu())
                    .build();
            chiTietDonMuaHang = chiTietDonMuaHangService.create(chiTietDonMuaHang);
            tongTien = tongTien.add(chiTietDonMuaHang.getThanhTien());
        }
        donMuaHang.setTongTien(tongTien);
        donMuaHang = update(donMuaHang.getId(), donMuaHang);

        int stt = 0;
        BigDecimal tongSoLuong = BigDecimal.ZERO;
        List<ChiTietDonMuaHangMail> chiTietDonMuaHangs = new ArrayList<>();
        for (ChiTietDonMuaHang chiTietDonMuaHang : donMuaHang.getChiTietDonMuaHangs()) {
            String tenBienThe = chiTietDonMuaHang.getBienTheSanPham().getSanPham().getTenSanPham() +
                    " " + chiTietDonMuaHang.getBienTheSanPham().getChatLieu().getTenChatLieu() +
                    " " + chiTietDonMuaHang.getBienTheSanPham().getMauSac().getTenMau() +
                    " " + chiTietDonMuaHang.getBienTheSanPham().getSize().getMaSize();
            chiTietDonMuaHangs.add(
                    ChiTietDonMuaHangMail.builder()
                            .stt(++stt)
                            .tenBienThe(tenBienThe)
                            .soLuong(chiTietDonMuaHang.getSoLuongDaNhan())
                            .donGia(chiTietDonMuaHang.getDonGia())
                            .ghiChu(chiTietDonMuaHang.getGhiChu())
                            .build()
            );

            tongSoLuong = tongSoLuong.add(chiTietDonMuaHang.getSoLuongDaNhan());
        }

        if (donMuaHang.getTrangThai() == 3) {
            Date now = new Date();
            HashMap<String, Object> params = new HashMap<>();
            params.put("ngay", now.getDate());
            params.put("thang", now.getMonth() + 1);
            params.put("nam", now.getYear() + 1900);
            params.put("soDonMua", donMuaHang.getSoDonMua());

            String trangThaiText = "";
            if (donMuaHang.getTrangThai() == 3) {
                trangThaiText = "Quản lý đã duyệt và gửi mail";
            }
            params.put("trangThaiText", trangThaiText);
            params.put("nguoiDuyet", donMuaHang.getNguoiDuyet().getHoTen());
            params.put("khoNhap", donMuaHang.getKhoNhap().getTenKho());
            params.put("diaChiKho", donMuaHang.getKhoNhap().getDiaChi());
            params.put("tenNhaCungCap", donMuaHang.getNhaCungCap().getTenNhaCungCap());
            params.put("maNhaCungCap", donMuaHang.getNhaCungCap().getMaNhaCungCap());
            params.put("email", donMuaHang.getNhaCungCap().getEmail());
            params.put("diaChiNCC", donMuaHang.getNhaCungCap().getDiaChi());
            params.put("chiTietDonMuaHangs", chiTietDonMuaHangs);
            params.put("tongSoMatHang", stt);
            params.put("tongSoLuong", tongSoLuong);
            params.put("tongTien", donMuaHang.getTongTien());
            params.put("ghiChu", donMuaHang.getGhiChu());
            params.put("ngayDatHang", donMuaHang.getNgayDatHang());
            params.put("ngayGiaoDuKien", donMuaHang.getNgayGiaoDuKien());
            params.put("hanPheDuyet", donMuaHang.getNgayGiaoDuKien());
            params.put("nguoiDuyet", donMuaHang.getNguoiDuyet().getHoTen());
            params.put("nguoiTao", donMuaHang.getNguoiTao().getHoTen());

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

    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    private static class ChiTietDonMuaHangMail {
        Integer stt;
        String tenBienThe;
        BigDecimal soLuong;
        BigDecimal donGia;
        String ghiChu;
    }
}
