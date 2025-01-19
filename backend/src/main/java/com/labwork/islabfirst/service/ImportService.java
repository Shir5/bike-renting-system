package com.labwork.islabfirst.service;

import com.labwork.islabfirst.dto.ImportDto;
import com.labwork.islabfirst.entity.security.Import;
import com.labwork.islabfirst.entity.security.Role;
import com.labwork.islabfirst.entity.security.User;
import com.labwork.islabfirst.handler.EntityNotFoundByIdException;
import com.labwork.islabfirst.handler.EntityNotFoundByUsernameException;
import com.labwork.islabfirst.handler.NoRightsToDeleteException;
import com.labwork.islabfirst.mapper.ImportMapper;
import com.labwork.islabfirst.repository.ImportRepository;
import com.labwork.islabfirst.repository.UserRepository;
import io.minio.errors.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Objects;
import java.util.Optional;


@Service
@Transactional
@RequiredArgsConstructor
public class ImportService {


    private final ImportMapper importMapper;
    private final ImportRepository importRepository;
    private final UserRepository userRepository;
    private final MinioService minioService;  // Подключаем MinioService для работы с файлами


    @Transactional(isolation = Isolation.READ_UNCOMMITTED)
    public Page<ImportDto> findAllImportByUser(String username, Pageable pageable) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        if(Objects.equals(user.getRole().toString(), "ADMIN")){
            return importRepository.findAll(pageable).map(importMapper::toDto);
        }
       return importRepository.findAllByUserId(user.getId(), pageable).map(importMapper::toDto);
    }

    // Метод для удаления импорта
    @Transactional
    public void deleteImport(Long id) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        Import importEntity = importRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundByIdException(Import.class, id));

        if (!hasEditRights(id)) {
            throw new NoRightsToDeleteException("No right to delete import");
        }
        // Удаляем файл из MinIO
        minioService.deleteFile("is-lab", importEntity.getId() + ".json");

        // Удаляем запись импорта из базы данных
        importRepository.delete(importEntity);
    }
    public boolean hasEditRights(Long importId) {
        // Получаем импорт по ID
        Import importEntity = importRepository.findById(importId)
                .orElseThrow(() -> new EntityNotFoundByIdException(Import.class, importId));

        // Получаем текущего пользователя
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        // Проверяем, что пользователь является владельцем импорта
        return importEntity.getUserId().equals(currentUser.getId()) || currentUser.getRole().equals("ADMIN");
    }


}
