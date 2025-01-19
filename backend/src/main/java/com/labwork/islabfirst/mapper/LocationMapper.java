package com.labwork.islabfirst.mapper;


import com.labwork.islabfirst.dto.LocationDto;
import com.labwork.islabfirst.mapper.EntityMapper;
import com.labwork.islabfirst.entity.model.Location;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LocationMapper extends EntityMapper<LocationDto, Location> {
}
