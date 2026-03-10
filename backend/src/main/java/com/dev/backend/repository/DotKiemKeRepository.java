// src/main/java/com/dev/backend/repository/DotKiemKeRepository.java
package com.dev.backend.repository;

import com.dev.backend.entities.DotKiemKe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DotKiemKeRepository extends JpaRepository<DotKiemKe, Integer> {

    @Query("SELECT d FROM DotKiemKe d LEFT JOIN FETCH d.kho LEFT JOIN FETCH d.nguoiChuTri ORDER BY d.ngayTao DESC")
    List<DotKiemKe> findAllWithDetails();

    @Query("SELECT d FROM DotKiemKe d LEFT JOIN FETCH d.kho WHERE d.kho.id = :khoId ORDER BY d.ngayTao DESC")
    List<DotKiemKe> findByKhoId(@Param("khoId") Integer khoId);
}