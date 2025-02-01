package com.labwork.islabfirst.service;


import com.labwork.islabfirst.dto.BicycleDto;
import com.labwork.islabfirst.dto.StationDto;
import com.labwork.islabfirst.dto.request.CreateBicycleRequest;
import com.labwork.islabfirst.dto.request.CreateStationRequest;
import com.labwork.islabfirst.entity.model.Bicycle;
import com.labwork.islabfirst.entity.model.Station;
import com.labwork.islabfirst.handler.EntityNotFoundByIdException;
import com.labwork.islabfirst.mapper.BicycleMapper;
import com.labwork.islabfirst.repository.BicycleRepository;
import com.labwork.islabfirst.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class BicycleService {

    private final BicycleRepository bicycleRepository;
    private final BicycleMapper bicycleMapper;
    private final StationRepository stationRepository;

    public Page<BicycleDto> findAllWithFilters(String model, Pageable pageable) {
        if (model != null) {
            return bicycleRepository.findAllByModel(model, pageable).map(bicycleMapper::toDto);
        }

        return bicycleRepository.findAll(pageable).map(bicycleMapper::toDto);
    }

    public Page<BicycleDto> findAllByStationId(Long stationId, Pageable pageable) {
        if (stationId != null) {
            return bicycleRepository.findAllByStationId(stationId, pageable).map(bicycleMapper::toDto);
        }
        return bicycleRepository.findAll(pageable).map(bicycleMapper::toDto);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public BicycleDto create(CreateBicycleRequest request) {

        var bicycle = bicycleMapper.toEntity(request);
        bicycle.setMileage(0L);
        Station station = stationRepository.findById(request.station_id())
                .orElseThrow(() -> new EntityNotFoundByIdException(Station.class, request.station_id()));
        bicycle.setStation(station);

        var saved = bicycleRepository.save(bicycle);


//        messagingTemplate.convertAndSend("/topic/newPerson", personMapper.toDto(saved));
        return bicycleMapper.toDto(saved);
    }
}

