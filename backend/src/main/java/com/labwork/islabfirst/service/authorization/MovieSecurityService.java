package com.labwork.islabfirst.service.authorization;

import com.labwork.islabfirst.entity.model.Movie;
import com.labwork.islabfirst.entity.model.Person;
import com.labwork.islabfirst.repository.MovieRepository;
import com.labwork.islabfirst.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MovieSecurityService extends OwnedService<Movie, Long>{
    private final MovieRepository movieRepository;

    @Override
    protected Movie findById(Long id) {
        return movieRepository.findById(id).orElseThrow();
    }
}
