package com.dev.backend.repository;

import com.dev.backend.entities.Kho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface KhoRepository extends JpaRepository<Kho, Integer>, JpaSpecificationExecutor<Kho> {
}