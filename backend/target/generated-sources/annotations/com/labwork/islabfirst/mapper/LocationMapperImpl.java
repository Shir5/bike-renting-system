package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.LocationDto;
import com.labwork.islabfirst.entity.model.Location;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-01-19T01:10:32+0300",
    comments = "version: 1.6.2, compiler: javac, environment: Java 17.0.13 (Amazon.com Inc.)"
)
@Component
public class LocationMapperImpl implements LocationMapper {

    @Override
    public Location toEntity(LocationDto dto) {
        if ( dto == null ) {
            return null;
        }

        Location.LocationBuilder location = Location.builder();

        location.x( dto.x() );
        if ( dto.y() != null ) {
            location.y( dto.y() );
        }
        if ( dto.z() != null ) {
            location.z( dto.z() );
        }

        return location.build();
    }

    @Override
    public LocationDto toDto(Location entity) {
        if ( entity == null ) {
            return null;
        }

        Double x = null;
        Long y = null;
        Double z = null;

        x = entity.getX();
        y = entity.getY();
        z = entity.getZ();

        LocationDto locationDto = new LocationDto( x, y, z );

        return locationDto;
    }
}
