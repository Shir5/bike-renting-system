package com.labwork.islabfirst.repository;

import com.labwork.islabfirst.entity.model.Movie;
import com.labwork.islabfirst.entity.model.MovieGenre;
import com.labwork.islabfirst.entity.model.Person;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository  extends JpaRepository<Movie, Long> {
    Page<Movie> findAllByName(@NotNull String name, @NotNull Pageable pageable);

    Page<Movie> findAllByNameContaining(@NonNull String substring, @NonNull Pageable pageable);

    @Query(value = "SELECT m FROM Movie m WHERE LENGTH(m.tagline) > :length")
    Page<Movie> findByTaglineLengthGreaterThan(@Param("length") int length, @NotNull Pageable pageable);


    boolean existsByDirectorIdOrScreenwriterIdOrOperatorId(Long id, Long id1, Long id2);

    Optional<Movie> findFirstByGenre(MovieGenre genre);

    List<Movie> findByGenre(MovieGenre sourceGenre);

    List<Movie> findByLengthGreaterThan(int length);

    boolean existsByName(@NotNull @NotEmpty String name);

}
