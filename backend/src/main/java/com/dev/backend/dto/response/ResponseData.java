package com.dev.backend.dto.response;

import com.dev.backend.config.SecurityContextHolder;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResponseData<T> implements Serializable {
    int status;
    T data;
    String error;
    String message;
    @Builder.Default
    Date timestamp = new Date();
    @Builder.Default
    String path = SecurityContextHolder.getPath();

    public ResponseData(int status, T data, String error, String message) {
        this.status = status;
        this.data = data;
        this.error = error;
        this.message = message;
        this.timestamp = new Date();
    }

    public ResponseData(int status, T data, String error, String message, String path) {
        this.status = status;
        this.data = data;
        this.error = error;
        this.message = message;
        this.path = path;
        this.timestamp = new Date();
    }
}
