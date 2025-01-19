package com.labwork.islabfirst.controller;

import com.labwork.islabfirst.dto.ImportDto;
import com.labwork.islabfirst.dto.MovieDto;
import com.labwork.islabfirst.dto.PersonDto;
import com.labwork.islabfirst.dto.request.CreateMovieRequest;
import com.labwork.islabfirst.dto.request.CreatePersonRequest;
import com.labwork.islabfirst.dto.request.UpdateMovieRequest;
import com.labwork.islabfirst.dto.request.UpdatePersonRequest;
import com.labwork.islabfirst.entity.model.Movie;
import com.labwork.islabfirst.entity.model.MovieGenre;
import com.labwork.islabfirst.service.ImportService;
import com.labwork.islabfirst.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("api/movies")
@RequiredArgsConstructor
public class MovieRestController {
    private final MovieService movieService;
    private final ImportService importService;

    @GetMapping
    public ResponseEntity<Page<MovieDto>> findAll(
            @RequestParam(required = false) String name,
            @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(movieService.findAllWithFilters(name, pageable));
    }


    @GetMapping("/{id}")
    public ResponseEntity<MovieDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(movieService.findById(id));
    }
    @PostMapping(value = "/imports", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<ImportDto> importFile(@RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED).body(movieService.importFile(file));
    }

    @PostMapping
    public ResponseEntity<MovieDto> create(@RequestBody CreateMovieRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(movieService.create(request));
    }

    @PreAuthorize("@movieSecurityService.hasEditRights(#id)")
    @PutMapping("/{id}")
    public ResponseEntity<MovieDto> update(
            @PathVariable Long id,
            @RequestBody UpdateMovieRequest request
    ) {
        return ResponseEntity.ok(movieService.update(id, request));
    }

    @PreAuthorize("@movieSecurityService.hasEditRights(#id)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        movieService.delete(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete-one-by-genre")
    public ResponseEntity<String> deleteOneMovieByGenre(@RequestParam String username,@RequestParam MovieGenre genre) {

        try {
            movieService.deleteByGenre(genre, username);
            return ResponseEntity.ok("One movie with genre '" + genre + "' has been deleted.");
        } catch (IllegalStateException e) {
            // Если у пользователя нет прав для удаления первого фильма жанра
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You do not have permissions to delete the first movie of this genre: " + genre);
        } catch (RuntimeException e) {
            // Если произошла другая ошибка, например, не найден фильм
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }



    @GetMapping("/search-by-name")
    public ResponseEntity<Page<MovieDto>> searchMoviesByName(
            @RequestParam String substring,
            @PageableDefault Pageable pageable
    )  {
        Page<MovieDto> result = movieService.findAllByNameContaining(substring, pageable);
        if(result.isEmpty()){
            return ResponseEntity.ok(Page.empty());
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/search-by-tagline-length")
    public ResponseEntity<Page<MovieDto>> searchMoviesByTaglineLength(
            @RequestParam int length,
            @PageableDefault Pageable pageable
    )  {

        Page<MovieDto> result = movieService.findByTaglineLengthGreaterThan(length, pageable);
        if (result.isEmpty()) {
            return ResponseEntity.ok(Page.empty());
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/redistribute-oscars")
    public ResponseEntity<String> redistributeOscars(@RequestParam MovieGenre sourceGenre,
                                                     @RequestParam MovieGenre targetGenre) {
        try {
            movieService.redistributeOscars(sourceGenre, targetGenre);
            return ResponseEntity.ok("Oscars redistributed successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/award-oscars-for-duration")
    public ResponseEntity<String> awardOscarsForDuration(
            @RequestParam int duration,
            @RequestParam int oscars) {

        try {
            movieService.awardOscarsForDurationGreaterThan(duration, oscars);
            return ResponseEntity.ok("Oscars added successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
