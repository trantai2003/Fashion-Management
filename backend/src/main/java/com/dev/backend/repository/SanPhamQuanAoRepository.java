package com.dev.backend.repository;

import com.dev.backend.entities.SanPhamQuanAo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SanPhamQuanAoRepository extends JpaRepository<SanPhamQuanAo, Integer>, JpaSpecificationExecutor<SanPhamQuanAo> {

    Optional<SanPhamQuanAo> findSanPhamQuanAoByMaSanPham(String maSanPham);
    @Query("SELECT s FROM SanPhamQuanAo s " +
            "LEFT JOIN FETCH s.danhMuc d " +
            "LEFT JOIN FETCH d.danhMucCha " +
            "WHERE s.id = :id")
    Optional<SanPhamQuanAo> findDetailById(@Param("id") Integer id);

}