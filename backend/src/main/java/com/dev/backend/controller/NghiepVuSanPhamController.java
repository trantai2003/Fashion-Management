package com.dev.backend.controller;


import com.dev.backend.constant.variables.IPermissionType;
import com.dev.backend.constant.variables.IRoleType;
import com.dev.backend.customizeanotation.RequireAuth;
import com.dev.backend.dto.request.*;
import com.dev.backend.dto.response.GiaoDichDto;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.DonMuaHangDto;
import com.dev.backend.entities.ChiTietDonMuaHang;
import com.dev.backend.entities.DonMuaHang;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.services.EmailService;
import com.dev.backend.services.impl.entities.DonMuaHangService;
import com.dev.backend.services.impl.entities.PhieuXuatKhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Date;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/nghiep-vu")
public class NghiepVuSanPhamController {

    @Autowired
    private DonMuaHangService donMuaHangService;

    @Autowired
    private PhieuXuatKhoService phieuXuatKhoService;

    @Autowired
    private EmailService emailService;

//    @GetMapping("/danh-sach-yeu-cau-tao-don-mua-hang")
//    @RequireAuth(
//            roles = {
//                    IRoleType.quan_tri_vien,
//                    IRoleType.quan_ly_kho
//            }
//    )
//    public ResponseEntity<ResponseData<List<ApplicationRequestObj>>> danhSachYeuCauDonMuaHang() {
//        return ResponseEntity.ok(
//                ResponseData.<List<ApplicationRequestObj>>builder()
//                        .status(HttpStatus.OK.value())
//                        .message("Success")
//                        .data(GlobalCache.APPLICATION_REQUEST_OBJS.stream().toList())
//                        .error(null)
//                        .build()
//        );
//    }

    //Nhân viên mua hàng tạo yêu cầu đơn mua hàng và chờ xét duyệt
//    @PostMapping("/tao-yeu-cau-tao-don-mua-hang")
//    @RequireAuth(
//            roles = {
//                    IRoleType.nhan_vien_mua_hang
//            }
//    )
//    public ResponseEntity<ResponseData<String>> taoYeuCauDonMuaHang(@RequestBody ApplicationRequestObj applicationRequestObj) {
//        for (ApplicationRequestObj appReq : GlobalCache.APPLICATION_REQUEST_OBJS) {
//            if (appReq.getNguoiDungId().equals(applicationRequestObj.getNguoiDungId())) {
//                throw new CommonException("Yêu cầu tạo đơn mua hàng đã được gửi xin chờ admin duyệt");
//            }
//        }
//        applicationRequestObj.setTrangThai(1);
//        applicationRequestObj.setTaoLuc(Instant.now());
//        applicationRequestObj.setNguoiDungId(SecurityContextHolder.getUser().getId());
//        GlobalCache.APPLICATION_REQUEST_OBJS.add(applicationRequestObj);
//        return ResponseEntity.ok(
//                ResponseData.<String>builder()
//                        .status(HttpStatus.OK.value())
//                        .data("Success")
//                        .message("Success")
//                        .error(null)
//                        .build()
//        );
//    }

//    @GetMapping("/duyet-yeu-cau-tao-don-mua-hang/{id}/{status}")
//    @RequireAuth(
//            roles = {
//                    IRoleType.quan_tri_vien,
//                    IRoleType.quan_ly_kho
//            }
//    )
//    public ResponseEntity<ResponseData<String>> duyetYeuCauDonMuaHang(@PathVariable Integer id, @PathVariable Integer status) {
//        NguoiDungAuthInfo authInfo = SecurityContextHolder.getUser();
//        boolean hasApp = false;
//        for (ApplicationRequestObj appReq : GlobalCache.APPLICATION_REQUEST_OBJS) {
//            if (id.equals(appReq.getNguoiDungId())) {
//                boolean accept = false;
//                if (authInfo.getVaiTro().contains(IRoleType.quan_tri_vien)) accept = true;
//                else {
//                    for (PhanQuyenNguoiDungKhoDto pqndk : authInfo.getPhanQuyenNguoiDungKhos()) {
//                        if (pqndk.getKho().getId().equals(appReq.getKhoId())) {
//                            accept = true;
//                            break;
//                        }
//                    }
//                }
//                if (accept) {
//                    appReq.setTrangThai(status.equals(2) ? 2 : 0);
//                } else {
//                    throw new CommonException("Bạn không có quyền hạn xác nhận yêu cầu này");
//                }
//                hasApp = true;
//            }
//        }
//        if (hasApp) {
//            return ResponseEntity.ok(
//                    ResponseData.<String>builder()
//                            .status(HttpStatus.OK.value())
//                            .data("Success")
//                            .message("Success")
//                            .error(null)
//                            .build()
//            );
//        }
//        throw new CommonException("Yêu cầu này không tồn tại id: " + id);
//    }


//    @GetMapping("/yeu-cau-tao-don-cua-toi")
//    @RequireAuth()
//    public ResponseEntity<ResponseData<ApplicationRequestObj>> danhSachDonYeuCau() {
//        List<ApplicationRequestObj> dsach = new ArrayList<>();
//        NguoiDungAuthInfo authInfo = SecurityContextHolder.getUser();
//        for (ApplicationRequestObj appReq : GlobalCache.APPLICATION_REQUEST_OBJS) {
//            if (authInfo.getId().equals(appReq.getNguoiDungId())) {
//                return ResponseEntity.ok(
//                        ResponseData.<ApplicationRequestObj>builder()
//                                .status(HttpStatus.OK.value())
//                                .data(appReq)
//                                .message("Success")
//                                .error(null)
//                                .build()
//                );
//            }
//        }
//        return ResponseEntity.ok(
//                ResponseData.<ApplicationRequestObj>builder()
//                        .status(HttpStatus.OK.value())
//                        .data(null)
//                        .message("Success")
//                        .error(null)
//                        .build()
//        );
//
//    }

    @PostMapping("/don-mua-hang/create")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.nhan_vien_ban_hang,
                    IRoleType.nhan_vien_mua_hang,
                    IRoleType.nhan_vien_kho

            },
            permissions = {
                    IPermissionType.tao_don_mua_hang
            },
            inWarehouse = true,
            rolesLogic = RequireAuth.LogicType.OR,
            permissionsLogic = RequireAuth.LogicType.AND
    )
    public ResponseEntity<ResponseData<DonMuaHangDto>> create(@RequestBody DonMuaHangCreating creating) {
        return donMuaHangService.create(creating);
    }


    @PutMapping("/don-mua-hang/duyet-don/{id}/{trangThai}")
    @RequireAuth(
            roles = {
                    IRoleType.quan_tri_vien,
                    IRoleType.quan_ly_kho,
                    IRoleType.nhan_vien_mua_hang
            }
    )
    public ResponseEntity<ResponseData<String>> duyetDon(@PathVariable Integer id, @PathVariable Integer trangThai) {

        DonMuaHang donMuaHang = donMuaHangService.getOne(id).orElseThrow(
                () -> new CommonException("Không tìm thấy đơn mua hàng id: " + id)
        );
        if (trangThai == 5) {
            Date now = new Date();
            HashMap<String, Object> params = new HashMap<>();
            params.put("ngay", now.getDate());
            params.put("thang", now.getMonth() + 1);
            params.put("year", now.getYear() + 1900);
            params.put("soDonHang", donMuaHang.getSoDonMua());
            params.put("tenNhaCungCap", donMuaHang.getNhaCungCap().getTenNhaCungCap());
            params.put("ngayGui", now);
            params.put("nguoiPhuTrach", donMuaHang.getNguoiTao().getHoTen());
            params.put("ngayDatHang", donMuaHang.getNgayDatHang());
            params.put("lyDoHuy", "Cần chỉnh sửa thông tin");
            emailService.sendHtmlEmailFromTemplate(
                    donMuaHang.getNhaCungCap().getEmail(),
                    "Phiếu huỷ hàng",
                    "don_huy_mua.html",
                    params
            );
        }

        donMuaHang.setTrangThai(trangThai);
        donMuaHangService.update(donMuaHang.getId(), donMuaHang);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Success")
                        .message("Success")
                        .error(null)
                        .build()
        );
    }

    @PutMapping("/don-mua-hang/gui-yeu-cau-bao-gia")
    @RequireAuth(
            roles = {
                    IRoleType.nhan_vien_mua_hang
            }
    )
    public ResponseEntity<ResponseData<String>> guiYeuCauBaoGia(@RequestBody YeuCauBaoGiaCreating yeuCau) {
        return donMuaHangService.guiYeuCauBaoGia(yeuCau);
    }

    @PostMapping("/don-mua-hang/lay-otp")
    public ResponseEntity<ResponseData<String>> layOtpDonMuaHang(@RequestBody OtpDonMuaHangGetting getting) {
        return donMuaHangService.getOtpForSupplier(getting);
    }

    @PostMapping("/don-mua-hang/xac-nhan-otp")
    public ResponseEntity<ResponseData<DonMuaHangDto>> xacNhanOtpDonMuaHang(@RequestBody OtpDonMuaHangConfirming confirming) {
        return donMuaHangService.confirmOtpForSupplier(confirming);
    }

    @PostMapping("/don-mua-hang/bao-gia")
    public ResponseEntity<ResponseData<String>> baoGiaDonMuaHang(@RequestBody DonMuaHangBaoGia baoGia) {
        return donMuaHangService.baoGiaDonMuaHang(baoGia);
    }

    @GetMapping("/don-mua-hang/thanh-toan/{id}")
    public ResponseEntity<ResponseData<GiaoDichDto>> layGiaoDich(@PathVariable Integer id) {
        return donMuaHangService.layGiaoDich(id);
    }

    @GetMapping("/don-mua-hang/kiem-tra-thanh-toan/id")
    public ResponseEntity<ResponseData<String>> kiemTraThanhToan(@RequestParam Integer id) {
        return donMuaHangService.kiemTraThanhToan(id);
    }

}
