package com.dev.backend.services.impl.multitable;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.dto.request.ChiTietQuyenKhoCreating;
import com.dev.backend.dto.request.PhanQuyenNguoiDungKhoCreating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.NguoiDungAuthInfo;
import com.dev.backend.entities.*;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.services.JwtService;
import com.dev.backend.services.impl.entities.*;
import com.dev.backend.services.multitable.DieuHanhHeThongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
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
    private JwtService jwtService;

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

                Optional<ChiTietQuyenKho> findingChiTietQuyenKho = chiTietQuyenKhoService
                        .findByPhanQuyenNguoiDungKhoIdAndQuyenHanId(
                                phanQuyenNguoiDungKho.getId(),
                                chiTietQuyenKhoCreating.getQuyenHanId());
                if (findingChiTietQuyenKho.isPresent()) {
                    chiTietQuyenKho = findingChiTietQuyenKho.get();
                    firstTimeHasPermissionInWorkSpace = false;
                }
                if(firstTimeHasPermissionInWorkSpace){
                    chiTietQuyenKho = new ChiTietQuyenKho();
                    chiTietQuyenKho.setQuyenHan(findingQuyenHan.get());
                    chiTietQuyenKho.setTrangThai(chiTietQuyenKhoCreating.getTrangThai());
                    chiTietQuyenKho.setNgayCap(pqndkCreating.getNgayBatDau());
                    chiTietQuyenKho.setPhanQuyenNguoiDungKho(phanQuyenNguoiDungKho);
                    chiTietQuyenKhoService.create(chiTietQuyenKho);
                } else {
                    chiTietQuyenKho.setTrangThai(chiTietQuyenKhoCreating.getTrangThai());
                    chiTietQuyenKho.setNgayCap(pqndkCreating.getNgayBatDau());
                    chiTietQuyenKhoService.update(chiTietQuyenKho.getId(), chiTietQuyenKho);
                }
            }

        }

        return ResponseEntity.ok(
                ResponseData.<String>builder().message("Success").build()
        );
    }
}
