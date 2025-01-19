package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.BicycleDto;
import com.labwork.islabfirst.dto.StationDto;
import com.labwork.islabfirst.dto.request.CreateBicycleRequest;
import com.labwork.islabfirst.dto.request.CreateStationRequest;
import com.labwork.islabfirst.entity.model.Bicycle;
import com.labwork.islabfirst.entity.model.Coordinates;
import com.labwork.islabfirst.entity.model.Station;
import org.mapstruct.Mapper;

public interface BicycleMapper extends EntityMapper<BicycleDto, Bicycle> {
    Bicycle toEntity(CreateBicycleRequest request);
}
