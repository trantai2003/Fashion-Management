package com.dev.backend.services.impl.entities;

import com.dev.backend.dto.request.NhaCungCapCreating;
import com.dev.backend.dto.request.NhaCungCapUpdating;
import com.dev.backend.dto.response.entities.NhaCungCapDto;
import com.dev.backend.entities.NhaCungCap;
import com.dev.backend.mapper.NhaCungCapMapper;
import com.dev.backend.repository.NhaCungCapRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý nghiệp vụ cho entity Nhà Cung Cấp
 * Kế thừa BaseServiceImpl để dùng các chức năng CRUD chung
 */
@Service
public class NhaCungCapService extends BaseServiceImpl<NhaCungCap, Integer> {

    // Repository thao tác với database
    private final NhaCungCapRepository repository;

    // Mapper dùng để convert giữa Entity <-> DTO
    private final NhaCungCapMapper mapper;

    // EntityManager dùng cho BaseServiceImpl (query động, paging, sort...)
    private final EntityManager entityManager;

    @Autowired
    public NhaCungCapService(NhaCungCapRepository repository,
                             NhaCungCapMapper mapper,
                             EntityManager entityManager) {
        // Truyền repository lên class cha
        super(repository);
        this.repository = repository;
        this.mapper = mapper;
        this.entityManager = entityManager;
    }

    /**
     * Override EntityManager cho BaseServiceImpl sử dụng
     */
    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    /**
     * Lấy danh sách nhà cung cấp
     * - Nếu không có keyword: lấy tất cả
     * - Nếu có keyword: tìm theo mã hoặc tên (không phân biệt hoa thường)
     */
    public List<NhaCungCapDto> findAll(String searchKeyword) {
        // Trường hợp không tìm kiếm
        if (searchKeyword == null || searchKeyword.trim().isEmpty()) {
            return repository.findAll().stream()
                    .map(mapper::toDto) // Convert Entity -> DTO
                    .collect(Collectors.toList());
        }

        // Trường hợp có keyword tìm kiếm
        List<NhaCungCap> entities =
                repository.findByMaNhaCungCapContainingIgnoreCaseOrTenNhaCungCapContainingIgnoreCase(
                        searchKeyword, searchKeyword);

        return mapper.toDtoList(entities);
    }

    /**
     * Tìm nhà cung cấp theo ID và trả về DTO
     */
    public NhaCungCapDto findByIdDto(Integer id) {
        NhaCungCap entity = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + id)
                );

        return mapper.toDto(entity);
    }

    /**
     * Tạo mới nhà cung cấp
     * - Check trùng mã nhà cung cấp
     * - Lưu entity
     * - Trả về DTO
     */
    @Transactional
    public NhaCungCapDto create(NhaCungCapCreating creating) {

        // Kiểm tra mã nhà cung cấp đã tồn tại chưa
        if (repository.existsByMaNhaCungCap(creating.getMaNhaCungCap())) {
            throw new IllegalArgumentException(
                    "Mã nhà cung cấp '" + creating.getMaNhaCungCap() + "' đã tồn tại. Vui lòng chọn mã khác."
            );
        }

        // Convert DTO tạo mới -> Entity
        NhaCungCap entity = mapper.toEntity(creating);

        // Lưu vào database
        entity = repository.save(entity);

        // Trả về DTO
        return mapper.toDto(entity);
    }

    /**
     * Cập nhật nhà cung cấp theo ID
     * - Nếu không tồn tại thì throw exception
     * - Chỉ update các field có trong request (partial update)
     */
    @Transactional
    public NhaCungCapDto update(Integer id, NhaCungCapUpdating updating) {

        // Lấy entity hiện tại
        NhaCungCap entity = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + id)
                );

        // Update từng field (null sẽ không ghi đè)
        mapper.partialUpdate(updating, entity);

        // Lưu lại entity sau khi update
        entity = repository.save(entity);

        return mapper.toDto(entity);
    }

    /**
     * Xóa nhà cung cấp theo ID
     */
    @Transactional
    public void delete(Integer id) {

        // Kiểm tra tồn tại trước khi xóa
        if (!repository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + id);
        }

        repository.deleteById(id);
    }
}
