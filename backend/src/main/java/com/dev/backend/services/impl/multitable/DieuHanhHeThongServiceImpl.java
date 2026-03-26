package com.dev.backend.services.impl.multitable;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.constant.variables.IHanhDong;
import com.dev.backend.constant.variables.ITable;
import com.dev.backend.dto.request.ChiTietQuyenKhoCreating;
import com.dev.backend.dto.request.PhanQuyenNguoiDungKhoCreating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.NguoiDungAuthInfo;
import com.dev.backend.entities.*;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.ChiTietQuyenKhoMapper;
import com.dev.backend.mapper.NguoiDungMapper;
import com.dev.backend.mapper.PhanQuyenNguoiDungKhoMapper;
import com.dev.backend.services.impl.entities.*;
import com.dev.backend.services.multitable.DieuHanhHeThongService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@Slf4j
public class DieuHanhHeThongServiceImpl implements DieuHanhHeThongService {

    @Autowired
    private KhoService khoService;
    @Autowired
    private NguoiDungService nguoiDungService;
    @Autowired
    private QuyenHanService quyenHanService;
    @Autowired
    private PhanQuyenNguoiDungKhoService phanQuyenNguoiDungKhoService;
    @Autowired
    private ChiTietQuyenKhoService chiTietQuyenKhoService;

    @Autowired
    private LichSuThayDoiService lichSuThayDoiService;

    @Autowired
    private NguoiDungMapper nguoiDungMapper;
    @Autowired
    private ChiTietQuyenKhoMapper chiTietQuyenKhoMapper;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    @Transactional
    public ResponseEntity<ResponseData<String>> ganQuyenNhanVienKho(PhanQuyenNguoiDungKhoCreating pqndkCreating) {

        // lấy thông tin người dùng
        NguoiDungAuthInfo contextUser = SecurityContextHolder.getUser();

        // từ contextUser lấy ra ID của user của ADMIN
        Optional<NguoiDung> findingCurrentUser = nguoiDungService.getOne(contextUser.getId());

        if (findingCurrentUser.isEmpty()) {
            throw new CommonException("Context không được khởi tạo hoặc đã bị xoá");
        }

        // lấy ra id user cần gán quyền
        Optional<NguoiDung> findingNguoiDung = nguoiDungService.getOne(pqndkCreating.getNguoiDungId());
        if (findingNguoiDung.isEmpty()) {
            throw new CommonException("Không tìm thấy người dùng id: " + pqndkCreating.getNguoiDungId());
        }

        NguoiDung nguoiDung = findingNguoiDung.get();

        String giaTriCuJson;

        try {
            giaTriCuJson = objectMapper.writeValueAsString(nguoiDungMapper.toDto(nguoiDung));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            giaTriCuJson = "error when parse";
        }

        // lấy id kho. Xem admin đang muốn gán kho nào
        Optional<Kho> findingKho = khoService.getOne(pqndkCreating.getKhoId());
        if (findingKho.isEmpty()) {
            throw new CommonException("Không tìm thấy kho id: " + pqndkCreating.getKhoId());
        }
        boolean firstTimeInWorkSpace = true;
        PhanQuyenNguoiDungKho phanQuyenNguoiDungKho = new PhanQuyenNguoiDungKho();

        // Kiểm tra xem nhân viên đã từng có bản ghi tại kho này chưa
        Optional<PhanQuyenNguoiDungKho> findingPQNDK = phanQuyenNguoiDungKhoService
                .findByNguoiDungIdAndKhoId(pqndkCreating.getNguoiDungId(), pqndkCreating.getKhoId());

        // Nếu có rồi thì lấy ra để cập nhật
        if (findingPQNDK.isPresent()) {
            phanQuyenNguoiDungKho = findingPQNDK.get();
            firstTimeInWorkSpace = false;
        }

        // Cập nhật các thông tin cơ bản về vai trò trong kho
        phanQuyenNguoiDungKho.setLaQuanLyKho(pqndkCreating.getLaQuanLyKho());
        phanQuyenNguoiDungKho.setTrangThai(1);
        phanQuyenNguoiDungKho.setNgayBatDau(pqndkCreating.getNgayBatDau());
        phanQuyenNguoiDungKho.setNgayKetThuc(pqndkCreating.getNgayKetThuc());
        phanQuyenNguoiDungKho.setNguoiCapQuyen(findingCurrentUser.get());
        phanQuyenNguoiDungKho.setGhiChu(pqndkCreating.getGhiChu());

        // Nếu lần đầu vào kho: set thêm liên kết User và Kho rồi Create mới
        if (firstTimeInWorkSpace) {
            phanQuyenNguoiDungKho.setNguoiDung(findingNguoiDung.get());
            phanQuyenNguoiDungKho.setKho(findingKho.get());
            phanQuyenNguoiDungKho = phanQuyenNguoiDungKhoService.create(phanQuyenNguoiDungKho);
        } else {
            phanQuyenNguoiDungKhoService.update(phanQuyenNguoiDungKho.getId(), phanQuyenNguoiDungKho);
        }

        Instant now = Instant.now();
        // 5. XỬ LÝ CHI TIẾT TỪNG QUYỀN HẠN (Vòng lặp danh sách quyền từ Request)
        for (ChiTietQuyenKhoCreating chiTietQuyenKhoCreating : pqndkCreating.getChiTietQuyenKhos()) {
            Optional<QuyenHan> findingQuyenHan = quyenHanService.getOne(chiTietQuyenKhoCreating.getQuyenHanId());
            if (findingQuyenHan.isEmpty()) {
                continue;
            }
            ChiTietQuyenKho chiTietQuyenKho = null;

            // Trường hợp nhân viên mới: Tạo mới tất cả các chi tiết quyền
            if (firstTimeInWorkSpace) {
                chiTietQuyenKho = new ChiTietQuyenKho();
                chiTietQuyenKho.setQuyenHan(findingQuyenHan.get());
                chiTietQuyenKho.setTrangThai(chiTietQuyenKhoCreating.getTrangThai());
                chiTietQuyenKho.setNgayCap(pqndkCreating.getNgayBatDau());
                chiTietQuyenKho.setPhanQuyenNguoiDungKho(phanQuyenNguoiDungKho);
                chiTietQuyenKhoService.create(chiTietQuyenKho);
            } else {
                // Trường hợp nhân viên cũ: Kiểm tra từng quyền cụ thể đã có chưa
                boolean firstTimeHasPermissionInWorkSpace = true;

                String gtCuJson = "";
                String gtMoiJson = "";

                Optional<ChiTietQuyenKho> findingChiTietQuyenKho = chiTietQuyenKhoService
                        .findByPhanQuyenNguoiDungKhoIdAndQuyenHanId(
                                phanQuyenNguoiDungKho.getId(),
                                chiTietQuyenKhoCreating.getQuyenHanId());
                if (findingChiTietQuyenKho.isPresent()) {
                    chiTietQuyenKho = findingChiTietQuyenKho.get();
                    firstTimeHasPermissionInWorkSpace = false;
                }
                // Quyền này mới hoàn toàn với nhân viên này: Create
                if (firstTimeHasPermissionInWorkSpace) {
                    chiTietQuyenKho = new ChiTietQuyenKho();
                    chiTietQuyenKho.setQuyenHan(findingQuyenHan.get());
                    chiTietQuyenKho.setTrangThai(chiTietQuyenKhoCreating.getTrangThai());
                    chiTietQuyenKho.setNgayCap(pqndkCreating.getNgayBatDau());
                    chiTietQuyenKho.setPhanQuyenNguoiDungKho(phanQuyenNguoiDungKho);
                    chiTietQuyenKho = chiTietQuyenKhoService.create(chiTietQuyenKho);
                } else {
                    // Quyền này đã từng có: Lưu lại JSON cũ và Update trạng thái mới
                    try {
                        gtCuJson = objectMapper.writeValueAsString(chiTietQuyenKhoMapper.toDto(chiTietQuyenKho));
                    } catch (JsonProcessingException e) {
                        e.printStackTrace();
                        gtCuJson = "error when parse";
                    }
                    chiTietQuyenKho.setTrangThai(chiTietQuyenKhoCreating.getTrangThai());
                    chiTietQuyenKho.setNgayCap(pqndkCreating.getNgayBatDau());
                    chiTietQuyenKho = chiTietQuyenKhoService.update(chiTietQuyenKho.getId(), chiTietQuyenKho);

                }
                try {
                    gtMoiJson = objectMapper.writeValueAsString(chiTietQuyenKhoMapper.toDto(chiTietQuyenKho));
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                    gtMoiJson = "error when parse";
                }
                // CẬP NHẬT THAY ĐỔI QUYỀN VÀO DB
                String hanhDong = firstTimeHasPermissionInWorkSpace ? IHanhDong.cap_quyen : IHanhDong.cap_nhat_quyen;
                lichSuThayDoiService.create(
                        LichSuThayDoi.builder()
                                .loaiThamChieu(ITable.nguoi_dung)
                                .idThamChieu(nguoiDung.getId())
                                .kho(findingKho.get())
                                .hanhDong(hanhDong)
                                .giaTriCu(gtCuJson)
                                .giaTriMoi(gtMoiJson)
                                .nguoiThucHien(findingCurrentUser.get())
                                .ngayThucHien(now)
                                .ghiChu("Thực hiện " + hanhDong + " cho " + ITable.nguoi_dung + " id: " + nguoiDung.getId())
                                .build()
                );
            }

        }


        String giaTriMoiJson;

        nguoiDung = nguoiDungService.update(nguoiDung.getId(), nguoiDung);

        try {
            giaTriMoiJson = objectMapper.writeValueAsString(nguoiDungMapper.toDto(nguoiDung));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            giaTriMoiJson = "error when parse";
        }
        // Tạo log cuối cùng xác nhận việc "Nâng cấp chức vụ" thành công
        lichSuThayDoiService.create(
                LichSuThayDoi.builder()
                        .loaiThamChieu(ITable.nguoi_dung)
                        .idThamChieu(nguoiDung.getId())
                        .kho(findingKho.get())
                        .hanhDong(IHanhDong.nang_cap_chuc_vu)
                        .giaTriCu(giaTriCuJson)
                        .giaTriMoi(giaTriMoiJson)
                        .nguoiThucHien(findingCurrentUser.get())
                        .ngayThucHien(now)
                        .ghiChu("Thực hiện " + IHanhDong.nang_cap_chuc_vu + " cho " + ITable.nguoi_dung + " id: " + nguoiDung.getId())
                        .build()
        );
        // Trả về kết quả thành công cho Client
        return ResponseEntity.ok(
                ResponseData.<String>builder().message("Success").build()
        );
    }


}
