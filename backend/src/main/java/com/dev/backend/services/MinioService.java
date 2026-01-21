package com.dev.backend.services;

import com.dev.backend.dto.response.FileObjectInfo;
import io.minio.MinioClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;

public interface MinioService {
    String upload(MultipartFile file) throws Exception;
    String upload(MultipartFile file, String objectName) throws Exception;
    byte[] download(String objectName) throws Exception;
    boolean delete(String objectName);
    List<String> list(String prefix) throws Exception;
    boolean exists(String objectName);
    String getPublicUrl(String objectName);
    String generatePresignedUploadUrl(String objectName, int expirySeconds) throws Exception;
    String generatePresignedDownloadUrl(String objectName, int expirySeconds) throws Exception;

    InputStream getObjectRange(String objectName, Long start, Long end) throws Exception;
    String getBucketName();
    MinioClient getMinioClient();

    FileObjectInfo getObjectInfo(String objectName) throws Exception;
}
