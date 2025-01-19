package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.CoordinatesDto;
import com.labwork.islabfirst.mapper.EntityMapper;
import com.labwork.islabfirst.entity.model.Coordinates;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public interface CoordinatesMapper extends EntityMapper<CoordinatesDto, Coordinates> {
}



