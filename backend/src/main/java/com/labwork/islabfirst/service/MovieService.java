package com.labwork.islabfirst.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.labwork.islabfirst.dto.ImportDto;
import com.labwork.islabfirst.dto.MovieDto;
import com.labwork.islabfirst.dto.PersonDto;
import com.labwork.islabfirst.dto.request.CreateMovieRequest;
import com.labwork.islabfirst.dto.request.CreatePersonRequest;
import com.labwork.islabfirst.dto.request.UpdateMovieRequest;
import com.labwork.islabfirst.entity.security.Import;
import com.labwork.islabfirst.entity.security.ImportType;
import com.labwork.islabfirst.entity.security.OperationStatus;
import com.labwork.islabfirst.handler.EntityNotFoundByIdException;
import com.labwork.islabfirst.handler.EntityNotFoundByUsernameException;
import com.labwork.islabfirst.handler.UniqueConstraintViolationException;
import com.labwork.islabfirst.mapper.ImportMapper;
import com.labwork.islabfirst.mapper.MovieMapper;
import com.labwork.islabfirst.entity.model.Movie;
import com.labwork.islabfirst.entity.model.MovieGenre;
import com.labwork.islabfirst.entity.model.Person;
import com.labwork.islabfirst.entity.security.User;
import com.labwork.islabfirst.repository.ImportRepository;
import com.labwork.islabfirst.repository.MovieRepository;
import com.labwork.islabfirst.repository.PersonRepository;
import com.labwork.islabfirst.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.antlr.v4.runtime.misc.LogManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Objects;


@Service
@Transactional
@RequiredArgsConstructor
public class MovieService {
    private final MovieRepository movieRepository;
    private final PersonRepository personRepository;
    private final MovieMapper movieMapper;
    private final SimpMessagingTemplate messagingTemplate;  // Внедрение SimpMessagingTemplate
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final ImportMapper importMapper;
    private final ImportRepository importRepository;
    private final MinioService minioService;
    private final PlatformTransactionManager transactionManager;
    private final ImportService importService;

    public Page<MovieDto> findAllWithFilters(String name, Pageable pageable) {
        if (name != null) {
            return movieRepository.findAllByName(name, pageable).map(movieMapper::toDto);
        }
        return movieRepository.findAll(pageable).map(movieMapper::toDto);
    }
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public MovieDto create(CreateMovieRequest request) {
        var movie = movieMapper.toEntity(request);
        if(request.directorID() != null){
            Person person = personRepository.findById(request.directorID())
                    .orElseThrow(() -> new EntityNotFoundByIdException(Person.class, request.directorID()));
            movie.setDirector(person);
        } else {
            movie.setDirector(null);
        }
        if(request.operatorID() != null){
            Person person = personRepository.findById(request.operatorID())
                    .orElseThrow(() -> new EntityNotFoundByIdException(Person.class, request.operatorID()));
            movie.setOperator(person);
        } else {
            movie.setOperator(null);
        }
        if(request.screenwriterID() != null){
            Person person = personRepository.findById(request.screenwriterID())
                    .orElseThrow(() -> new EntityNotFoundByIdException(Person.class, request.screenwriterID()));
            movie.setScreenwriter(person);
        } else {
            movie.setScreenwriter(null);
        }
        var existing = movieRepository.existsByName(movie.getName());
        if (existing) {
            throw new UniqueConstraintViolationException(Person.class, "name", movie.getName());
        }

        movie.setCreatedBy(getCurrentUser());

        var saved = movieRepository.save(movie);
        messagingTemplate.convertAndSend("/topic/newMovie", movieMapper.toDto(saved));

        return movieMapper.toDto(saved);
    }
    public MovieDto findById(Long id) {
        return movieRepository.findById(id)
                .map(movieMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundByIdException(Movie.class, id));
    }



    public String getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            return authentication.getName();  // Возвращает имя пользователя
        }
        return "unknown";  // Если аутентификация не установлена, возвращаем "unknown"
    }
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public MovieDto update(Long id, UpdateMovieRequest request) {
        var movie = movieMapper.toEntity(request);
        var original = movieRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundByIdException(Person.class, id));
        movie.setId(id);
        movie.setOwner(original.getOwner());
        if(request.directorID() != null){
            Person person = personRepository.findById(request.directorID())
                    .orElseThrow(() -> new EntityNotFoundByIdException(Person.class, request.directorID()));
            movie.setDirector(person);
        } else {
            movie.setDirector(null);
        }
        if(request.operatorID() != null){
            Person person = personRepository.findById(request.operatorID())
                    .orElseThrow(() -> new EntityNotFoundByIdException(Person.class, request.operatorID()));
            movie.setOperator(person);
        } else {
            movie.setOperator(null);
        }
        if(request.screenwriterID() != null){
            Person person = personRepository.findById(request.screenwriterID())
                    .orElseThrow(() -> new EntityNotFoundByIdException(Person.class, request.screenwriterID()));
            movie.setScreenwriter(person);
        } else {
            movie.setScreenwriter(null);
        }

        var existing = movieRepository.existsByName(movie.getName());
        if (existing) {
            throw new UniqueConstraintViolationException(Person.class, "name", movie.getName());
        }
        movie.setCreatedBy(original.getCreatedBy());
        movie.setUpdatedBy(getCurrentUser());

        var saved = movieRepository.save(movie);
        messagingTemplate.convertAndSend("/topic/updateMovie", movieMapper.toDto(saved));

        return movieMapper.toDto(saved);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public ImportDto importFile(MultipartFile file) throws Exception{

        Import importLog = new Import();
        TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());
        Long fileId = 0L;

        // Парсим файл в список объектов CreatePersonRequest
        try {


            // Парсим содержимое файла из потока
            List<CreateMovieRequest> requests = parseFile(file);

            // Импортируем людей
            List<Movie> movies = importMovies(requests);

            // Обновляем статус лога импорта
            User user = userRepository.findByUsername(getCurrentUser())
                    .orElseThrow(() -> new EntityNotFoundByUsernameException(Person.class, getCurrentUser()));

            importLog.setUserId(user.getId());
            importLog.setStatus(OperationStatus.SUCCESS);
            importLog.setImportType(ImportType.MovieImport);
            importLog.setAddedObjects((long) requests.size());

            var saved = importRepository.save(importLog);

            // Загружаем файл в MinIO и получаем имя файла
            uploadToMinio(saved.getId() ,file);
            movies.forEach(movie -> messagingTemplate.convertAndSend("/topic/newMovie", movieMapper.toDto(movie)));
            transactionManager.commit(status);

            return importMapper.toDto(saved);
        } catch (RuntimeException e) {
            transactionManager.rollback(status);

            if(!fileId.equals(0L)){
                importService.deleteImport(fileId);
            }

            throw new RuntimeException("Error during file import: " + e.getMessage(), e);
        }
    }
    private List<CreateMovieRequest> parseFile(MultipartFile file) {
        try {
            return objectMapper.readValue(file.getBytes(), new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid JSON file format", e);
        } catch (IOException e) {
            throw new RuntimeException("Error reading JSON file", e);
        }
    }

    public List<Movie> importMovies(List<CreateMovieRequest> requests) {
        // Парсим JSON-файл в список запросов

        // Преобразуем запросы в сущности Movie
        List<Movie> movies = requests.stream().map(request -> {
            var movie = movieMapper.toEntity(request);

            // Установка Director
            if (request.directorID() != null) {
                Person director = personRepository.findById(request.directorID())
                        .orElseThrow(() -> new EntityNotFoundByIdException(Person.class, request.directorID()));
                movie.setDirector(director);
            }

            // Установка Operator
            if (request.operatorID() != null) {
                Person operator = personRepository.findById(request.operatorID())
                        .orElseThrow(() -> new EntityNotFoundByIdException(Person.class, request.operatorID()));
                movie.setOperator(operator);
            }

            // Установка Screenwriter
            if (request.screenwriterID() != null) {
                Person screenwriter = personRepository.findById(request.screenwriterID())
                        .orElseThrow(() -> new EntityNotFoundByIdException(Person.class, request.screenwriterID()));
                movie.setScreenwriter(screenwriter);
            }
            if (movieRepository.existsByName(movie.getName())) {
                throw new UniqueConstraintViolationException(Person.class, "name", movie.getName());
            }
            movie.setCreatedBy(getCurrentUser());

            return movie;
        }).toList();

        // Сохраняем все фильмы
        movieRepository.saveAll(movies);

        // Отправляем уведомление по WebSocket для каждого фильма
        return movies;
    }

    public void delete(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundByIdException(Movie.class, id));
        movieRepository.deleteById(id);
        messagingTemplate.convertAndSend("/topic/deleteMovie", id);
    }


    public void deleteByGenre(MovieGenre genre, String username) {
        // Находим фильм по жанру
        Movie movieToDelete = movieRepository.findFirstByGenre(genre)
                .orElseThrow(() -> new RuntimeException("No movie found with genre: " + genre));


        // Удаляем найденный фильм
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("No user found with username: " + username));
        if(Objects.equals(user.getId(), movieToDelete.getOwner().getId()) || Objects.equals(user.getRole().toString(), "ROLE_ADMIN")){
            movieRepository.delete(movieToDelete);
            messagingTemplate.convertAndSend("/topic/deleteMovie", movieToDelete.getId());
        } else{
            throw new IllegalStateException("User " + username + " is not authorized to delete this movie.");
        }

    }

    public Page<MovieDto> findAllByNameContaining(String substring, Pageable pageable) {
        return  movieRepository.findAllByNameContaining(substring, pageable).map(movieMapper::toDto);
    }
    public Page<MovieDto> findByTaglineLengthGreaterThan(int length, Pageable pageable) {
        return movieRepository.findByTaglineLengthGreaterThan(length, pageable).map(movieMapper::toDto);
    }
    public void redistributeOscars(MovieGenre sourceGenre, MovieGenre targetGenre) {

        // Получаем список фильмов из исходного жанра
        List<Movie> sourceMovies = movieRepository.findByGenre(sourceGenre);

        // Проверка, если в исходном жанре нет фильмов
        if (sourceMovies.isEmpty()) {
            throw new RuntimeException("No movies found in source genre.");
        }

        // Рассчитываем общее количество Оскаров в исходном жанре
        int totalOscars = sourceMovies.stream().mapToInt(Movie::getOscarsCount).sum();

        // Убираем все Оскары с фильмов в исходном жанре
        for (Movie movie : sourceMovies) {
            movie.setOscarsCount(1); // Убираем все Оскары, устанавливаем минимальное количество
        }

        // Получаем список фильмов из целевого жанра
        List<Movie> targetMovies = movieRepository.findByGenre(targetGenre);

        // Если в целевом жанре нет фильмов, выбрасываем ошибку
        if (targetMovies.isEmpty()) {
            throw new RuntimeException("No movies found in target genre.");
        }

        // Рассчитываем сколько Оскаров распределить на каждый фильм
        int oscarPerMovie = totalOscars / targetMovies.size();

        // Добавляем Оскары в фильмы целевого жанра
        for (Movie movie : targetMovies) {
            movie.setOscarsCount(movie.getOscarsCount() + oscarPerMovie);  // Добавляем Оскары
        }

        // Сохраняем обновленные фильмы в базе данных
        movieRepository.saveAll(targetMovies);
    }


    public void awardOscarsForDurationGreaterThan(int length, int oscars) {
        // Находим все фильмы с продолжительностью больше заданного значения
        List<Movie> moviesToAward = movieRepository.findByLengthGreaterThan(length);

        if (moviesToAward.isEmpty()) {
            throw new RuntimeException("No movies found.");
        }

        // Награждаем все найденные фильмы указанным количеством Оскаров
        for (Movie movie : moviesToAward) {
            movie.setOscarsCount(movie.getOscarsCount() + oscars); // Добавляем Оскары
        }

        movieRepository.saveAll(moviesToAward);  // Сохраняем обновленные фильмы
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
