package com.labwork.islabfirst.service;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.InputStream;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import io.minio.*;
import io.minio.errors.*;

@Service
@Transactional
@RequiredArgsConstructor
public class MinioService {


    private final MinioClient minioClient; // Убедитесь, что MinioClient внедряется

    @Transactional
    public void uploadFile(String bucketName, String objectName, InputStream inputStream, String contentType) {
        try {

            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(inputStream, inputStream.available(), -1)
                            .contentType(contentType)
                            .build());

        } catch (Exception e) {

            throw new RuntimeException("Error occurred: " + e.getMessage(), e);
        }
    }

    public InputStream downloadFile(String bucketName, String objectName) {
        try {

            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
        } catch (Exception e) {

            throw new RuntimeException("Error occurred while downloading file: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String bucketName, String objectName) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {

        minioClient.removeObject(RemoveObjectArgs.builder()
                .bucket(bucketName)
                .object(objectName)
                .build());

    }

}
