package com.dev.backend.services.impl.entities;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.dto.request.ChiTietYeuCauMuaHangCreating;
import com.dev.backend.dto.request.YeuCauMuaHangCreating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.NguoiDungAuthInfo;
import com.dev.backend.dto.response.entities.YeuCauMuaHangDto;
import com.dev.backend.entities.*;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.YeuCauMuaHangMapper;
import com.dev.backend.repository.YeuCauMuaHangRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class YeuCauMuaHangService extends BaseServiceImpl<YeuCauMuaHang, Integer> {

    @Autowired
    private EntityManager entityManager;
    @Autowired
    private KhoService khoService;
    @Autowired
    private NguoiDungService nguoiDungService;
    @Autowired
    private BienTheSanPhamService bienTheSanPhamService;
    @Autowired
    private ChiTietYeuCauMuaHangService chiTietYeuCauMuaHangService;


    @Autowired
    private YeuCauMuaHangMapper yeuCauMuaHangMapper;

    public YeuCauMuaHangService(YeuCauMuaHangRepository repository) {
        super(repository);
    }

    @Override
    protected EntityManager getEntityManager() {
        return this.entityManager;
    }

    @Transactional
    public ResponseEntity<ResponseData<YeuCauMuaHangDto>> create(YeuCauMuaHangCreating creating) {

        Kho khoNhap = khoService.getOne(creating.getKhoNhapId()).orElseThrow(
                () -> new CommonException("Không tìm thấy kho id: " + creating.getKhoNhapId())
        );

        NguoiDungAuthInfo authInfo = SecurityContextHolder.getUser();

        if (authInfo == null) throw new CommonException("Bạn phải đănh nhập");

        NguoiDung nguoiTao = nguoiDungService.getOne(authInfo.getId()).orElseThrow(
                () -> new CommonException("Người dùng không tồn tại trong hệ thống id:" + authInfo.getId())
        );

        Instant now = Instant.now();

        YeuCauMuaHang yeuCauMuaHang = YeuCauMuaHang.builder()
                .khoNhap(khoNhap)
                .ngayGiaoDuKien(creating.getNgayGiaoDuKien())
                .nguoiTao(nguoiTao)
                .trangThai(1)
                .nguoiTao(nguoiTao)
                .ngayTao(now)
                .build();
        yeuCauMuaHang = create(yeuCauMuaHang);

        List<ChiTietYeuCauMuaHang> chiTietYeuCauMuaHangs = new ArrayList<>();

        for (ChiTietYeuCauMuaHangCreating ycmhCreating : creating.getChiTietYeuCauMuaHangs()) {
            BienTheSanPham bienTheSanPham = bienTheSanPhamService.getOne(ycmhCreating.getBienTheSanPhamId()).orElseThrow(
                    () -> new CommonException("Không tìm thấy biến thể sản phẩm id: " + ycmhCreating.getBienTheSanPhamId())
            );
            ChiTietYeuCauMuaHang chiTietYeuCauMuaHang = ChiTietYeuCauMuaHang.builder()
                    .yeuCauMuaHang(yeuCauMuaHang)
                    .bienTheSanPham(bienTheSanPham)
                    .soLuongDat(ycmhCreating.getSoLuongDat())
                    .build();
            chiTietYeuCauMuaHangs.add(chiTietYeuCauMuaHang);
        }
        yeuCauMuaHang.setChiTietYeuCauMuaHangs(chiTietYeuCauMuaHangService.create(chiTietYeuCauMuaHangs));
        return ResponseEntity.ok(
                ResponseData.<YeuCauMuaHangDto>builder()
                        .status(HttpStatus.OK.value())
                        .message("Success")
                        .data(
                                yeuCauMuaHangMapper.toDto(yeuCauMuaHang)
                        )
                        .build()
        );
    }
}
