package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.CoordinatesDto;
import com.labwork.islabfirst.entity.model.Coordinates;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-02-07T22:46:13+0300",
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

        coordinates.latitude( dto.latitude() );
        coordinates.longitude( dto.longitude() );

        return coordinates.build();
    }

    @Override
    public CoordinatesDto toDto(Coordinates entity) {
        if ( entity == null ) {
            return null;
        }

        float latitude = 0.0f;
        float longitude = 0.0f;

        latitude = entity.getLatitude();
        longitude = entity.getLongitude();

        CoordinatesDto coordinatesDto = new CoordinatesDto( latitude, longitude );

        return coordinatesDto;
    }
}
