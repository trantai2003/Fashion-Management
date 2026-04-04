package com.dev.backend.repository;

import com.dev.backend.entities.MauSac;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MauSacRepository extends JpaRepository<MauSac, Integer>, JpaSpecificationExecutor<MauSac> {
    boolean existsByMaMau(String maMau);
    boolean existsByTenMau(String tenMau);
    boolean existsByMaMauHex(String maMauHex);
}