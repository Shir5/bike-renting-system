package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.RentalDto;
import com.labwork.islabfirst.dto.request.CreateRentalRequest;
import com.labwork.islabfirst.dto.request.UpdateRentalRequest;
import com.labwork.islabfirst.entity.model.Rental;
import com.labwork.islabfirst.mapper.RentalMapper;
import org.springframework.stereotype.Component;

@Component
public class RentalMapperImpl implements RentalMapper {

    @Override
    public Rental toEntity(RentalDto dto) {
        if ( dto == null ) {
            return null;
        }

        Rental rental = new Rental();

        rental.setId( dto.id() );
        if ( dto.cost() != null ) {
            rental.setCost( dto.cost().doubleValue() );
        }

        return rental;
    }

    @Override
    public RentalDto toDto(Rental entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        Long cost = null;

        id = entity.getId();
        if ( entity.getCost() != null ) {
            cost = entity.getCost().longValue();
        }

        Long user_id = entity.getUser().getId() ;
        Long bicycle_id = entity.getBicycle().getId() ;
        Long start_station_id = entity.getStart_station().getId() ;
        Long end_station_id = (entity.getEnd_station() != null) ? entity.getEnd_station().getId() : null;

        RentalDto rentalDto = new RentalDto( id, user_id, bicycle_id, start_station_id, end_station_id, cost );

        return rentalDto;
    }

    @Override
    public Rental toEntity(CreateRentalRequest request) {
        if ( request == null ) {
            return null;
        }

        Rental rental = new Rental();


        return rental;
    }

    @Override
    public Rental toEntity(UpdateRentalRequest request) {
        if ( request == null ) {
            return null;
        }

        Rental rental = new Rental();

        if ( request.cost() != null ) {
            rental.setCost( request.cost().doubleValue() );
        }

        return rental;
    }
}
