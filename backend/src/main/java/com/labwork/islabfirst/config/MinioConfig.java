package com.labwork.islabfirst.config;


import io.minio.MinioClient;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {


    @Bean
    public static MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint("http://127.0.0.1:9000") // URL MinIO
                .credentials("VCEd98RRwV6as7uf05Cb", "hRYg4Wo02LTglMDQTshXUHYc72VAphyGZScE8ySM") // Ваши ключи доступа
                .build();
    }
}

