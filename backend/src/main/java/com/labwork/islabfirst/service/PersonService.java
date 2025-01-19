package com.labwork.islabfirst.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.labwork.islabfirst.dto.ImportDto;
import com.labwork.islabfirst.dto.MovieDto;
import com.labwork.islabfirst.dto.PersonDto;
import com.labwork.islabfirst.dto.request.CreateMovieRequest;
import com.labwork.islabfirst.dto.request.CreatePersonRequest;
import com.labwork.islabfirst.dto.request.UpdateMovieRequest;
import com.labwork.islabfirst.dto.request.UpdatePersonRequest;
import com.labwork.islabfirst.entity.security.Import;
import com.labwork.islabfirst.entity.security.ImportType;
import com.labwork.islabfirst.entity.security.OperationStatus;
import com.labwork.islabfirst.entity.security.User;
import com.labwork.islabfirst.handler.EntityNotFoundByIdException;
import com.labwork.islabfirst.handler.EntityNotFoundByUsernameException;
import com.labwork.islabfirst.handler.PersonInUseException;
import com.labwork.islabfirst.handler.UniqueConstraintViolationException;
import com.labwork.islabfirst.mapper.ImportMapper;
import com.labwork.islabfirst.mapper.MovieMapper;
import com.labwork.islabfirst.mapper.PersonMapper;
import com.labwork.islabfirst.entity.model.Movie;
import com.labwork.islabfirst.entity.model.Person;
import com.labwork.islabfirst.repository.ImportRepository;
import com.labwork.islabfirst.repository.MovieRepository;
import com.labwork.islabfirst.repository.PersonRepository;
import com.labwork.islabfirst.repository.UserRepository;

import io.minio.errors.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class PersonService {
    private final PersonRepository personRepository;
    private final PersonMapper personMapper;
    private final SimpMessagingTemplate messagingTemplate;  // Внедрение SimpMessagingTemplate
    private final MovieRepository movieRepository;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final ImportRepository importRepository;
    private final ImportMapper importMapper;
    private final MinioService minioService;
    private final PlatformTransactionManager transactionManager;
    private final ImportService importService;


    public Page<PersonDto> findAllWithFilters(String name, Pageable pageable) {
        if (name != null) {
            return personRepository.findAllByName(name, pageable).map(personMapper::toDto);
        }

        return personRepository.findAll(pageable).map(personMapper::toDto);
    }


    @Transactional(isolation = Isolation.SERIALIZABLE)
    public PersonDto create(CreatePersonRequest request) {
        var person = personMapper.toEntity(request);
        person.setCreatedBy(getCurrentUser());

        // Проверка уникальности с блокировкой
        checkAndLockExisting(person.getName());

        var saved = personRepository.save(person);

        messagingTemplate.convertAndSend("/topic/newPerson", personMapper.toDto(saved));
        return personMapper.toDto(saved);
    }

    private void checkAndLockExisting(String name) {
        if (personRepository.existsByName(name)) {
            throw new UniqueConstraintViolationException(Person.class, "name", name);
        }
    }



    public String getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            return authentication.getName();  // Возвращает имя пользователя
        }
        return "unknown";  // Если аутентификация не установлена, возвращаем "unknown"
    }
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public PersonDto update(Long id, UpdatePersonRequest request) {

        var original = personRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundByIdException(Person.class, id));
        var updated = personMapper.toEntity(request);
        var existing = personRepository.existsByName(updated.getName());
        if (existing) {
            throw new UniqueConstraintViolationException(Person.class, "name", updated.getName());
        }
        updated.setId(id);
        updated.setOwner(original.getOwner());

        updated.setCreatedBy(original.getCreatedBy());
        updated.setUpdatedBy(getCurrentUser());
        var saved = personRepository.save(updated);
        messagingTemplate.convertAndSend("/topic/updatePerson", personMapper.toDto(saved));

        return personMapper.toDto(saved);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public ImportDto importFile(MultipartFile file) throws Exception {
        // Создание лога импорта
        Import importLog = new Import();
        TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());
        Long fileId = 0L;
        try {


            // Парсим содержимое файла из потока
            List<CreatePersonRequest> requests = parseFile(file);

            // Импортируем людей
            List<Person> persons = importPersons(requests);




            // Обновляем статус лога импорта
            User user = userRepository.findByUsername(getCurrentUser())
                    .orElseThrow(() -> new EntityNotFoundByUsernameException(Person.class, getCurrentUser()));

            importLog.setUserId(user.getId());
            importLog.setStatus(OperationStatus.SUCCESS);
            importLog.setImportType(ImportType.PersonImport);
            importLog.setAddedObjects((long) requests.size());


            var saved = importRepository.save(importLog);
            fileId = saved.getId();

            // Загружаем файл в MinIO и получаем имя файла
            uploadToMinio(saved.getId() ,file);
            persons.forEach(person -> messagingTemplate.convertAndSend("/topic/newPerson", personMapper.toDto(person)));
            transactionManager.commit(status);
            // transactioj
            return importMapper.toDto(saved);
        } catch (RuntimeException e) {
            transactionManager.rollback(status);

            if(!fileId.equals(0L)){
                importService.deleteImport(fileId);
            }

            throw new RuntimeException("Error during file import: " + e.getMessage(), e);
        }
    }



    private List<CreatePersonRequest> parseFile(MultipartFile file) {
        try {
            return objectMapper.readValue(file.getBytes(), TypeFactory.defaultInstance().constructCollectionType(List.class, CreatePersonRequest.class));
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid JSON file format", e);
        } catch (IOException e) {
            throw new RuntimeException("Error reading JSON file", e);
        }
    }


    // parse file json + csv + ...
    private List<Person> importPersons(List<CreatePersonRequest> requests) {
        // Преобразуем запросы в сущности
        List<Person> persons = requests.stream()
                .map(personMapper::toEntity)
                .peek(person -> person.setCreatedBy(getCurrentUser())) // Устанавливаем текущего пользователя как owner
                .toList();


// Проверка уникальности имени перед сохранением
        for (Person person : persons) {
            if (personRepository.existsByName(person.getName())) {
                throw new UniqueConstraintViolationException(Person.class, "name", person.getName());
            }
        }
        // Сохраняем все сущности в базу данных
        personRepository.saveAll(persons);
        return persons;
    }



    public PersonDto findById(Long id) {
        return personRepository.findById(id)
                .map(personMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundByIdException(Person.class, id));
    }
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void delete(Long id) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundByIdException(Person.class, id));
        boolean isPersonInUse = movieRepository.existsByDirectorIdOrScreenwriterIdOrOperatorId(id, id, id);
        if (isPersonInUse) {
            throw new PersonInUseException(id.toString());
        }

        personRepository.deleteById(id); // Попытка удалить Person
        messagingTemplate.convertAndSend("/topic/deletePerson", id); // Уведомление через WebSocket

    }



    public Page<PersonDto> findAllByNameContaining(String substring, Pageable pageable) {
        return  personRepository.findAllByNameContaining(substring, pageable).map(personMapper::toDto);
    }


    public String uploadToMinio(Long id,MultipartFile file) throws IOException {
        String fileName = id.toString() + ".json";
        try (InputStream inputStream = file.getInputStream()) {
            String contentType = file.getContentType();
            minioService.uploadFile("is-lab", fileName, inputStream, contentType);
        }
        return fileName;
    }



}
