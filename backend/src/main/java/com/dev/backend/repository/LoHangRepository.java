package com.dev.backend.repository;

import com.dev.backend.entities.LoHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface LoHangRepository extends JpaRepository<LoHang, Integer>, JpaSpecificationExecutor<LoHang> {
}