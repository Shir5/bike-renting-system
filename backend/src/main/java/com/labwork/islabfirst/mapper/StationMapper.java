package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.AdminRegisterRequestDto;
import com.labwork.islabfirst.dto.StationDto;
import com.labwork.islabfirst.dto.request.CreatePersonRequest;
import com.labwork.islabfirst.dto.request.CreateStationRequest;
import com.labwork.islabfirst.entity.model.Coordinates;
import com.labwork.islabfirst.entity.model.Location;
import com.labwork.islabfirst.entity.model.Person;
import com.labwork.islabfirst.entity.model.Station;
import com.labwork.islabfirst.entity.security.AdminRegisterRequest;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {Coordinates.class})
public interface StationMapper extends EntityMapper<StationDto, Station>{
    Station toEntity(CreateStationRequest request);

}
