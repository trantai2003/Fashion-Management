package com.dev.backend.repository;

import com.dev.backend.entities.NhaCungCap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NhaCungCapRepository extends JpaRepository<NhaCungCap, Integer>, JpaSpecificationExecutor<NhaCungCap> {

    // Search theo mã hoặc tên (không phân biệt hoa/thường)
    List<NhaCungCap> findByMaNhaCungCapContainingIgnoreCaseOrTenNhaCungCapContainingIgnoreCase(
            String maNhaCungCap, String tenNhaCungCap);

    // Kiểm tra trùng mã khi tạo mới
    boolean existsByMaNhaCungCap(String maNhaCungCap);
}