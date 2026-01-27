package com.dev.backend.repository;

import com.dev.backend.entities.PhanQuyenNguoiDungKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhanQuyenNguoiDungKhoRepository extends JpaRepository<PhanQuyenNguoiDungKho, Integer>, JpaSpecificationExecutor<PhanQuyenNguoiDungKho> {


    @Query("""
            SELECT pqndk  FROM PhanQuyenNguoiDungKho pqndk  WHERE
                        pqndk.nguoiDung.id = :nguoiDungId AND pqndk.trangThai = 1
                                    AND (pqndk.ngayKetThuc IS NULL OR pqndk.ngayKetThuc > CURRENT_TIMESTAMP)
            """)
    List<PhanQuyenNguoiDungKho> findByNguoiDungIdAndActive(@Param("nguoiDungId") Integer nguoiDungId);

    Optional<PhanQuyenNguoiDungKho> findByNguoiDungIdAndKhoId(Integer nguoiDungId, Integer khoId);
}