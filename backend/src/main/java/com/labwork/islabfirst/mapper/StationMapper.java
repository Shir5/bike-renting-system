package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.StationDto;
import com.labwork.islabfirst.dto.request.CreateStationRequest;
import com.labwork.islabfirst.entity.model.Coordinates;
import com.labwork.islabfirst.entity.model.Station;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {Coordinates.class})
public interface StationMapper extends EntityMapper<StationDto, Station>{
    Station toEntity(CreateStationRequest request);

}
