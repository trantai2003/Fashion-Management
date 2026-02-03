package com.dev.backend.repository;

import com.dev.backend.entities.SanPhamQuanAo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SanPhamQuanAoRepository extends JpaRepository<SanPhamQuanAo, Integer>, JpaSpecificationExecutor<SanPhamQuanAo> {


    Optional<SanPhamQuanAo> findSanPhamQuanAoByMaSanPham(String maSanPham);
}