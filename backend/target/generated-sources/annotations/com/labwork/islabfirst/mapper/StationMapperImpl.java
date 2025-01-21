package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.CoordinatesDto;
import com.labwork.islabfirst.dto.StationDto;
import com.labwork.islabfirst.dto.request.CreateStationRequest;
import com.labwork.islabfirst.entity.model.Coordinates;
import com.labwork.islabfirst.entity.model.Station;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-01-21T23:15:35+0300",
    comments = "version: 1.6.2, compiler: javac, environment: Java 17.0.13 (Amazon.com Inc.)"
)
@Component
public class StationMapperImpl implements StationMapper {

    @Override
    public Station toEntity(StationDto dto) {
        if ( dto == null ) {
            return null;
        }

        Station station = new Station();

        station.setId( dto.id() );
        station.setName( dto.name() );
        station.setCoordinates( coordinatesDtoToCoordinates( dto.coordinates() ) );
        station.setAvailableBicycles( dto.availableBicycles() );

        return station;
    }

    @Override
    public StationDto toDto(Station entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String name = null;
        CoordinatesDto coordinates = null;
        Long availableBicycles = null;

        id = entity.getId();
        name = entity.getName();
        coordinates = coordinatesToCoordinatesDto( entity.getCoordinates() );
        availableBicycles = entity.getAvailableBicycles();

        StationDto stationDto = new StationDto( id, name, coordinates, availableBicycles );

        return stationDto;
    }

    @Override
    public Station toEntity(CreateStationRequest request) {
        if ( request == null ) {
            return null;
        }

        Station station = new Station();

        station.setName( request.name() );
        station.setCoordinates( coordinatesDtoToCoordinates( request.coordinates() ) );

        return station;
    }

    protected Coordinates coordinatesDtoToCoordinates(CoordinatesDto coordinatesDto) {
        if ( coordinatesDto == null ) {
            return null;
        }

        Coordinates.CoordinatesBuilder coordinates = Coordinates.builder();

        coordinates.latitude( coordinatesDto.latitude() );
        coordinates.longitude( coordinatesDto.longitude() );

        return coordinates.build();
    }

    protected CoordinatesDto coordinatesToCoordinatesDto(Coordinates coordinates) {
        if ( coordinates == null ) {
            return null;
        }

        float latitude = 0.0f;
        float longitude = 0.0f;

        latitude = coordinates.getLatitude();
        longitude = coordinates.getLongitude();

        CoordinatesDto coordinatesDto = new CoordinatesDto( latitude, longitude );

        return coordinatesDto;
    }
}
