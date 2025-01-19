package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.MovieDto;
import com.labwork.islabfirst.dto.request.CreateMovieRequest;
import com.labwork.islabfirst.dto.request.UpdateMovieRequest;
import com.labwork.islabfirst.mapper.EntityMapper;
import com.labwork.islabfirst.entity.model.Coordinates;
import com.labwork.islabfirst.entity.model.Movie;
import com.labwork.islabfirst.entity.model.Person;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


public interface MovieMapper extends EntityMapper<MovieDto, Movie> {

    Movie toEntity(CreateMovieRequest request);

    Movie toEntity(UpdateMovieRequest request);

}
