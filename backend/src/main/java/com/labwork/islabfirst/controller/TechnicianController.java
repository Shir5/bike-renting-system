package com.labwork.islabfirst.controller;

import com.labwork.islabfirst.dto.StationDto;
import com.labwork.islabfirst.dto.TechnicianDto;
import com.labwork.islabfirst.dto.request.CreateStationRequest;
import com.labwork.islabfirst.dto.request.CreateTechnicianRequest;
import com.labwork.islabfirst.service.TechnicianService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/technician")
@RequiredArgsConstructor
public class TechnicianController {
    private final TechnicianService technicianService;

    @GetMapping
    public ResponseEntity<Page<TechnicianDto>> findAll(
            @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(technicianService.findAll(pageable));
    }

    @PostMapping
    public ResponseEntity<TechnicianDto> create(@RequestBody CreateTechnicianRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(technicianService.create(request));
    }
}
