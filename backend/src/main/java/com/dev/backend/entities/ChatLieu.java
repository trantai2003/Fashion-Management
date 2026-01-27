package com.dev.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "chat_lieu")
public class ChatLieu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 50)
    @NotNull
    @Column(name = "ma_chat_lieu", nullable = false, length = 50)
    private String maChatLieu;

    @Size(max = 100)
    @NotNull
    @Column(name = "ten_chat_lieu", nullable = false, length = 100)
    private String tenChatLieu;

    
    @Column(name = "mo_ta")
    private String moTa;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "ngay_tao")
    @Generated(event = EventType.INSERT)
    private Instant ngayTao;


}