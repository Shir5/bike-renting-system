package com.labwork.islabfirst.controller;


import com.labwork.islabfirst.dto.BicycleDto;
import com.labwork.islabfirst.dto.StationDto;
import com.labwork.islabfirst.dto.request.CreateStationRequest;
import com.labwork.islabfirst.service.BicycleService;
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
    private final BicycleService bicycleService;


    @GetMapping
    public ResponseEntity<Page<StationDto>> findAll(
            @RequestParam(required = false) Long id,
            @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(stationService.findAllWithFilters(id, pageable));
    }

    @PostMapping
    public ResponseEntity<StationDto> create(@RequestBody CreateStationRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(stationService.create(request));
    }

    @GetMapping("/bicycle")
    public ResponseEntity<Page<BicycleDto>> findBicycles(
            @RequestParam(required = false) Long id,
            @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(bicycleService.findAllByStationId(id, pageable));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<StationDto> delete(@PathVariable Long id) {
        stationService.delete(id);
        return ResponseEntity.ok().build();

    }
}
