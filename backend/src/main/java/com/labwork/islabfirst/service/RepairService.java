package com.labwork.islabfirst.service;


import com.labwork.islabfirst.dto.BicycleDto;
import com.labwork.islabfirst.dto.RentalDto;
import com.labwork.islabfirst.dto.RepairDto;
import com.labwork.islabfirst.dto.StationDto;
import com.labwork.islabfirst.dto.request.CreateRepairRequest;
import com.labwork.islabfirst.dto.request.CreateStationRequest;
import com.labwork.islabfirst.dto.request.UpdateRentalRequest;
import com.labwork.islabfirst.dto.request.UpdateRepairRequest;
import com.labwork.islabfirst.entity.model.*;
import com.labwork.islabfirst.entity.security.User;
import com.labwork.islabfirst.handler.EntityNotFoundByIdException;
import com.labwork.islabfirst.mapper.BicycleMapper;
import com.labwork.islabfirst.mapper.RepairMapper;
import com.labwork.islabfirst.repository.BicycleRepository;
import com.labwork.islabfirst.repository.RepairRepository;
import com.labwork.islabfirst.repository.StationRepository;
import com.labwork.islabfirst.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class RepairService {

    private final RepairRepository repairRepository;
    private final RepairMapper repairMapper;
    private final BicycleRepository bicycleRepository;
    private final BicycleMapper bicycleMapper;
    private final TechnicianRepository technicianRepository;

    public Page<RepairDto> findAll(Pageable pageable) {
        return repairRepository.findAll(pageable).map(repairMapper::toDto);
    }

    public Page<BicycleDto> findScheduled(Pageable pageable) {
        return bicycleRepository.findAllByMileageGreaterThan(50L, pageable).map(bicycleMapper::toDto);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public RepairDto create(CreateRepairRequest request) {

        var repair = repairMapper.toEntity(request);


        var bicycle_id = repair.getBicycle().getId();

        var bicycle = bicycleRepository.findById(bicycle_id)
                .orElseThrow(() -> new EntityNotFoundByIdException(Bicycle.class,bicycle_id));

        var technician_id = repair.getTechnician().getId();
        var technician = technicianRepository.findById(technician_id)
                .orElseThrow(() -> new EntityNotFoundByIdException(Technician.class,technician_id));



        bicycle.setStatus(BicycleStatus.UNAVAILABLE);
        repair.setStatus(RepairStatus.IN_PROGRESS);
        var saved = repairRepository.save(repair);


//        messagingTemplate.convertAndSend("/topic/newPerson", personMapper.toDto(saved));
        return repairMapper.toDto(saved);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public RepairDto update(Long id, UpdateRepairRequest request) {

        var original = repairRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundByIdException(Rental.class, id));
        var updated = repairMapper.toEntity(request);

        updated.setId(original.getId());
        updated.setBicycle(original.getBicycle());
        updated.setTechnician(original.getTechnician());

        updated.setDescription(original.getDescription());

        updated.setStatus(RepairStatus.COMPLETED);


        var bicycle_id = updated.getBicycle().getId();

        var bicycle = bicycleRepository.findById(bicycle_id)
                .orElseThrow(() -> new EntityNotFoundByIdException(Bicycle.class,bicycle_id));

        bicycle.setStatus(BicycleStatus.AVAILABLE);

        bicycle.setMileage(0L);

        bicycleRepository.save(bicycle);





        var saved = repairRepository.save(updated);

        return repairMapper.toDto(saved);
    }

}
