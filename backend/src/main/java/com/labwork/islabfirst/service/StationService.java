package com.labwork.islabfirst.service;


import com.labwork.islabfirst.dto.StationDto;
import com.labwork.islabfirst.dto.request.*;
import com.labwork.islabfirst.mapper.StationMapper;
import com.labwork.islabfirst.repository.*;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class StationService {

    private final StationMapper stationMapper;
    private final StationRepository stationRepository;


    public Page<StationDto> findAllWithFilters(Long id, Pageable pageable) {
        if (id != null) {


            return stationRepository.findAllById(id, pageable).map(stationMapper::toDto);
        }

        return stationRepository.findAll(pageable).map(stationMapper::toDto);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public StationDto create(CreateStationRequest request) {

        var station = stationMapper.toEntity(request);

        var saved = stationRepository.save(station);


//        messagingTemplate.convertAndSend("/topic/newPerson", personMapper.toDto(saved));
        return stationMapper.toDto(saved);
    }
}
