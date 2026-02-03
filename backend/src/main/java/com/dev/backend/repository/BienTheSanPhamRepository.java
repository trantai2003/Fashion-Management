package com.dev.backend.repository;

import com.dev.backend.entities.BienTheSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BienTheSanPhamRepository extends JpaRepository<BienTheSanPham, Integer>, JpaSpecificationExecutor<BienTheSanPham> {


    @Query(
            """
                    SELECT btsp FROM BienTheSanPham btsp
                                        WHERE (btsp.sanPham.id = :sanPhamId AND btsp.mauSac.id = :mauSacId AND btsp.size.id = :sizeId)
                                                            OR btsp.maSku = :maSku
                                                                                OR btsp.maVachSku = :maVachSku
                    """
    )
    Optional<BienTheSanPham> checkExist(
            @Param("sanPhamId") Integer sanPhamId,
            @Param("mauSacId") Integer mauSacId,
            @Param("sizeId") Integer sizeId,
            @Param("maSku") String maSku,
            @Param("maVachSku") String maVachSku
    );
}