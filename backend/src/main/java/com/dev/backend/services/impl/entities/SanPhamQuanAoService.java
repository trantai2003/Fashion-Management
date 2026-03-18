package com.dev.backend.services.impl.entities;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.constant.enums.FileType;
import com.dev.backend.constant.variables.IHanhDong;
import com.dev.backend.constant.variables.ITable;
import com.dev.backend.dto.request.BienTheSanPhamCreating;
import com.dev.backend.dto.request.BienTheSanPhamUpdating;
import com.dev.backend.dto.request.SanPhamQuanAoCreating;
import com.dev.backend.dto.request.SanPhamQuanAoUpdating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.SanPhamQuanAoDto;
import com.dev.backend.entities.*;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.mapper.SanPhamQuanAoMapper;
import com.dev.backend.repository.SanPhamQuanAoRepository;
import com.dev.backend.services.MinioService;
import com.dev.backend.services.impl.BaseServiceImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
public class SanPhamQuanAoService extends BaseServiceImpl<SanPhamQuanAo, Integer> {

        //Core bussiness logic
        @Autowired
        private EntityManager entityManager;
        @Autowired
        private DanhMucQuanAoService danhMucQuanAoService;
        @Autowired
        private BienTheSanPhamService bienTheSanPhamService;
        @Autowired
        private MauSacService mauSacService;
        @Autowired
        private SizeService sizeService;
        @Autowired
        private ChatLieuService chatLieuService;
        @Autowired
        private NguoiDungService nguoiDungService;
        @Autowired
        private LichSuThayDoiService lichSuThayDoiService;

        //Image
        @Autowired
        private AnhQuanAoService anhQuanAoService;
        @Autowired
        private AnhBienTheService anhBienTheService;
        @Autowired
        private TepTinService tepTinService;
        @Autowired
        private MinioService minioService;

        //Mapper
        @Autowired
        private SanPhamQuanAoMapper sanPhamQuanAoMapper;
        private final ObjectMapper objectMapper = new ObjectMapper();

        @Override
        protected EntityManager getEntityManager() {
                return entityManager;
        }

        public SanPhamQuanAoService(SanPhamQuanAoRepository repository) {
                super(repository);
        }

        private final SanPhamQuanAoRepository repository = (SanPhamQuanAoRepository) getRepository();


        @Transactional
        public void recalculatePriceAndStatus(Integer sanPhamId) {
                // 1. Ép Hibernate đẩy dữ liệu xuống DB để đảm bảo Query Native đọc được số mới nhất
                entityManager.flush();

                SanPhamQuanAo sp = repository.findById(sanPhamId)
                        .orElseThrow(() -> new CommonException("Không tìm thấy sản phẩm id: " + sanPhamId));

                List<BienTheSanPham> danhSachBienThe = sp.getBienTheSanPhams();

                // 2. Xử lý cache Hibernate nếu danh sách bị null khi vừa tạo mới
                if (danhSachBienThe == null || danhSachBienThe.isEmpty()) {
                        danhSachBienThe = entityManager.createQuery("SELECT b FROM BienTheSanPham b WHERE b.sanPham.id = :id", BienTheSanPham.class)
                                .setParameter("id", sanPhamId)
                                .getResultList();
                        sp.setBienTheSanPhams(danhSachBienThe);
                }
                BigDecimal tongGiaVonBienThe = BigDecimal.ZERO;
                BigDecimal tongGiaBanBienThe = BigDecimal.ZERO;
                int soBienTheCoHang = 0;

                if (danhSachBienThe != null) {
                        for (BienTheSanPham bienThe : danhSachBienThe) {
                                // Query tính: SUM(so_luong_ton * gia_von) và SUM(so_luong_ton)
                                String sql = "SELECT SUM(t.so_luong_ton * l.gia_von), SUM(t.so_luong_ton) " +
                                        "FROM ton_kho_theo_lo t " +
                                        "JOIN lo_hang l ON t.lo_hang_id = l.id " +
                                        "WHERE l.bien_the_san_pham_id = :bienTheId";

                                Query query = entityManager.createNativeQuery(sql);
                                query.setParameter("bienTheId", bienThe.getId());
                                Object[] result = (Object[]) query.getSingleResult();

                                BigDecimal tongGiaTriTon = result[0] != null ? new BigDecimal(result[0].toString()) : BigDecimal.ZERO;
                                BigDecimal tongSoLuongTon = result[1] != null ? new BigDecimal(result[1].toString()) : BigDecimal.ZERO;

                                // Nếu biến thể còn tồn kho
                                if (tongSoLuongTon.compareTo(BigDecimal.ZERO) > 0) {
                                        // Công thức 2: Giá vốn biến thể = Tổng giá trị / Tổng tồn hệ thống
                                        BigDecimal giaVonTongVariant = tongGiaTriTon.divide(tongSoLuongTon, 2, RoundingMode.HALF_UP);
                                        bienThe.setGiaVon(giaVonTongVariant);

                                        // Công thức 3: Giá bán biến thể = Giá vốn * 1.2
                                        BigDecimal giaBanVariant = giaVonTongVariant.multiply(new BigDecimal("1.2"))
                                                .setScale(0, RoundingMode.CEILING);
                                        bienThe.setGiaBan(giaBanVariant);

                                        bienThe.setTrangThai(1);

                                        // Tích lũy để tính trung bình cộng cho sản phẩm cha
                                        tongGiaVonBienThe = tongGiaVonBienThe.add(giaVonTongVariant);
                                        tongGiaBanBienThe = tongGiaBanBienThe.add(giaBanVariant);
                                        soBienTheCoHang++;
                                } else {
                                        // Hết hàng thì trạng thái = 0
                                        bienThe.setTrangThai(0);
                                        // Giữ nguyên hoặc set về 0 tùy bạn, ở đây tôi gán 0 cho minh bạch
                                        if (bienThe.getGiaVon() == null) bienThe.setGiaVon(BigDecimal.ZERO);
                                        if (bienThe.getGiaBan() == null) bienThe.setGiaBan(BigDecimal.ZERO);
                                }
                                bienTheSanPhamService.update(bienThe.getId(), bienThe);
                        }
                }

                // 3. Cập nhật giá cho Sản phẩm cha (SanPhamQuanAo)
                if (soBienTheCoHang > 0) {
                        // Giá vốn sản phẩm = Trung bình cộng giá vốn các biến thể còn hàng
                        sp.setGiaVonMacDinh(tongGiaVonBienThe.divide(new BigDecimal(soBienTheCoHang), 2, RoundingMode.HALF_UP));
                        // Giá bán sản phẩm = Trung bình cộng giá bán các biến thể còn hàng
                        sp.setGiaBanMacDinh(tongGiaBanBienThe.divide(new BigDecimal(soBienTheCoHang), 0, RoundingMode.CEILING));
                        sp.setTrangThai(1);
                } else {
                        // Nếu tất cả biến thể hết hàng
                        sp.setTrangThai(0);
                        // Giữ giá cũ
                        sp.setGiaVonMacDinh(BigDecimal.ZERO);
                        sp.setGiaBanMacDinh(BigDecimal.ZERO);
                }

                repository.save(sp);
        }
        @Transactional
        public ResponseEntity<ResponseData<SanPhamQuanAoDto>> create(
                SanPhamQuanAoCreating creating,
                List<MultipartFile> anhSanPhams,
                List<MultipartFile> anhBienThes) {

                Set<String> checkDuplicateSet = new HashSet<>();
                for (BienTheSanPhamCreating bt : creating.getBienTheSanPhams()) {
                        String key = bt.getMauSacId() + "-" + bt.getSizeId() + "-" + bt.getChatLieuId();
                        if (!checkDuplicateSet.add(key)) {
                                throw new CommonException("Có biến thể sản phẩm trùng lặp về thuộc tính (Màu, Size, Chất liệu)!");
                        }
                }

                Instant instantNow = Instant.now();
                Date now = new Date();

                DanhMucQuanAo danhMucQuanAo = danhMucQuanAoService.getOne(creating.getDanhMucId()).orElseThrow(
                        () -> new CommonException("Danh mục không tồn tại id: " + creating.getDanhMucId())
                );

                String maVietTatDM = generateCodeFromName(danhMucQuanAo.getTenDanhMuc());
                String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
                String prefixMaSp = maVietTatDM + datePart; // VD: AT260314

                // Đếm số sản phẩm đã tồn tại trong ngày để lấy STT
                long stt = repository.countByMaSanPhamStartingWith(prefixMaSp) + 1;
                String maSanPhamAuto = prefixMaSp + stt;

                SanPhamQuanAo sanPhamQuanAo = SanPhamQuanAoCreating.toEntity(creating);

                Integer nguoiTaoId = SecurityContextHolder.getUser().getId();
                NguoiDung nguoiTao = nguoiDungService.getOne(nguoiTaoId).orElseThrow(
                        () -> new CommonException("Người tạo không tồn tại id: " + nguoiTaoId)
                );

                sanPhamQuanAo.setMaSanPham(maSanPhamAuto);
                sanPhamQuanAo.setDanhMuc(danhMucQuanAo);
                sanPhamQuanAo.setNguoiTao(nguoiTao);
                sanPhamQuanAo.setNgayTao(instantNow);

                // Lưu sản phẩm vào DB trước
                sanPhamQuanAo = create(sanPhamQuanAo);

                if (anhSanPhams != null && !anhSanPhams.isEmpty()) {
                        try {
                                int i = 0;
                                for (MultipartFile file : anhSanPhams) {
                                        String objectName = minioService.upload(file, ITable.san_pham_quan_ao + "_" + sanPhamQuanAo.getMaSanPham() + "_" + now.getTime() + "_" + i++);
                                        TepTin tepTin = tepTinService.create(
                                                TepTin.builder()
                                                        .tenTepGoc(objectName)
                                                        .tenTaiLen(objectName)
                                                        .tenLuuTru(objectName)
                                                        .duongDan(minioService.getPublicUrl(objectName))
                                                        .loaiTepTin(FileType.IMAGE.toString())
                                                        .duoiTep(minioService.getObjectInfo(objectName).getUserMetadata().get("file-extension"))
                                                        .trangThai(1)
                                                        .ngayTao(instantNow)
                                                        .build()
                                        );

                                        anhQuanAoService.create(
                                                AnhQuanAo.builder()
                                                        .quanAo(sanPhamQuanAo)
                                                        .tepTin(tepTin)
                                                        .anhChinh(i == 1 ? 1 : 0)
                                                        .trangThai(1)
                                                        .ngayTao(instantNow)
                                                        .build()
                                        );
                                }
                        } catch (Exception e) {
                                log.error("Lỗi tạo tệp tin cho quần áo: {}", creating.getTenSanPham(), e);
                                throw new RuntimeException("Lỗi tạo tệp tin cho quần áo: " + creating.getTenSanPham());
                        }
                }

                int imageCount = 0;
                for (BienTheSanPhamCreating btspCreating : creating.getBienTheSanPhams()) {

                        MauSac mauSac = mauSacService.getOne(btspCreating.getMauSacId()).orElseThrow(
                                () -> new CommonException("Không tìm thấy màu id: " + btspCreating.getMauSacId()));

                        Size size = sizeService.getOne(btspCreating.getSizeId()).orElseThrow(
                                () -> new CommonException("Không tìm thấy size id: " + btspCreating.getSizeId()));

                        ChatLieu chatLieu = chatLieuService.getOne(btspCreating.getChatLieuId()).orElseThrow(
                                () -> new CommonException("Không tìm thấy chất liệu id: " + btspCreating.getChatLieuId()));

                        // Công thức SKU = [Mã SP] + [Mã chất liệu] + [Mã size] + [Mã màu]
                        String maCL = chatLieu.getMaChatLieu();
                        String maSize = size.getMaSize();
                        String maMau = mauSac.getMaMau();

                        String autoSku = maSanPhamAuto + "-" + maCL + "-" + maSize + "-" + maMau;

                        BienTheSanPham bienTheSanPham = BienTheSanPhamCreating.toEntity(btspCreating);
                        bienTheSanPham.setSanPham(sanPhamQuanAo);
                        bienTheSanPham.setMaSku(autoSku); // Gán SKU tự động
                        bienTheSanPham.setMauSac(mauSac);
                        bienTheSanPham.setSize(size);
                        bienTheSanPham.setChatLieu(chatLieu);
                        bienTheSanPham.setTrangThai(btspCreating.getTrangThai());
                        bienTheSanPham.setNgayTao(instantNow);

                        bienTheSanPhamService.create(bienTheSanPham);

                        // Xử lý ảnh biến thể
                        if (anhBienThes != null && imageCount < anhBienThes.size()) {
                                try {
                                        String objectName = minioService.upload(anhBienThes.get(imageCount), ITable.bien_the_san_pham + "_" + autoSku + "_" + now.getTime());
                                        TepTin tepTin = tepTinService.create(
                                                TepTin.builder()
                                                        .tenTepGoc(objectName)
                                                        .tenTaiLen(objectName)
                                                        .tenLuuTru(objectName)
                                                        .duongDan(minioService.getPublicUrl(objectName))
                                                        .loaiTepTin(FileType.IMAGE.toString())
                                                        .duoiTep(minioService.getObjectInfo(objectName).getUserMetadata().get("file-extension"))
                                                        .trangThai(1)
                                                        .ngayTao(instantNow)
                                                        .build()
                                        );

                                        anhBienTheService.create(
                                                AnhBienThe.builder()
                                                        .bienThe(bienTheSanPham)
                                                        .tepTin(tepTin)
                                                        .trangThai(1)
                                                        .ngayTao(instantNow)
                                                        .build()
                                        );
                                        imageCount++;
                                } catch (Exception e) {
                                        log.error("Lỗi tạo tệp tin cho biến thể: {}", autoSku, e);
                                }
                        }
                }
                recalculatePriceAndStatus(sanPhamQuanAo.getId());

                sanPhamQuanAo = getOne(sanPhamQuanAo.getId()).get();

                saveLichSu(sanPhamQuanAo, creating, nguoiTao, instantNow);

                return ResponseEntity.ok(
                        ResponseData.<SanPhamQuanAoDto>builder()
                                .status(HttpStatus.OK.value())
                                .data(sanPhamQuanAoMapper.toDto(sanPhamQuanAo))
                                .message("Tạo sản phẩm thành công với mã: " + maSanPhamAuto)
                                .build()
                );
        }

        private String generateCodeFromName(String name) {
                if (name == null || name.isEmpty()) return "XX";
                String normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
                        .replaceAll("\\p{M}", "")
                        .toUpperCase();
                String[] words = normalized.split("\\s+");
                StringBuilder code = new StringBuilder();
                for (String word : words) {
                        if (!word.isEmpty()) code.append(word.charAt(0));
                }
                return code.toString();
        }

        private void saveLichSu(SanPhamQuanAo sp, SanPhamQuanAoCreating creating, NguoiDung nguoiTao, Instant now) {
                try {
                        objectMapper.registerModule(new JavaTimeModule());
                        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
                        String giaTriMoiJson = objectMapper.writeValueAsString(creating);

                        lichSuThayDoiService.create(
                                LichSuThayDoi.builder()
                                        .loaiThamChieu(ITable.san_pham_quan_ao)
                                        .idThamChieu(sp.getId())
                                        .hanhDong(IHanhDong.them_moi_san_pham)
                                        .giaTriMoi(giaTriMoiJson)
                                        .nguoiThucHien(nguoiTao)
                                        .ngayThucHien(now)
                                        .ghiChu("Tạo sản phẩm tự động mã: " + sp.getMaSanPham())
                                        .build()
                        );
                } catch (Exception e) {
                        log.error("Lỗi lưu lịch sử", e);
                }
        }


        @Transactional
        public ResponseEntity<ResponseData<SanPhamQuanAoDto>> update(
                SanPhamQuanAoUpdating updating,
                List<MultipartFile> anhSanPhams,
                List<MultipartFile> anhBienThes) {

                List<BienTheSanPhamUpdating> list = new ArrayList<>(updating.getBienTheSanPhams());
                Set<BienTheSanPhamUpdating> set = new HashSet<>(updating.getBienTheSanPhams());

                if (list.size() != set.size()) {
                        throw new CommonException("Có biến thể sản phẩm trùng lặp!");
                }

                SanPhamQuanAo sanPhamQuanAo = getOne(updating.getId()).orElseThrow(
                        () -> new CommonException("Không tìm thấy sản phẩm id: " + updating.getId())
                );

                DanhMucQuanAo danhMucQuanAo = danhMucQuanAoService.getOne(updating.getDanhMucId()).orElseThrow(
                        () -> new CommonException("Không tìm thấy danh mục quần áo id: " + updating.getDanhMucId())
                );

                sanPhamQuanAo.setMaSanPham(updating.getMaSanPham());
                sanPhamQuanAo.setTenSanPham(updating.getTenSanPham());
                sanPhamQuanAo.setDanhMuc(danhMucQuanAo);
                sanPhamQuanAo.setMoTa(updating.getMoTa());
                sanPhamQuanAo.setMaVach(updating.getMaVach());
                sanPhamQuanAo.setGiaVonMacDinh(updating.getGiaVonMacDinh());
                sanPhamQuanAo.setTrangThai(updating.getTrangThai());
                sanPhamQuanAo = update(updating.getId(), sanPhamQuanAo);
                if (updating.isImageUpdated()) {
                        //Lấy danh sách ID tệp tin để xóa file vật lý sau
                        List<Integer> tepTinIds = sanPhamQuanAo.getAnhQuanAos()
                                .stream()
                                .map(anh -> anh.getTepTin().getId())
                                .toList();

                        //Xóa sạch danh sách ảnh trong Object (Hibernate sẽ tự xóa bản ghi AnhQuanAo trong DB)
                        sanPhamQuanAo.getAnhQuanAos().clear();

                        //Ép Hibernate đồng bộ ngay để tránh xung đột với logic upload phía sau
                        entityManager.flush();

                        //Xóa tệp tin (DB và MinIO)
                        tepTinIds.forEach(id -> tepTinService.hardDeleteNoMessage(id));
                        try {
                                Date now = new Date();
                                int i = 0;
                                for (MultipartFile file : anhSanPhams) {
                                        String objectName = minioService.upload(file, ITable.san_pham_quan_ao + "_" + sanPhamQuanAo.getMaSanPham() + "_" + now.getTime() + "_" + i++);

                                        TepTin tepTin = tepTinService.create(TepTin.builder()
                                                        .tenTepGoc(objectName)
                                                        .tenTaiLen(objectName)
                                                        .tenLuuTru(objectName)
                                                        .duongDan(minioService.getPublicUrl(objectName))
                                                        .loaiTepTin(FileType.IMAGE.toString())
                                                        .duoiTep(minioService.getObjectInfo(objectName).getUserMetadata().get("file-extension"))
                                                        .trangThai(1)
                                                        .ngayTao(sanPhamQuanAo.getNgayCapNhat())
                                                        .build()
                                        );

                                        //Thêm ảnh mới trực tiếp vào list của sản phẩm
                                        AnhQuanAo newAnh = AnhQuanAo.builder()
                                                .quanAo(sanPhamQuanAo)
                                                .tepTin(tepTin)
                                                .anhChinh(i == 1 ? 1 : 0)
                                                .trangThai(1)
                                                .ngayTao(Instant.now())
                                                .build();

                                        sanPhamQuanAo.getAnhQuanAos().add(newAnh);
                                }
                                System.out.println("Có tổng cộng " + i + " ảnh");

                        } catch (Exception e) {
                                throw new RuntimeException("Lỗi upload ảnh: " + e.getMessage());
                        }


                }
                int imageCount = 0;
                Date now = new Date();
                for (BienTheSanPhamUpdating btspUdating : updating.getBienTheSanPhams()) {
                        try {

                                BienTheSanPham bienThe = bienTheSanPhamService.getOne(btspUdating.getId())
                                        .orElseThrow(
                                                () -> new CommonException("Không tìm thấy biến thể sản phâ id: " + btspUdating.getId())
                                        );

                                bienThe.setGiaVon(btspUdating.getGiaVon());
                                bienThe.setGiaBan(btspUdating.getGiaBan());
                                bienThe.setTrangThai(btspUdating.getTrangThai());
                                bienTheSanPhamService.update(btspUdating.getId(), bienThe);
                                if (btspUdating.isImageUpdated()) {

                                        String objectName = minioService.upload(anhBienThes.get(imageCount), ITable.bien_the_san_pham + "_" + sanPhamQuanAo.getMaSanPham() + "_" + now.getTime() + "_" + imageCount++);
                                        TepTin tepTin = TepTin.builder()
                                                .tenTepGoc(objectName)
                                                .tenTaiLen(objectName)
                                                .tenLuuTru(objectName)
                                                .duongDan(minioService.getPublicUrl(objectName))
                                                .loaiTepTin(FileType.IMAGE.toString())
                                                .duoiTep(minioService.getObjectInfo(objectName).getUserMetadata().get("file-extension"))
                                                .trangThai(1)
                                                .build();
                                        tepTin = tepTinService.create(tepTin);

                                        if (bienThe.getAnhBienThe() != null) {
                                                Integer idTepCu = bienThe.getAnhBienThe().getTepTin().getId();
                                                bienThe.getAnhBienThe().setTepTin(tepTin);
                                                anhBienTheService.update(bienThe.getAnhBienThe().getId(), bienThe.getAnhBienThe());
                                                tepTinService.hardDeleteNoMessage(idTepCu);
                                        }
                                } else {
                                        imageCount++;
                                }

                        } catch (Exception e) {
                                log.error("Lỗi tạo tệp tin cho biến thể quần áo: {}", btspUdating.getId(), e);
                                throw new RuntimeException("Lỗi tạo tệp tin cho quần áo: " + btspUdating.getId(), e);
                        }
                }
                recalculatePriceAndStatus(sanPhamQuanAo.getId());
                sanPhamQuanAo = getOne(sanPhamQuanAo.getId()).orElseThrow(
                        () -> new CommonException("Không tìm thấy sản phẩm quần áo id: " + updating.getId())
                );
                return ResponseEntity.ok(
                        ResponseData.<SanPhamQuanAoDto>builder()
                                .status(HttpStatus.OK.value())
                                .data(sanPhamQuanAoMapper.toDto(sanPhamQuanAo))
                                .message("Success")
                                .build());
        }

        @Transactional(readOnly = true)
        public SanPhamQuanAoDto getDetail(Integer id) {
                // Sử dụng findDetailById vừa tạo ở Bước 1
                SanPhamQuanAo sp = repository.findDetailById(id)
                        .orElseThrow(() -> new CommonException("Không tìm thấy sản phẩm id: " + id));

                return sanPhamQuanAoMapper.toDto(sp);
        }

        @Transactional
        public SanPhamQuanAo changeStatus(Integer id, Integer status) {
                SanPhamQuanAo sanPhamQuanAo = getOne(id).orElseThrow(
                        () -> new CommonException("Không tìm thấy sản phẩm id: " + id));
                sanPhamQuanAo.setTrangThai(status);
                return repository.save(sanPhamQuanAo);
        }

        @Transactional
        public void updateSkuPrice(Integer skuId, BigDecimal newPrice, BigDecimal newCost) {
                BienTheSanPham bienThe = bienTheSanPhamService.getOne(skuId).orElseThrow(
                        () -> new CommonException("Không tìm thấy biến thể id: " + skuId));
                if (newPrice != null)
                        bienThe.setGiaBan(newPrice);
                if (newCost != null)
                        bienThe.setGiaVon(newCost);
                bienTheSanPhamService.update(skuId, bienThe);
        }

        public ResponseEntity<ResponseData<List<SanPhamQuanAoDto>>> getAllByKho(Integer khoId) {

                return ResponseEntity.ok(
                        ResponseData.<List<SanPhamQuanAoDto>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Success")
                                .data(sanPhamQuanAoMapper.toDtoList(repository.findSanPhamTrongKho(khoId)))
                                .build()
                );
        }
}