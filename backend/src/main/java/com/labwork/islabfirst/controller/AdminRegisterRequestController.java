package com.labwork.islabfirst.controller;


import com.labwork.islabfirst.dto.AdminRegisterRequestDto;
import com.labwork.islabfirst.dto.response.RoleResponse;
import com.labwork.islabfirst.dto.request.AdminRegisterRequestRequest;
import com.labwork.islabfirst.service.authentication.AdminRegisterRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin-requests")
@RequiredArgsConstructor
public class AdminRegisterRequestController {

    private final AdminRegisterRequestService adminRegisterRequestService;

    @GetMapping("/pending")
    public ResponseEntity<Page<AdminRegisterRequestDto>> getPendingRequests(
            @PageableDefault Pageable pageable) {
        Page<AdminRegisterRequestDto> pendingRequests = adminRegisterRequestService.getPendingRequests(pageable);
        return ResponseEntity.ok(pendingRequests);
    }

    @GetMapping("/pending/user/{userId}")
    public ResponseEntity<AdminRegisterRequestDto> getRequestByUserId(@PathVariable Long userId) {
        AdminRegisterRequestDto request = adminRegisterRequestService.getRequestByUserId(userId);
        return ResponseEntity.ok(request);
    }
    @GetMapping("/role")
    public ResponseEntity<RoleResponse> getCurrentUserRoles() {
        return ResponseEntity.ok(adminRegisterRequestService.getRoleResponse());
    }

    @PostMapping("/create")
    public ResponseEntity<AdminRegisterRequestDto> createAdminRequest(
            @RequestBody AdminRegisterRequestRequest requestDto) {

        boolean isRequestPending = adminRegisterRequestService.isRequestPendingByUsername(requestDto.username());

        if (isRequestPending){
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(null);
        }

        AdminRegisterRequestDto createdRequest = adminRegisterRequestService.createAdminRequest(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRequest);
    }

    @PatchMapping("/pending/{requestId}/approve")
    public ResponseEntity<Void> approveRequest(@PathVariable Long requestId) {
        adminRegisterRequestService.approveAdminRequest(requestId);
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/pending/{requestId}/reject")
    public ResponseEntity<Void> rejectRequest(@PathVariable Long requestId) {
        adminRegisterRequestService.rejectAdminRequest(requestId);
        return ResponseEntity.ok().build();
    }

}
