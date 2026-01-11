package com.dev.backend.services.impl.entities;

import com.dev.backend.entities.ChatLieu;
import com.dev.backend.repository.ChatLieuRepository;
import com.dev.backend.services.impl.BaseServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatLieuService extends BaseServiceImpl<ChatLieu, Integer> {
    //Khởi tạo quản lý vòng đời entities
    @Autowired
    private EntityManager entityManager;


    @Override
    protected EntityManager getEntityManager() {
        return entityManager;
    }

    public ChatLieuService(ChatLieuRepository repository) {
        super(repository);
    }
}
