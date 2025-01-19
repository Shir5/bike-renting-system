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
    date = "2025-01-19T18:54:51+0300",
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
        station.setAddress( dto.address() );
        station.setCoordinates( coordinatesDtoToCoordinates( dto.coordinates() ) );
        station.setTotalSlots( dto.totalSlots() );
        station.setAvailableBicycles( dto.availableBicycles() );

        return station;
    }

    @Override
    public StationDto toDto(Station entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String address = null;
        CoordinatesDto coordinates = null;
        Long totalSlots = null;
        Long availableBicycles = null;

        id = entity.getId();
        address = entity.getAddress();
        coordinates = coordinatesToCoordinatesDto( entity.getCoordinates() );
        totalSlots = entity.getTotalSlots();
        availableBicycles = entity.getAvailableBicycles();

        StationDto stationDto = new StationDto( id, address, coordinates, totalSlots, availableBicycles );

        return stationDto;
    }

    @Override
    public Station toEntity(CreateStationRequest request) {
        if ( request == null ) {
            return null;
        }

        Station station = new Station();

        station.setAddress( request.address() );
        station.setCoordinates( coordinatesDtoToCoordinates( request.coordinates() ) );
        station.setTotalSlots( request.totalSlots() );

        return station;
    }

    protected Coordinates coordinatesDtoToCoordinates(CoordinatesDto coordinatesDto) {
        if ( coordinatesDto == null ) {
            return null;
        }

        Coordinates.CoordinatesBuilder coordinates = Coordinates.builder();

        coordinates.x( coordinatesDto.x() );
        coordinates.y( coordinatesDto.y() );

        return coordinates.build();
    }

    protected CoordinatesDto coordinatesToCoordinatesDto(Coordinates coordinates) {
        if ( coordinates == null ) {
            return null;
        }

        Long x = null;
        Long y = null;

        x = coordinates.getX();
        y = coordinates.getY();

        CoordinatesDto coordinatesDto = new CoordinatesDto( x, y );

        return coordinatesDto;
    }
}
