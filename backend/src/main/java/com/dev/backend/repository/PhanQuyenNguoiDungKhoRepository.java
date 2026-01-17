package com.dev.backend.repository;

import com.dev.backend.entities.PhanQuyenNguoiDungKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PhanQuyenNguoiDungKhoRepository extends JpaRepository<PhanQuyenNguoiDungKho, Integer>, JpaSpecificationExecutor<PhanQuyenNguoiDungKho> {
}