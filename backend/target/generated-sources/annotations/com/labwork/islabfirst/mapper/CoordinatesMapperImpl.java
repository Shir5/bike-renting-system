package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.CoordinatesDto;
import com.labwork.islabfirst.entity.model.Coordinates;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-01-19T18:54:51+0300",
    comments = "version: 1.6.2, compiler: javac, environment: Java 17.0.13 (Amazon.com Inc.)"
)
@Component
public class CoordinatesMapperImpl implements CoordinatesMapper {

    @Override
    public Coordinates toEntity(CoordinatesDto dto) {
        if ( dto == null ) {
            return null;
        }

        Coordinates.CoordinatesBuilder coordinates = Coordinates.builder();

        coordinates.x( dto.x() );
        coordinates.y( dto.y() );

        return coordinates.build();
    }

    @Override
    public CoordinatesDto toDto(Coordinates entity) {
        if ( entity == null ) {
            return null;
        }

        Long x = null;
        Long y = null;

        x = entity.getX();
        y = entity.getY();

        CoordinatesDto coordinatesDto = new CoordinatesDto( x, y );

        return coordinatesDto;
    }
}
