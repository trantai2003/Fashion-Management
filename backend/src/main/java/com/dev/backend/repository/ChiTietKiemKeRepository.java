package com.dev.backend.repository;

import com.dev.backend.entities.ChiTietKiemKe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietKiemKeRepository extends JpaRepository<ChiTietKiemKe, Integer> {

    List<ChiTietKiemKe> findByDotKiemKeId(Integer dotKiemKeId);
}