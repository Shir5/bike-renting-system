package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.RentalDto;
import com.labwork.islabfirst.dto.request.CreateRentalRequest;
import com.labwork.islabfirst.dto.request.UpdateRentalRequest;
import com.labwork.islabfirst.entity.model.Rental;

public interface RentalMapper extends EntityMapper<RentalDto, Rental>{
    Rental toEntity(CreateRentalRequest request);
    Rental toEntity(UpdateRentalRequest request);



}
