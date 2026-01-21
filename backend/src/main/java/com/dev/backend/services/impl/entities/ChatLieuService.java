package com.dev.backend.services.impl.entities;

import com.dev.backend.dto.request.ChatLieuCreating;
import com.dev.backend.dto.request.ChatLieuUpdating;
import com.dev.backend.dto.response.entities.ChatLieuDto;
import com.dev.backend.entities.ChatLieu;
import com.dev.backend.mapper.ChatLieuMapper;
import com.dev.backend.repository.ChatLieuRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatLieuService extends BaseServiceImpl<ChatLieu, Integer> {

    private final ChatLieuRepository repository;
    private final ChatLieuMapper mapper;
    private final EntityManager entityManager;

    @Autowired
    public ChatLieuService(ChatLieuRepository repository,
                           ChatLieuMapper mapper,
                           EntityManager entityManager) {
        super(repository);
        this.repository = repository;
        this.mapper = mapper;
        this.entityManager = entityManager;
    }

    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public List<ChatLieuDto> findAll(String searchKeyword) {
        if (searchKeyword == null || searchKeyword.trim().isEmpty()) {
            return repository.findAll().stream()
                    .map(mapper::toDto)
                    .collect(Collectors.toList());
        }

        List<ChatLieu> entities = repository.findByMaChatLieuContainingIgnoreCaseOrTenChatLieuContainingIgnoreCase(
                searchKeyword, searchKeyword);
        return mapper.toDtoList(entities);
    }

    public ChatLieuDto findByIdDto(Integer id) {
        ChatLieu entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chất liệu với ID: " + id));
        return mapper.toDto(entity);
    }

    @Transactional
    public ChatLieuDto create(ChatLieuCreating creating) {
        // Kiểm tra trùng mã chất liệu
        if (repository.existsByMaChatLieu(creating.getMaChatLieu())) {
            throw new IllegalArgumentException("Mã chất liệu '" + creating.getMaChatLieu() + "' đã tồn tại. Vui lòng chọn mã khác.");
        }

        ChatLieu entity = mapper.toEntity(creating);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Transactional
    public ChatLieuDto update(Integer id, ChatLieuUpdating updating) {
        ChatLieu entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chất liệu với ID: " + id));

        mapper.partialUpdate(updating, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Transactional
    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy chất liệu với ID: " + id);
        }
        repository.deleteById(id);
    }
}