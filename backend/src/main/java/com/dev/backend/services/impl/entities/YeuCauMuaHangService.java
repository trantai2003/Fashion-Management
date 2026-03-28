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

    // nhân viên kho yêu cầu nhập hàng
    @Transactional
    public ResponseEntity<ResponseData<YeuCauMuaHangDto>> create(YeuCauMuaHangCreating creating) {
        // kiểm tra xem NVK có quyền hạn kho này ko
        Kho khoNhap = khoService.getOne(creating.getKhoNhapId()).orElseThrow(
                () -> new CommonException("Không tìm thấy kho id: " + creating.getKhoNhapId())
        );

        // lấy người dùng đang đăng nhập
        NguoiDungAuthInfo authInfo = SecurityContextHolder.getUser();
        if (authInfo == null) throw new CommonException("Bạn phải đănh nhập");

        // lấy người dùng đang đăng nhập trong DB
        // người dùng đăng nhập thì để lại ID cho mình và mình lấy ID check trong DB
        NguoiDung nguoiTao = nguoiDungService.getOne(authInfo.getId()).orElseThrow(
                () -> new CommonException("Người dùng không tồn tại trong hệ thống id:" + authInfo.getId())
        );

        Instant now = Instant.now();

        //tạo phiếu yêu cầu nhập hàng( build ra entities)
        YeuCauMuaHang yeuCauMuaHang = YeuCauMuaHang.builder()
                .khoNhap(khoNhap)
                .ngayGiaoDuKien(creating.getNgayGiaoDuKien())
                .nguoiTao(nguoiTao)
                .trangThai(1)
                .nguoiTao(nguoiTao)
                .ngayTao(now)
                .build();

        //lưu vào DB
        yeuCauMuaHang = create(yeuCauMuaHang);

        //khởi tạo danh sách chi tiết YCMH
        List<ChiTietYeuCauMuaHang> chiTietYeuCauMuaHangs = new ArrayList<>();

        //duyệt qua danh sách mặt hàng để kiểm tra xem biến thể có tổn tại hay ko
        for (ChiTietYeuCauMuaHangCreating ycmhCreating : creating.getChiTietYeuCauMuaHangs()) {
            //với mỗi mặt hàng, kiểm tra xem "Biến thể sản phẩm" có tồn tại không.
            BienTheSanPham bienTheSanPham = bienTheSanPhamService.getOne(ycmhCreating.getBienTheSanPhamId()).orElseThrow(
                    () -> new CommonException("Không tìm thấy biến thể sản phẩm id: " + ycmhCreating.getBienTheSanPhamId())
            );
            //tạo chi tiết yêu cầu mua hàng của biến thể, liên kết nó với phiếu tổng (yeuCauMuaHang)
            ChiTietYeuCauMuaHang chiTietYeuCauMuaHang = ChiTietYeuCauMuaHang.builder()
                    .yeuCauMuaHang(yeuCauMuaHang)
                    .bienTheSanPham(bienTheSanPham)
                    .soLuongDat(ycmhCreating.getSoLuongDat())
                    .build();
            //thêm vào danh sách
            chiTietYeuCauMuaHangs.add(chiTietYeuCauMuaHang);
        }
        //lưu hàng loạt danh sách chi tiết xuống DB
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
