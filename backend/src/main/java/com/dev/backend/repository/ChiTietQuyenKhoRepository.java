package com.dev.backend.repository;

import com.dev.backend.entities.ChiTietQuyenKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChiTietQuyenKhoRepository extends JpaRepository<ChiTietQuyenKho, Integer>, JpaSpecificationExecutor<ChiTietQuyenKho> {

    Optional<ChiTietQuyenKho> findByPhanQuyenNguoiDungKhoIdAndQuyenHanId(Integer khoId, Integer quyenHanId);
}