package com.dev.backend.services.impl.entities;

import com.dev.backend.dto.request.DanhMucQuanAoCreating;
import com.dev.backend.dto.request.DanhMucQuanAoUpdating;
import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.entities.DanhMucQuanAo;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.repository.DanhMucQuanAoRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

// Luồng: Frontend → Controller → Service (tại đây) → Repository → DB → ResponseData → Frontend
@Service
public class DanhMucQuanAoService extends BaseServiceImpl<DanhMucQuanAo, Integer> {

    // Dùng cho các truy vấn JPQL tuỳ chỉnh ngoài phạm vi JpaRepository
    @Autowired
    private EntityManager entityManager;

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    // Truyền repository vào BaseServiceImpl để kế thừa CRUD chung (getOne, save, delete...)
    public DanhMucQuanAoService(DanhMucQuanAoRepository repository) {
        super(repository);
    }

    // Cast sang kiểu cụ thể để gọi các method tuỳ chỉnh của DanhMucQuanAoRepository
    public final DanhMucQuanAoRepository danhMucQuanAoRepository = (DanhMucQuanAoRepository) getRepository();

    // READ – Trả danh sách danh mục cha theo trạng thái → dùng cho API get-cay-danh-muc
    public List<DanhMucQuanAo> findAllDanhMucChaByTrangThai(Integer trangThai) {
        // Repository sinh SQL: SELECT * FROM danh_muc_quan_ao WHERE danh_muc_cha_id IS NULL AND trang_thai = ?
        return danhMucQuanAoRepository.findAllDanhMucChaByTrangThai(trangThai);
    }

    // CREATE – Tạo mới danh mục; @Transactional rollback toàn bộ nếu bất kỳ bước nào thất bại
    @Transactional
    public ResponseEntity<ResponseData<String>> create(DanhMucQuanAoCreating creating) {

        // Bước 1 – Kiểm tra trùng mã: Repository sinh SQL SELECT WHERE ma_danh_muc = ?
        Optional<DanhMucQuanAo> findingDanhMucQuanAo = danhMucQuanAoRepository
                .findByMaDanhMuc(creating.getMaDanhMuc());
        if (findingDanhMucQuanAo.isPresent()) {
            // Mã đã tồn tại → ném exception → GlobalExceptionHandler trả 400 cho Frontend
            throw new CommonException("Mã danh mục đã tồn tại");
        }

        // Bước 2 – Map RequestDTO → Entity (không nhận Entity trực tiếp từ FE để tránh lỗ hổng bảo mật)
        DanhMucQuanAo danhMucQuanAo = new DanhMucQuanAo();
        danhMucQuanAo.setMaDanhMuc(creating.getMaDanhMuc());
        danhMucQuanAo.setTenDanhMuc(creating.getTenDanhMuc());
        danhMucQuanAo.setMoTa(creating.getMoTa());
        danhMucQuanAo.setTrangThai(creating.getTrangThai());

        // Bước 3 – Xử lý quan hệ cha-con: có cha → kiểm tra cha tồn tại; null → danh mục gốc
        if (creating.getDanhMucChaId() != null) {
            // Repository sinh SQL: SELECT * FROM danh_muc_quan_ao WHERE id = ?
            DanhMucQuanAo danhMucCha = getOne(creating.getDanhMucChaId()).orElseThrow(
                    () -> new CommonException("Danh mục cha không tồn tại id: " + creating.getDanhMucChaId())
            );
            danhMucQuanAo.setDanhMucCha(danhMucCha);
        } else {
            danhMucQuanAo.setDanhMucCha(null); // null = danh mục gốc, không có cha
        }

        // Bước 4 – Lưu vào DB: Hibernate sinh SQL INSERT INTO danh_muc_quan_ao(...)
        danhMucQuanAoRepository.save(danhMucQuanAo);

        // Bước 5 – Trả ResponseData về Controller → FE nhận status=200 → toast.success + reload cây
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Success")
                        .message("Success")
                        .build()
        );
    }

    // UPDATE – Cập nhật thông tin danh mục (sửa thông tin, đổi cha, khoá/mở khoá, drag & drop về root)
    @Transactional
    public ResponseEntity<ResponseData<String>> update(DanhMucQuanAoUpdating updating) {

        // Bước 1 – Kiểm tra danh mục cần cập nhật có tồn tại không; không có → ném exception 400
        DanhMucQuanAo danhMucQuanAo = getOne(updating.getId()).orElseThrow(
                () -> new CommonException("Không tìm thấy danh mục id: " + updating.getId())
        );

        // Bước 2 – Validate và xử lý quan hệ cha-con
        if (updating.getDanhMucChaId() != null) {

            if (updating.getDanhMucChaId().equals(updating.getId())) {
                throw new CommonException("Không thể gán danh mục cha cho chính nó");
            }

            // Kiểm tra danh mục cha tồn tại trong DB
            DanhMucQuanAo danhMucCha = getOne(updating.getDanhMucChaId()).orElseThrow(
                    () -> new CommonException("Danh mục cha không tồn tại id: " + updating.getDanhMucChaId())
            );

            // Không cho phép gán cha đang bị khoá (trangThai = 0)
            if (danhMucCha.getTrangThai() == 0) {
                throw new CommonException("Danh mục cha đã bị xoá");
            }
            danhMucQuanAo.setDanhMucCha(danhMucCha);
        } else {
            danhMucQuanAo.setDanhMucCha(null); // null = chuyển về danh mục gốc (dùng khi drag & drop về root)
        }

        // Bước 3 – Cập nhật các trường từ RequestDTO vào Entity đang được JPA quản lý
        danhMucQuanAo.setTenDanhMuc(updating.getTenDanhMuc());
        danhMucQuanAo.setMoTa(updating.getMoTa());
        danhMucQuanAo.setTrangThai(updating.getTrangThai()); // 1 = hoạt động, 0 = ngừng hoạt động (khoá)

        // Bước 4 – Lưu vào DB: Hibernate sinh SQL UPDATE danh_muc_quan_ao SET ... WHERE id=?
        danhMucQuanAoRepository.save(danhMucQuanAo);

        // Bước 5 – Trả ResponseData về Controller → FE nhận status=200 → toast.success + reload cây
        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .status(HttpStatus.OK.value())
                        .data("Success")
                        .message("Cập nhật danh mục thành công")
                        .build()
        );
    }

}
