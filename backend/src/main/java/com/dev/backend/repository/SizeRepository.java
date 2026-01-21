package com.dev.backend.repository;

import com.dev.backend.entities.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SizeRepository extends JpaRepository<Size, Integer>, JpaSpecificationExecutor<Size> {
    Optional<Size> findByMaSize(String maSize);
}