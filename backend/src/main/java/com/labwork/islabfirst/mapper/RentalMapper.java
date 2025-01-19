package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.RentalDto;
import com.labwork.islabfirst.dto.StationDto;
import com.labwork.islabfirst.dto.request.CreateRentalRequest;
import com.labwork.islabfirst.dto.request.CreateStationRequest;
import com.labwork.islabfirst.dto.request.UpdatePersonRequest;
import com.labwork.islabfirst.dto.request.UpdateRentalRequest;
import com.labwork.islabfirst.entity.model.Bicycle;
import com.labwork.islabfirst.entity.model.Coordinates;
import com.labwork.islabfirst.entity.model.Rental;
import com.labwork.islabfirst.entity.model.Station;
import com.labwork.islabfirst.entity.security.User;
import org.mapstruct.Mapper;

public interface RentalMapper extends EntityMapper<RentalDto, Rental>{
    Rental toEntity(CreateRentalRequest request);
    Rental toEntity(UpdateRentalRequest request);



}
