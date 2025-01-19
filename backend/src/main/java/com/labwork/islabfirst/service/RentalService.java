package com.labwork.islabfirst.service;


import com.labwork.islabfirst.dto.RentalDto;
import com.labwork.islabfirst.dto.request.CreateRentalRequest;
import com.labwork.islabfirst.dto.request.UpdateRentalRequest;
import com.labwork.islabfirst.entity.model.*;
import com.labwork.islabfirst.entity.security.User;
import com.labwork.islabfirst.handler.EntityNotFoundByIdException;
import com.labwork.islabfirst.mapper.RentalMapper;
import com.labwork.islabfirst.repository.BicycleRepository;
import com.labwork.islabfirst.repository.RentalRepository;
import com.labwork.islabfirst.repository.StationRepository;
import com.labwork.islabfirst.repository.UserRepository;
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
public class RentalService {
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;
    private final StationRepository stationRepository;
    private final BicycleRepository bicycleRepository;
    private final RentalMapper rentalMapper;

    public Page<RentalDto> findAll(Pageable pageable) {
        return rentalRepository.findAll(pageable).map(rentalMapper::toDto);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public RentalDto create(CreateRentalRequest request) {

        var rental = rentalMapper.toEntity(request);


        User user = userRepository.findById(request.user_id())
                .orElseThrow(() -> new EntityNotFoundByIdException(User.class, request.user_id()));
        rental.setUser(user);
        Bicycle bicycle = bicycleRepository.findById(request.bicycle_id())
                .orElseThrow(() -> new EntityNotFoundByIdException(Bicycle.class, request.bicycle_id()));
        rental.setBicycle(bicycle);

        Station start_station = stationRepository.findById(request.start_station_id())
                .orElseThrow(() -> new EntityNotFoundByIdException(Station.class, request.start_station_id()));
        rental.setStart_station(start_station);

        bicycle.setStatus(BicycleStatus.RENTED);
        bicycleRepository.save(bicycle);
        var saved = rentalRepository.save(rental);


//        messagingTemplate.convertAndSend("/topic/newPerson", personMapper.toDto(saved));
        return rentalMapper.toDto(saved);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
        public RentalDto update(Long id, UpdateRentalRequest request) {

        var original = rentalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundByIdException(Rental.class, id));
        var updated = rentalMapper.toEntity(request);

        updated.setId(original.getId());
        updated.setUser(original.getUser());
        updated.setBicycle(original.getBicycle());
        updated.setStart_station(original.getStart_station());
        Station end_station = stationRepository.findById(request.end_station_id())
                .orElseThrow(() -> new EntityNotFoundByIdException(Station.class, request.end_station_id()));
        updated.setEnd_station(end_station);

        updated.setRentalEndedAt(LocalDateTime.now());


        var bicycle = bicycleRepository.findById(request.bicycle_id())
                .orElseThrow(() -> new EntityNotFoundByIdException(Bicycle.class, id));

        bicycle.setStatus(BicycleStatus.AVAILABLE);
        bicycleRepository.save(bicycle);
        var saved = rentalRepository.save(updated);

        return rentalMapper.toDto(saved);
    }

}
