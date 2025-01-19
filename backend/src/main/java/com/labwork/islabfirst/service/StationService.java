package com.labwork.islabfirst.service;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.labwork.islabfirst.dto.ImportDto;
import com.labwork.islabfirst.dto.MovieDto;
import com.labwork.islabfirst.dto.PersonDto;
import com.labwork.islabfirst.dto.StationDto;
import com.labwork.islabfirst.dto.request.*;
import com.labwork.islabfirst.entity.security.Import;
import com.labwork.islabfirst.entity.security.ImportType;
import com.labwork.islabfirst.entity.security.OperationStatus;
import com.labwork.islabfirst.entity.security.User;
import com.labwork.islabfirst.handler.EntityNotFoundByIdException;
import com.labwork.islabfirst.handler.EntityNotFoundByUsernameException;
import com.labwork.islabfirst.handler.PersonInUseException;
import com.labwork.islabfirst.handler.UniqueConstraintViolationException;
import com.labwork.islabfirst.mapper.ImportMapper;
import com.labwork.islabfirst.mapper.MovieMapper;
import com.labwork.islabfirst.mapper.PersonMapper;
import com.labwork.islabfirst.entity.model.Movie;
import com.labwork.islabfirst.entity.model.Person;
import com.labwork.islabfirst.mapper.StationMapper;
import com.labwork.islabfirst.repository.*;

import io.minio.errors.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class StationService {

    private final StationMapper stationMapper;
    private final StationRepository stationRepository;

    public Page<StationDto> findAllWithFilters(String address, Pageable pageable) {
        if (address != null) {
            return stationRepository.findAllByAddress(address, pageable).map(stationMapper::toDto);
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
