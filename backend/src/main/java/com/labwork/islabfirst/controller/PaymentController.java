package com.labwork.islabfirst.controller;

import com.labwork.islabfirst.dto.BicycleDto;
import com.labwork.islabfirst.dto.PaymentDto;
import com.labwork.islabfirst.dto.request.CreateBicycleRequest;
import com.labwork.islabfirst.dto.request.CreatePaymentRequest;
import com.labwork.islabfirst.service.BicycleService;
import com.labwork.islabfirst.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/payment")
@RequiredArgsConstructor
public class PaymentController {


    private final PaymentService paymentService;


    @GetMapping
    public ResponseEntity<Page<PaymentDto>> findAll(
            @RequestParam(required = false) String name,
            @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(paymentService.findAllByUser(name, pageable));
    }

    @PostMapping
    public ResponseEntity<PaymentDto> create(@RequestBody CreatePaymentRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.create(request));
    }
}
