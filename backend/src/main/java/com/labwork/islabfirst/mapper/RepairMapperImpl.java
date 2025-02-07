package com.labwork.islabfirst.mapper;

import com.labwork.islabfirst.dto.RepairDto;
import com.labwork.islabfirst.dto.request.CreateRepairRequest;
import com.labwork.islabfirst.dto.request.UpdateRepairRequest;
import com.labwork.islabfirst.entity.model.Repair;
import com.labwork.islabfirst.entity.model.RepairStatus;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Component
public class RepairMapperImpl implements RepairMapper {

    @Override
    public Repair toEntity(RepairDto dto) {
        if ( dto == null ) {
            return null;
        }

        Repair repair = new Repair();

        repair.setId( dto.id() );
        repair.setDescription( dto.description() );
        if ( dto.status() != null ) {
            repair.setStatus( Enum.valueOf( RepairStatus.class, dto.status() ) );
        }

        return repair;
    }

    @Override
    public RepairDto toDto(Repair entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String description = null;
        String status = null;

        id = entity.getId();
        description = entity.getDescription();
        if ( entity.getStatus() != null ) {
            status = entity.getStatus().name();
        }

        Long bicycle_id = entity.getBicycle().getId();
        Long technician_id = entity.getTechnician().getId();

        RepairDto repairDto = new RepairDto( id, bicycle_id, technician_id, description, status );

        return repairDto;
    }

    @Override
    public Repair toEntity(CreateRepairRequest request) {
        if ( request == null ) {
            return null;
        }

        Repair repair = new Repair();

        repair.setDescription( request.description() );

        return repair;
    }

    @Override
    public Repair toEntity(UpdateRepairRequest request) {
        if ( request == null ) {
            return null;
        }

        Repair repair = new Repair();

        return repair;
    }
}
