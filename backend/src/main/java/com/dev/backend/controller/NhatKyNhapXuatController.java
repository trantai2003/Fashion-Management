package com.dev.backend.controller;

import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.response.NhatKyNhapXuatDTO;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.repository.NhatKyNhapXuatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/dashboard/bao-cao/nhat-ky-nhap-xuat")
public class NhatKyNhapXuatController {

    @Autowired
    private NhatKyNhapXuatRepository nhatKyNhapXuatRepository;

    /**
     * GET /api/v1/admin/dashboard/bao-cao/nhat-ky-nhap-xuat
     *
     * @param loai           ngay | tuan | thang | nam | so_sanh | chi_tiet | theo_kho
     * @param tuNgay         yyyy-MM-dd  (bắt buộc khi loai = ngay | chi_tiet | theo_kho)
     * @param denNgay        yyyy-MM-dd  (bắt buộc khi loai = ngay | chi_tiet | theo_kho)
     * @param nam            (bắt buộc khi loai = tuan | thang | so_sanh)
     * @param thang          (bắt buộc khi loai = so_sanh)
     * @param tuNam          (bắt buộc khi loai = nam)
     * @param denNam         (bắt buộc khi loai = nam)
     * @param khoId          null = tất cả kho
     * @param loaiGiaoDich   null = tất cả | nhap_kho | xuat_kho | chuyen_kho | dieu_chinh
     * @param bienTheSanPhamId  null = tất cả SKU (chỉ dùng khi loai = chi_tiet)
     */
    @GetMapping
    @RequireAuth(roles = {IRoleType.quan_tri_vien, IRoleType.quan_ly_kho})
    public ResponseEntity<ResponseData<List<NhatKyNhapXuatDTO>>> getBaoCaoNhatKy(
            @RequestParam                   String  loai,
            @RequestParam(required = false) String  tuNgay,
            @RequestParam(required = false) String  denNgay,
            @RequestParam(required = false) Integer nam,
            @RequestParam(required = false) Integer thang,
            @RequestParam(required = false) Integer tuNam,
            @RequestParam(required = false) Integer denNam,
            @RequestParam(required = false) Integer khoId,
            @RequestParam(required = false) String  loaiGiaoDich,
            @RequestParam(required = false) Integer bienTheSanPhamId
    ) {
        List<NhatKyNhapXuatDTO> data = switch (loai) {

            case "ngay" -> {
                if (tuNgay == null || denNgay == null)
                    throw new IllegalArgumentException("loai=ngay yêu cầu tuNgay và denNgay (yyyy-MM-dd)");
                yield nhatKyNhapXuatRepository.baoCaoTheoNgay(
                        LocalDate.parse(tuNgay), LocalDate.parse(denNgay),
                        khoId, loaiGiaoDich);
            }

            case "tuan" -> {
                if (nam == null)
                    throw new IllegalArgumentException("loai=tuan yêu cầu nam");
                yield nhatKyNhapXuatRepository.baoCaoTheoTuan(nam, khoId, loaiGiaoDich);
            }

            case "thang" -> {
                if (nam == null)
                    throw new IllegalArgumentException("loai=thang yêu cầu nam");
                yield nhatKyNhapXuatRepository.baoCaoTheoThang(nam, khoId, loaiGiaoDich);
            }

            case "nam" -> {
                if (tuNam == null || denNam == null)
                    throw new IllegalArgumentException("loai=nam yêu cầu tuNam và denNam");
                yield nhatKyNhapXuatRepository.baoCaoTheoNam(tuNam, denNam, khoId, loaiGiaoDich);
            }

            case "so_sanh" -> {
                if (nam == null || thang == null)
                    throw new IllegalArgumentException("loai=so_sanh yêu cầu nam và thang");
                int thangTruoc = (thang == 1) ? 12 : thang - 1;
                int namTruoc   = (thang == 1) ? nam - 1 : nam;
                yield nhatKyNhapXuatRepository.soSanhCungKy(
                        nam, thang, namTruoc, thangTruoc, khoId, loaiGiaoDich);
            }

            case "chi_tiet" -> {
                if (tuNgay == null || denNgay == null)
                    throw new IllegalArgumentException("loai=chi_tiet yêu cầu tuNgay và denNgay");
                yield nhatKyNhapXuatRepository.chiTietGiaoDich(
                        LocalDate.parse(tuNgay), LocalDate.parse(denNgay),
                        khoId, loaiGiaoDich, bienTheSanPhamId);
            }

            case "theo_kho" -> {
                if (tuNgay == null || denNgay == null)
                    throw new IllegalArgumentException("loai=theo_kho yêu cầu tuNgay và denNgay");
                yield nhatKyNhapXuatRepository.tongHopTheoKho(
                        LocalDate.parse(tuNgay), LocalDate.parse(denNgay), loaiGiaoDich);
            }

            default -> throw new IllegalArgumentException(
                    "loai không hợp lệ. Chọn: ngay | tuan | thang | nam | so_sanh | chi_tiet | theo_kho");
        };

        ResponseEntity<ResponseData<List<NhatKyNhapXuatDTO>>> ok = ResponseEntity.ok(
                ResponseData.<List<NhatKyNhapXuatDTO>>builder()
                        .status(HttpStatus.OK.value())
                        .message("Lấy báo cáo nhật ký nhập xuất thành công")
                        .data(data)
                        .build()
        );
        return ok;
    }
}