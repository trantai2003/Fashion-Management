package com.dev.backend.repository;

import com.dev.backend.entities.CanhBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CanhBaoRepository extends JpaRepository<CanhBao, Integer>, JpaSpecificationExecutor<CanhBao> {
}