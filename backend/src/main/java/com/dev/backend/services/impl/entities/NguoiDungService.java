package com.dev.backend.services.impl.entities;

import com.dev.backend.constant.enums.RoleType;
import com.dev.backend.dto.request.RegisterRequest;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.entities.NguoiDung;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.repository.NguoiDungRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class NguoiDungService extends BaseServiceImpl<NguoiDung, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public NguoiDungService(NguoiDungRepository repository) {
        super(repository);
    }

    private NguoiDungRepository nguoiDungRepository = (NguoiDungRepository) super.getRepository();

    @Transactional
    public ResponseEntity<ResponseData<String>> register(RegisterRequest registerRequest) {
        Optional<NguoiDung> findingNguoiDung = nguoiDungRepository.findByTenDangNhapOrEmailOrSoDienThoai(
                registerRequest.getTenDangNhap(),
                registerRequest.getEmail(),
                registerRequest.getSoDienThoai());

        if(findingNguoiDung.isPresent()) {
            throw new CommonException("Thông tin đăng nhập đã tồn tại");
        }

        NguoiDung nguoiDung = new NguoiDung();
        nguoiDung.setTenDangNhap(registerRequest.getTenDangNhap());
        nguoiDung.setMatKhauHash(passwordEncoder.encode(registerRequest.getMatKhau()));
        nguoiDung.setEmail(registerRequest.getEmail());
        nguoiDung.setHoTen(registerRequest.getHoTen());
        nguoiDung.setSoDienThoai(registerRequest.getSoDienThoai());
        nguoiDung.setVaiTro(RoleType.khach_hang.toString());
        nguoiDung = create(nguoiDung);
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Đăng ký tài" +nguoiDung.getVaiTro()+ " khoản thành công")
                        .message("Đăng ký tài khoản thành công")
                        .error(null)
                        .build()
        );
    }

}
