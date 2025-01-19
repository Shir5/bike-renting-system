package com.labwork.islabfirst.controller;


import com.labwork.islabfirst.dto.StationDto;
import com.labwork.islabfirst.dto.request.CreateStationRequest;
import com.labwork.islabfirst.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/station")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;


    @GetMapping
    public ResponseEntity<Page<StationDto>> findAll(
            @RequestParam(required = false) String name,
            @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(stationService.findAllWithFilters(name, pageable));
    }

    @PostMapping
    public ResponseEntity<StationDto> create(@RequestBody CreateStationRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(stationService.create(request));
    }
}
