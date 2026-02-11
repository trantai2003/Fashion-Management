package com.dev.backend.services.impl.entities;

import com.dev.backend.dto.request.KhachHangCreating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.entities.DonMuaHang;

import com.dev.backend.entities.KhachHang;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.repository.KhachHangRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KhachHangService extends BaseServiceImpl<KhachHang, Integer> {
    @Autowired
    private EntityManager entityManager;

    private final KhachHangRepository khachHangRepository = (KhachHangRepository) getRepository();

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public KhachHangService(KhachHangRepository repository) {
        super(repository);
    }

    @Transactional
    public ResponseEntity<ResponseData<String>> create(KhachHangCreating creating) {
        KhachHang khachHang = khachHangRepository.findByMaKhachHangOrEmailOrSoDienThoai(
                        creating.getMaKhachHang(), creating.getEmail(), creating.getSoDienThoai())
                .orElse(null);

        if(khachHang !=null){
            throw new CommonException("Thông tin khách hàng tồn tại");
        }

        KhachHang newKhachHang = KhachHang.builder()
                .maKhachHang(creating.getMaKhachHang())
                .tenKhachHang(creating.getTenKhachHang())
                .nguoiLienHe(creating.getNguoiLienHe())
                .soDienThoai(creating.getSoDienThoai())
                .email(creating.getEmail())
                .soDienThoai(creating.getSoDienThoai())
                .diaChi(creating.getDiaChi())
                .loaiKhachHang(creating.getLoaiKhachHang())
                .trangThai(1)
                .build();

        create(newKhachHang);
        return ResponseEntity.ok(ResponseData.<String>builder().status(200).data("Success").message("Success").build());
    }
}
