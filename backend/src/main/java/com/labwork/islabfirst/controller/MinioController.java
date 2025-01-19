package com.labwork.islabfirst.controller;


import com.labwork.islabfirst.service.MinioService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@RestController
@RequestMapping("api/minio")
@RequiredArgsConstructor
public class MinioController {

    private final MinioService minioService;

    @GetMapping("/download/{id}")
    public ResponseEntity<InputStreamResource> downloadFile(@PathVariable String id) {
        try {
            // Загружаем файл из MinIO по id
            InputStream fileStream = minioService.downloadFile("is-lab", id + ".json");

            // Устанавливаем заголовки для скачивания
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setContentDispositionFormData("attachment", id + ".json");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(new InputStreamResource(fileStream));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }


}
