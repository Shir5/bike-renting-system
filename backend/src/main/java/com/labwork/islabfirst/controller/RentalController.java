package com.labwork.islabfirst.controller;


import com.labwork.islabfirst.dto.RentalDto;
import com.labwork.islabfirst.dto.request.CreateRentalRequest;
import com.labwork.islabfirst.dto.request.UpdateRentalRequest;
import com.labwork.islabfirst.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/rental")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;
    @GetMapping
    public ResponseEntity<Page<RentalDto>> findAll(
            @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(rentalService.findAll(pageable));
    }

    @PostMapping
    public ResponseEntity<RentalDto> create(@RequestBody CreateRentalRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(rentalService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RentalDto> update(
            @PathVariable Long id,
            @RequestBody UpdateRentalRequest request
    ) {

        return ResponseEntity.ok(rentalService.update(id, request));
    }
}
