package com.labwork.islabfirst.mapper;


import com.labwork.islabfirst.dto.RepairDto;
import com.labwork.islabfirst.dto.request.CreateRepairRequest;
import com.labwork.islabfirst.dto.request.UpdateRepairRequest;
import com.labwork.islabfirst.entity.model.Repair;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RepairMapper extends EntityMapper<RepairDto, Repair> {
    Repair toEntity(CreateRepairRequest request);
    Repair toEntity(UpdateRepairRequest request);
}
