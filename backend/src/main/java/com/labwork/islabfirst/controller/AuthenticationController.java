package com.labwork.islabfirst.controller;

import com.labwork.islabfirst.dto.response.JwtResponse;
import com.labwork.islabfirst.dto.request.LoginRequest;
import com.labwork.islabfirst.dto.request.RegisterRequest;
import com.labwork.islabfirst.dto.response.UserResponse;
import com.labwork.islabfirst.service.authentication.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("/auth/register")
    public ResponseEntity<JwtResponse> register(@RequestBody RegisterRequest registerRequest){

        return ResponseEntity.status(HttpStatus.CREATED).body(authenticationService.registerUser(registerRequest));
    }
    @PostMapping("/auth/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest loginRequest){

        return ResponseEntity.ok(authenticationService.authenticate(loginRequest));
    }

    @GetMapping("/auth/info")
    public ResponseEntity<UserResponse> info(){
        return ResponseEntity.ok(authenticationService.getInfo());
    }
}
