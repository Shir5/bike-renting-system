package com.labwork.islabfirst.controller;


import com.labwork.islabfirst.dto.BicycleDto;
import com.labwork.islabfirst.dto.RentalDto;
import com.labwork.islabfirst.dto.RepairDto;
import com.labwork.islabfirst.dto.request.CreateRentalRequest;
import com.labwork.islabfirst.dto.request.CreateRepairRequest;
import com.labwork.islabfirst.dto.request.UpdateRentalRequest;
import com.labwork.islabfirst.dto.request.UpdateRepairRequest;
import com.labwork.islabfirst.service.RentalService;
import com.labwork.islabfirst.service.RepairService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/repair")
@RequiredArgsConstructor
public class RepairController {



    private final RepairService repairService;


    @GetMapping("/scheduled")
    public ResponseEntity<Page<BicycleDto>> findScheduled(@PageableDefault Pageable pageable){
        return ResponseEntity.ok(repairService.findScheduled(pageable));
    }
    @GetMapping
    public ResponseEntity<Page<RepairDto>> findAll(
            @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(repairService.findAll(pageable));
    }

    @PostMapping
    public ResponseEntity<RepairDto> create(@RequestBody CreateRepairRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(repairService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RepairDto> update(
            @PathVariable Long id,
            @RequestBody UpdateRepairRequest request
    ) {

        return ResponseEntity.ok(repairService.update(id, request));
    }
}
