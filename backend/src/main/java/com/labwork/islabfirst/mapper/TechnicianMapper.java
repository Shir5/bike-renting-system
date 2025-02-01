package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.TechnicianDto;
import com.labwork.islabfirst.dto.request.CreateTechnicianRequest;
import com.labwork.islabfirst.entity.model.Coordinates;
import com.labwork.islabfirst.entity.model.Technician;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TechnicianMapper extends EntityMapper<TechnicianDto, Technician> {
    Technician toEntity(CreateTechnicianRequest request);
}
