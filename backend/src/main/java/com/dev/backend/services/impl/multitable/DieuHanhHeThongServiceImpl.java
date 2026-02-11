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

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public ResponseEntity<ResponseData<String>> ganQuyenNhanVienKho(PhanQuyenNguoiDungKhoCreating pqndkCreating) {

        NguoiDungAuthInfo contextUser = SecurityContextHolder.getUser();

        Optional<NguoiDung> findingCurrentUser = nguoiDungService.getOne(contextUser.getId());

        if (findingCurrentUser.isEmpty()) {
            throw new CommonException("Context không được khởi tạo hoặc đã bị xoá");
        }

        Optional<NguoiDung> findingNguoiDung = nguoiDungService.getOne(pqndkCreating.getNguoiDungId());
        if (findingNguoiDung.isEmpty()) {
            throw new CommonException("Không tìm thấy người dùng id: " + pqndkCreating.getNguoiDungId());
        }

        NguoiDung nguoiDung = findingNguoiDung.get();

        String giaTriCuJson;

        try {
            giaTriCuJson = objectMapper.writeValueAsString(nguoiDung);
        } catch (JsonProcessingException e) {
            giaTriCuJson = "error when parse";
        }

        Optional<Kho> findingKho = khoService.getOne(pqndkCreating.getKhoId());
        if (findingKho.isEmpty()) {
            throw new CommonException("Không tìm thấy kho id: " + pqndkCreating.getKhoId());
        }
        boolean firstTimeInWorkSpace = true;
        PhanQuyenNguoiDungKho phanQuyenNguoiDungKho = new PhanQuyenNguoiDungKho();
        Optional<PhanQuyenNguoiDungKho> findingPQNDK = phanQuyenNguoiDungKhoService
                .findByNguoiDungIdAndKhoId(pqndkCreating.getNguoiDungId(), pqndkCreating.getKhoId());
        if (findingPQNDK.isPresent()) {
            phanQuyenNguoiDungKho = findingPQNDK.get();
            firstTimeInWorkSpace = false;
        }


        phanQuyenNguoiDungKho.setLaQuanLyKho(pqndkCreating.getLaQuanLyKho());
        phanQuyenNguoiDungKho.setTrangThai(1);
        phanQuyenNguoiDungKho.setNgayBatDau(pqndkCreating.getNgayBatDau());
        phanQuyenNguoiDungKho.setNgayKetThuc(pqndkCreating.getNgayKetThuc());
        phanQuyenNguoiDungKho.setNguoiCapQuyen(findingCurrentUser.get());
        phanQuyenNguoiDungKho.setGhiChu(pqndkCreating.getGhiChu());

        if (firstTimeInWorkSpace) {
            phanQuyenNguoiDungKho.setNguoiDung(findingNguoiDung.get());
            phanQuyenNguoiDungKho.setKho(findingKho.get());
            phanQuyenNguoiDungKho = phanQuyenNguoiDungKhoService.create(phanQuyenNguoiDungKho);
        } else {
            phanQuyenNguoiDungKhoService.update(phanQuyenNguoiDungKho.getId(), phanQuyenNguoiDungKho);
        }

        Instant now = Instant.now();

        for (ChiTietQuyenKhoCreating chiTietQuyenKhoCreating : pqndkCreating.getChiTietQuyenKhos()) {
            Optional<QuyenHan> findingQuyenHan = quyenHanService.getOne(chiTietQuyenKhoCreating.getQuyenHanId());
            if (findingQuyenHan.isEmpty()) {
                continue;
            }
            ChiTietQuyenKho chiTietQuyenKho = null;

            if (firstTimeInWorkSpace) {
                chiTietQuyenKho = new ChiTietQuyenKho();
                chiTietQuyenKho.setQuyenHan(findingQuyenHan.get());
                chiTietQuyenKho.setTrangThai(chiTietQuyenKhoCreating.getTrangThai());
                chiTietQuyenKho.setNgayCap(pqndkCreating.getNgayBatDau());
                chiTietQuyenKho.setPhanQuyenNguoiDungKho(phanQuyenNguoiDungKho);
                chiTietQuyenKhoService.create(chiTietQuyenKho);
            } else {
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
                if (firstTimeHasPermissionInWorkSpace) {
                    chiTietQuyenKho = new ChiTietQuyenKho();
                    chiTietQuyenKho.setQuyenHan(findingQuyenHan.get());
                    chiTietQuyenKho.setTrangThai(chiTietQuyenKhoCreating.getTrangThai());
                    chiTietQuyenKho.setNgayCap(pqndkCreating.getNgayBatDau());
                    chiTietQuyenKho.setPhanQuyenNguoiDungKho(phanQuyenNguoiDungKho);
                    chiTietQuyenKho = chiTietQuyenKhoService.create(chiTietQuyenKho);
                } else {
                    try {
                        gtCuJson = objectMapper.writeValueAsString(chiTietQuyenKho);
                    } catch (JsonProcessingException e) {
                        gtCuJson = "error when parse";
                    }
                    chiTietQuyenKho.setTrangThai(chiTietQuyenKhoCreating.getTrangThai());
                    chiTietQuyenKho.setNgayCap(pqndkCreating.getNgayBatDau());
                    chiTietQuyenKho = chiTietQuyenKhoService.update(chiTietQuyenKho.getId(), chiTietQuyenKho);

                }
                try {
                    gtMoiJson = objectMapper.writeValueAsString(chiTietQuyenKho);
                } catch (JsonProcessingException e) {
                    gtMoiJson = "error when parse";
                }
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

        nguoiDung.setVaiTro(pqndkCreating.getVaiTro());
        nguoiDung = nguoiDungService.update(nguoiDung.getId(), nguoiDung);

        try {
            giaTriMoiJson = objectMapper.writeValueAsString(nguoiDung);
        } catch (JsonProcessingException e) {
            giaTriMoiJson = "error when parse";
        }

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

        return ResponseEntity.ok(
                ResponseData.<String>builder().message("Success").build()
        );
    }


}
