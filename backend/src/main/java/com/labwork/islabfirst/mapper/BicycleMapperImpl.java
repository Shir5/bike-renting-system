package com.labwork.islabfirst.mapper;


import com.labwork.islabfirst.dto.BicycleDto;
import com.labwork.islabfirst.dto.request.CreateBicycleRequest;
import com.labwork.islabfirst.entity.model.Bicycle;
import com.labwork.islabfirst.entity.model.BicycleStatus;
import com.labwork.islabfirst.entity.model.BicycleType;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class BicycleMapperImpl implements BicycleMapper {

    @Override
    public Bicycle toEntity(BicycleDto dto) {
        if ( dto == null ) {
            return null;
        }

        Bicycle bicycle = new Bicycle();

        bicycle.setId( dto.id() );
        bicycle.setModel( dto.model() );
        if ( dto.type() != null ) {
            bicycle.setType( Enum.valueOf( BicycleType.class, dto.type() ) );
        }
        if ( dto.status() != null ) {
            bicycle.setStatus( Enum.valueOf( BicycleStatus.class, dto.status() ) );
        }
        bicycle.setLastServiceDate( dto.lastServiceDate() );

        return bicycle;
    }

    @Override
    public BicycleDto toDto(Bicycle entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String model = null;
        String type = null;
        String status = null;
        Date lastServiceDate = null;

        id = entity.getId();
        model = entity.getModel();
        if ( entity.getType() != null ) {
            type = entity.getType().name();
        }
        if ( entity.getStatus() != null ) {
            status = entity.getStatus().name();
        }
        lastServiceDate = entity.getLastServiceDate();

        Long station_id = entity.getStation().getId();

        BicycleDto bicycleDto = new BicycleDto( id, model, type, status, station_id, lastServiceDate );

        return bicycleDto;
    }

    @Override
    public Bicycle toEntity(CreateBicycleRequest request) {
        if ( request == null ) {
            return null;
        }

        Bicycle bicycle = new Bicycle();

        bicycle.setModel( request.model() );
        if ( request.type() != null ) {
            bicycle.setType( Enum.valueOf( BicycleType.class, request.type() ) );
        }
        if ( request.status() != null ) {
            bicycle.setStatus( Enum.valueOf( BicycleStatus.class, request.status() ) );
        }

        return bicycle;
    }
}
