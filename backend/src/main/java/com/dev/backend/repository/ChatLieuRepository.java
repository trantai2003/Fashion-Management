package com.dev.backend.repository;

import com.dev.backend.entities.ChatLieu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatLieuRepository extends JpaRepository<ChatLieu, Integer>, JpaSpecificationExecutor<ChatLieu> {

    // Thêm method này để search theo ma hoặc ten (không phân biệt hoa/thường)
    List<ChatLieu> findByMaChatLieuContainingIgnoreCaseOrTenChatLieuContainingIgnoreCase(
            String maChatLieu, String tenChatLieu);
}