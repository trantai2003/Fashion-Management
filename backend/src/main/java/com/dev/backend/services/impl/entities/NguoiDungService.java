package com.dev.backend.services.impl.entities;

import com.dev.backend.constant.GlobalCache;
import com.dev.backend.constant.enums.OtpType;
import com.dev.backend.constant.enums.RoleType;
import com.dev.backend.dto.OtpScheduleObj;
import com.dev.backend.dto.request.*;
import com.dev.backend.dto.response.LoginResponse;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.NguoiDungDto;
import com.dev.backend.entities.NguoiDung;
import com.dev.backend.entities.PhanQuyenNguoiDungKho;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.NguoiDungMapper;
import com.dev.backend.mapper.PhanQuyenNguoiDungKhoMapper;
import com.dev.backend.repository.NguoiDungRepository;
import com.dev.backend.services.CalcService;
import com.dev.backend.services.EmailService;
import com.dev.backend.services.JwtService;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class NguoiDungService extends BaseServiceImpl<NguoiDung, Integer> {
    @Autowired
    private EntityManager entityManager;

    @Autowired
    private PhanQuyenNguoiDungKhoService phanQuyenNguoiDungKhoService;

    @Autowired
    private NguoiDungMapper nguoiDungMapper;
    @Autowired
    private PhanQuyenNguoiDungKhoMapper pqndkMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CalcService calcService;

    @Autowired
    private EmailService emailService;


    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public NguoiDungService(NguoiDungRepository repository) {
        super(repository);
    }

    private final NguoiDungRepository nguoiDungRepository = (NguoiDungRepository) super.getRepository();

    @Transactional
    public ResponseEntity<ResponseData<String>> register(RegisterRequest registerRequest) {
        Optional<NguoiDung> findingNguoiDung = nguoiDungRepository.findByTenDangNhapOrEmailOrSoDienThoai(
                registerRequest.getTenDangNhap(),
                registerRequest.getEmail(),
                registerRequest.getSoDienThoai());

        if (findingNguoiDung.isPresent()) {
            throw new CommonException("Thông tin đăng nhập đã tồn tại");
        }

        NguoiDung nguoiDung = new NguoiDung();
        nguoiDung.setTenDangNhap(registerRequest.getTenDangNhap());
        nguoiDung.setMatKhauHash(passwordEncoder.encode(registerRequest.getMatKhau()));
        nguoiDung.setEmail(registerRequest.getEmail());
        nguoiDung.setHoTen(registerRequest.getHoTen());
        nguoiDung.setSoDienThoai(registerRequest.getSoDienThoai());
        nguoiDung.setVaiTro(RoleType.khach_hang.toString());
        nguoiDung.setTrangThai(0);
        nguoiDung = create(nguoiDung);

        String otp = calcService.getRandomActiveCode(6L);
        GlobalCache.OTP_SCHEDULE_OBJS.add(
                OtpScheduleObj.builder()
                        .email(registerRequest.getEmail())
                        .otp(otp)
                        .createdAt(nguoiDung.getNgayTao())
                        .type(OtpType.ACCOUNT_ACTIVATION)
                        .build()
        );

        Map<String, Object> params = new HashMap<>();

        params.put("userName", registerRequest.getHoTen());
        params.put("otp", otp);
        params.put("expiryTime", "5 phút");

        emailService.sendHtmlEmailFromTemplate(registerRequest.getEmail(), "Kích hoạt tài khoản", "activation.html", params);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Đăng ký tài khoản " + nguoiDung.getVaiTro() + " thành công")
                        .message("Đăng ký tài khoản " + nguoiDung.getVaiTro() + " thành công")
                        .error(null)
                        .build()
        );
    }

    @Transactional
    public ResponseEntity<ResponseData<String>> activeAccount(VerifyAccount verifyDto) {
        OtpScheduleObj findingRegisterOtp = GlobalCache.OTP_SCHEDULE_OBJS.stream().filter(otpScheduleObj ->
                otpScheduleObj.getEmail().equals(verifyDto.getEmail()) && otpScheduleObj.getType().equals(OtpType.ACCOUNT_ACTIVATION)).findFirst().orElseThrow(
                () -> new CommonException("Mã xác nhận không tồn tại hoặc đã hết hạn")
        );


        if (!findingRegisterOtp.getOtp().equals(verifyDto.getOtp())) {
            throw new CommonException("Mã xác nhận không tồn tại hoặc đã hết hạn");
        }

        Instant now = Instant.now();
        if (now.isAfter(findingRegisterOtp.getCreatedAt().plusSeconds(300))) {
            throw new CommonException("Mã xác nhận không tồn tại hoặc đã hết hạn");
        }

        Optional<NguoiDung> findingNguoiDung = nguoiDungRepository.findByEmail(findingRegisterOtp.getEmail());

        if (findingNguoiDung.isEmpty()) {
            throw new CommonException("Mã xác nhận không tồn tại hoặc đã hết hạn");
        }
        NguoiDung nguoiDung = findingNguoiDung.get();
        nguoiDung.setTrangThai(1);
        update(nguoiDung.getId(), nguoiDung);
        GlobalCache.OTP_SCHEDULE_OBJS.remove(findingRegisterOtp);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Xác nhận tài khoản thành công vui lòng đăng nhập")
                        .message("Xác nhận tài khoản thành công vui lòng đăng nhập")
                        .error(null)
                        .build()
        );
    }

    @Transactional
    public ResponseEntity<ResponseData<LoginResponse>> login(LoginRequest loginRequest) {
        Optional<NguoiDung> findingNguoiDung = nguoiDungRepository.findByTenDangNhapOrEmailOrSoDienThoai(
                loginRequest.getUsername(),
                loginRequest.getUsername(),
                loginRequest.getUsername());
        if (findingNguoiDung.isEmpty()) {
            throw new CommonException("Tên đăng nhập không hợp lệ");
        }
        NguoiDung nguoiDung = findingNguoiDung.get();
        if (!passwordEncoder.matches(loginRequest.getPassword(), nguoiDung.getMatKhauHash())) {
            throw new CommonException("Mật khẩu không chính xác");
        }

        List<PhanQuyenNguoiDungKho> phanQuyenNguoiDungKhos = phanQuyenNguoiDungKhoService.findByNguoiDungIdAndActive(nguoiDung.getId());

        Set<String> vaiTros = new HashSet<>();
        vaiTros.add(nguoiDung.getVaiTro());
        String token = jwtService.generateTokenWithPermissions(
                nguoiDung.getId(),
                nguoiDung.getTenDangNhap(),
                nguoiDung.getHoTen(),
                nguoiDung.getEmail(),
                nguoiDung.getSoDienThoai(),
                vaiTros,
                nguoiDung.getTrangThai(),
                nguoiDung.getNgayTao(),
                nguoiDung.getNgayCapNhat(),
                pqndkMapper.toDtoList(phanQuyenNguoiDungKhos),
                "Google"
        );
        return ResponseEntity.ok(
                ResponseData.<LoginResponse>builder()
                        .status(HttpStatus.OK.value())
                        .data(
                                LoginResponse.builder()
                                        .nguoiDung(nguoiDungMapper.toDto(nguoiDung))
                                        .token(token)
                                        .build()
                        )
                        .message("Success")
                        .error(null)
                        .build()
        );
    }

    @Transactional
    public ResponseEntity<ResponseData<NguoiDungDto>> update(UpdateNguoiDungRequest request) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(request.getId())
                .orElseThrow(() -> new CommonException("Không tìm thấy người dùng id: " + request.getId()));
        if (request.getTenDangNhap() != null && !request.getTenDangNhap().isBlank()) {
            nguoiDung.setTenDangNhap(request.getTenDangNhap());
        }
        if (request.getHoTen() != null && !request.getHoTen().isBlank()) {
            nguoiDung.setHoTen(request.getHoTen());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            nguoiDung.setEmail(request.getEmail());
        }
        if (request.getSoDienThoai() != null && !request.getSoDienThoai().isBlank()) {
            nguoiDung.setSoDienThoai(request.getSoDienThoai());
        }
        nguoiDung = nguoiDungRepository.save(nguoiDung);
        return ResponseEntity.ok(
                ResponseData.<NguoiDungDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(nguoiDungMapper.toDto(nguoiDung))
                        .message("Cập nhật thông tin người dùng thành công")
                        .error(null)
                        .build()
        );
    }

    public Optional<NguoiDung> findByEmail(String email) {
        return nguoiDungRepository.findByEmail(email);
    }

    public ResponseEntity<ResponseData<String>> forgotPassword(ForgotPasswordRequest fpRequest) {
        NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhapOrEmailOrSoDienThoai(
                fpRequest.getUsername(),
                fpRequest.getUsername(),
                fpRequest.getUsername()).orElseThrow(
                () -> new CommonException("Không tìm thấy tài khoản")
        );
        String otp = calcService.getRandomActiveCode(6L);
        GlobalCache.OTP_SCHEDULE_OBJS.add(
                OtpScheduleObj.builder()
                        .email(nguoiDung.getEmail())
                        .otp(otp)
                        .createdAt(Instant.now())
                        .type(OtpType.RESET_PASSWORD)
                        .build()
        );

        Map<String, Object> params = new HashMap<>();

        params.put("userName", nguoiDung.getHoTen());
        params.put("otp", otp);
        params.put("expiryTime", "5 phút");

        emailService.sendHtmlEmailFromTemplate(nguoiDung.getEmail(), "Lấy lại mật khẩu", "activation.html", params);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Success")
                        .message("Success")
                        .build()

        );
    }

    public ResponseEntity<ResponseData<String>> resetPassword(ResetPasswordRequest rpRequest) {
        NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhapOrEmailOrSoDienThoai(
                rpRequest.getUsername(),
                rpRequest.getUsername(),
                rpRequest.getUsername()).orElseThrow(
                () -> new CommonException("Không tìm thấy tài khoản")
        );
        OtpScheduleObj findingResetOtp = GlobalCache.OTP_SCHEDULE_OBJS.stream().filter(otpScheduleObj ->
                otpScheduleObj.getEmail().equals(nguoiDung.getEmail()) && otpScheduleObj.getType().equals(OtpType.RESET_PASSWORD)).findFirst().orElseThrow(
                () -> new CommonException("Mã xác nhận không tồn tại hoặc đã hết hạn 1")
        );

        if (!findingResetOtp.getOtp().equals(rpRequest.getOtp())) {
            throw new CommonException("Mã xác nhận không tồn tại hoặc đã hết hạn 2");
        }

        Instant now = Instant.now();
        if (now.isAfter(findingResetOtp.getCreatedAt().plusSeconds(300))) {
            throw new CommonException("Mã xác nhận không tồn tại hoặc đã hết hạn 3");
        }

        nguoiDung.setMatKhauHash(passwordEncoder.encode(rpRequest.getPassword()));

        GlobalCache.OTP_SCHEDULE_OBJS.remove(findingResetOtp);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Success")
                        .message("Success")
                        .build()

        );
    }
}


