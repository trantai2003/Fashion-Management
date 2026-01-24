package com.dev.backend.dto.response;

<<<<<<< HEAD
import com.dev.backend.config.SecurityContextHolder;
=======
>>>>>>> 233a830ef9af045888f8bb98f7f67dfda98a9879
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
<<<<<<< HEAD
    @Builder.Default
    String path = SecurityContextHolder.getPath();
=======
    String path;
>>>>>>> 233a830ef9af045888f8bb98f7f67dfda98a9879

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
