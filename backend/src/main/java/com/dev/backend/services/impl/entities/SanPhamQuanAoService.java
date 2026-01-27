package com.dev.backend.services.impl.entities;

import com.dev.backend.config.SecurityContextHolder;
import com.dev.backend.constant.enums.FileType;
import com.dev.backend.constant.variables.IHanhDong;
import com.dev.backend.constant.variables.ITable;
import com.dev.backend.dto.request.BienTheSanPhamCreating;
import com.dev.backend.dto.request.SanPhamQuanAoCreating;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;

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
    public ResponseEntity<ResponseData<SanPhamQuanAoDto>> create(
            SanPhamQuanAoCreating creating,
            List<MultipartFile> anhSanPhams,
            List<MultipartFile> anhBienThes) {

        Instant instantNow = Instant.now();
        Optional<SanPhamQuanAo> findingSanPhamQuanAo = repository.findSanPhamQuanAoByMaSanPham(creating.getMaSanPham());
        if (findingSanPhamQuanAo.isPresent()) {
            throw new CommonException("Mã sản phẩm đã tồn tại: " + creating.getMaSanPham());
        }

        SanPhamQuanAo sanPhamQuanAo = SanPhamQuanAoCreating.toEntity(creating);

        DanhMucQuanAo danhMucQuanAo = danhMucQuanAoService.getOne(creating.getDanhMucId()).orElseThrow(
                () -> new CommonException("Danh mục quần không tồn tại id: " + creating.getDanhMucId())
        );

        Integer nguoiTaoId = SecurityContextHolder.getUser().getId();

        NguoiDung nguoiTao = nguoiDungService.getOne(nguoiTaoId).orElseThrow(
                () -> new CommonException("Người tạo không tồn tại id: " + nguoiTaoId)
        );

        sanPhamQuanAo.setDanhMuc(danhMucQuanAo);
        sanPhamQuanAo.setNguoiTao(nguoiTao);
        sanPhamQuanAo.setNgayTao(instantNow);
        sanPhamQuanAo = create(sanPhamQuanAo);
        Date now = new Date();

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
                                    .anhChinh(i == 0 ? 1 : 0)
                                    .trangThai(1)
                                    .ngayTao(instantNow)
                                    .build()
                    );

                }
            } catch (Exception e) {
                log.error("Lỗi tạo tệp tin cho quần áo: {}", creating.getTenSanPham(), e);
                throw new RuntimeException("Lỗi tạo tệp tin cho quần áo: " + creating.getTenSanPham(), e);
            }
        }


        int imageCount = 0;
        for (BienTheSanPhamCreating btspCreating : creating.getBienTheSanPhams()) {
            Optional<BienTheSanPham> findingBtsp = bienTheSanPhamService.checkExist(
                    sanPhamQuanAo.getId(),
                    btspCreating.getMauSacId(),
                    btspCreating.getSizeId(),
                    btspCreating.getMaSku(),
                    btspCreating.getMaVachSku()
            );
            if (findingBtsp.isPresent()) {
                throw new CommonException("Mã biến thể sản phẩm đã tồn tại: " + btspCreating.getMaSku());
            }

            BienTheSanPham bienTheSanPham = BienTheSanPhamCreating.toEntity(btspCreating);

            bienTheSanPham.setSanPham(sanPhamQuanAo);
            bienTheSanPham.setMauSac(mauSacService.getOne(btspCreating.getMauSacId()).orElseThrow(
                    () -> new CommonException("Không tìm thấy màu id: " + btspCreating.getMauSacId())
            ));
            bienTheSanPham.setSize(sizeService.getOne(btspCreating.getSizeId()).orElseThrow(
                    () -> new CommonException("Không tìm thấy size id: " + btspCreating.getSizeId())
            ));
            bienTheSanPham.setChatLieu(chatLieuService.getOne(btspCreating.getChatLieuId()).orElseThrow(
                    () -> new CommonException("Không tìm thấy chat lieu id: " + btspCreating.getChatLieuId())
            ));
            bienTheSanPhamService.create(bienTheSanPham);

            if (anhBienThes != null && !anhBienThes.isEmpty()) {
                try {
                    String objectName = minioService.upload(anhBienThes.get(imageCount), ITable.bien_the_san_pham + "_" + sanPhamQuanAo.getMaSanPham() + "_" + now.getTime() + "_" + imageCount++);
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
                                    .trangThai(btspCreating.getTrangThai())
                                    .ngayTao(instantNow)
                                    .build()
                    );
                } catch (Exception e) {
                    log.error("Lỗi tạo tệp tin cho biến thể quần áo: {}", btspCreating.getMaSku(), e);
                    throw new RuntimeException("Lỗi tạo tệp tin cho quần áo: " + btspCreating.getMaSku(), e);
                }
            }

        }

        sanPhamQuanAo = getOne(sanPhamQuanAo.getId()).orElseThrow(
                () -> new CommonException("Không tìm thấy sản phẩm đã tạo: " + creating.getMaSanPham())
        );

        String giaTriMoiJson;

        try {
            objectMapper.registerModule(new JavaTimeModule());
            objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            giaTriMoiJson = objectMapper.writeValueAsString(creating);
        } catch (JsonProcessingException e) {
            log.error("Lỗi json", e);
            giaTriMoiJson = "error when parse";
        }

        lichSuThayDoiService.create(
                LichSuThayDoi.builder()
                        .loaiThamChieu(ITable.san_pham_quan_ao)
                        .idThamChieu(sanPhamQuanAo.getId())
                        .kho(null)
                        .hanhDong(IHanhDong.them_moi_san_pham)
                        .giaTriCu("")
                        .giaTriMoi(giaTriMoiJson)
                        .nguoiThucHien(nguoiTao)
                        .ngayThucHien(instantNow)
                        .ghiChu("Tạo sản phẩm mới: " + sanPhamQuanAo.getTenSanPham() + " id: " + sanPhamQuanAo.getId())
                        .build()
        );

        return ResponseEntity.ok(
                ResponseData.<SanPhamQuanAoDto>builder()
                        .status(HttpStatus.OK.value())
                        .data(sanPhamQuanAoMapper.toDto(sanPhamQuanAo))
                        .message("Success")
                        .build()
        );
    }

}
