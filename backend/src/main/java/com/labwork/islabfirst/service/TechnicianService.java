package com.labwork.islabfirst.service;

import com.labwork.islabfirst.dto.StationDto;
import com.labwork.islabfirst.dto.TechnicianDto;
import com.labwork.islabfirst.dto.request.CreateStationRequest;
import com.labwork.islabfirst.dto.request.CreateTechnicianRequest;
import com.labwork.islabfirst.mapper.StationMapper;
import com.labwork.islabfirst.mapper.TechnicianMapper;
import com.labwork.islabfirst.repository.StationRepository;
import com.labwork.islabfirst.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class TechnicianService {
    private final TechnicianMapper technicianMapper;
    private final TechnicianRepository technicianRepository;


    public Page<TechnicianDto> findAll(Pageable pageable) {

        return technicianRepository.findAll(pageable).map(technicianMapper::toDto);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public TechnicianDto create(CreateTechnicianRequest request) {

        var technician = technicianMapper.toEntity(request);

        var saved = technicianRepository.save(technician);


//        messagingTemplate.convertAndSend("/topic/newPerson", personMapper.toDto(saved));
        return technicianMapper.toDto(saved);
    }
}
