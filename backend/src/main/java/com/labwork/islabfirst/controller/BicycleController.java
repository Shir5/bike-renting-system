package com.labwork.islabfirst.controller;


import com.labwork.islabfirst.dto.BicycleDto;
import com.labwork.islabfirst.dto.StationDto;
import com.labwork.islabfirst.dto.request.CreateBicycleRequest;
import com.labwork.islabfirst.dto.request.CreateStationRequest;
import com.labwork.islabfirst.service.BicycleService;
import com.labwork.islabfirst.service.StationService;
import io.minio.messages.DeleteRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/bicycle")
@RequiredArgsConstructor
public class BicycleController {

    private final BicycleService bicycleService;


    @GetMapping
    public ResponseEntity<Page<BicycleDto>> findAll(
            @RequestParam(required = false) String name,
            @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(bicycleService.findAllWithFilters(name, pageable));
    }

    @PostMapping
    public ResponseEntity<BicycleDto> create(@RequestBody CreateBicycleRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(bicycleService.create(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BicycleDto> delete(@PathVariable Long id) {
        bicycleService.delete(id);
        return ResponseEntity.ok().build();

    }
}
