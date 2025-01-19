package com.labwork.islabfirst.service.authentication;


import com.labwork.islabfirst.dto.AdminRegisterRequestDto;
import com.labwork.islabfirst.dto.response.RoleResponse;
import com.labwork.islabfirst.dto.request.AdminRegisterRequestRequest;
import com.labwork.islabfirst.mapper.AdminRegisterRequestMapper;
import com.labwork.islabfirst.mapper.UserMapper;
import com.labwork.islabfirst.entity.security.AdminRegisterRequest;
import com.labwork.islabfirst.entity.security.RequestStatus;
import com.labwork.islabfirst.entity.security.Role;
import com.labwork.islabfirst.entity.security.User;
import com.labwork.islabfirst.repository.AdminRegisterRequestRepository;
import com.labwork.islabfirst.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminRegisterRequestService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final AdminRegisterRequestMapper adminRegisterRequestMapper;
    private final SimpMessagingTemplate messagingTemplate;  // Внедрение SimpMessagingTemplate
    private final AdminRegisterRequestRepository adminRequestRepository;

    private final JwtService jwtService;

    // Проверка, есть ли администраторы в системе

    // Получить все заявки с статусом "Pending"
    public Page<AdminRegisterRequestDto> getPendingRequests(Pageable pageable) {
        Page<AdminRegisterRequest> pendingRequests = adminRequestRepository.findByStatus(RequestStatus.PENDING, pageable);
        return pendingRequests.map(adminRegisterRequestMapper::toDto);
    }
    // Получить заявку по ID пользователя
    public AdminRegisterRequestDto getRequestByUserId(Long userId) {
        AdminRegisterRequest adminRequest = adminRequestRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Admin request not found for user ID: " + userId));
        return adminRegisterRequestMapper.toDto(adminRequest);
    }
    // Создать заявку на становление администратором
    public AdminRegisterRequestDto createAdminRequest(AdminRegisterRequestRequest requestDto) {
        if (!hasRegisteredAdmins()) {
            return registerFirstAdminAutomatically(requestDto);
        }else{
            AdminRegisterRequest adminRequest = new AdminRegisterRequest();
            adminRequest.setUser(userRepository.findByUsername(requestDto.username()).orElseThrow(() -> new RuntimeException("User not found")));
            adminRequest.setDescription(requestDto.description());
            adminRequest.setStatus(RequestStatus.PENDING);
            adminRequest.setCreatedDate(LocalDateTime.now());

            AdminRegisterRequest savedRequest = adminRequestRepository.save(adminRequest);
            messagingTemplate.convertAndSend("/topic/newAdminRequest", savedRequest); // Уведомление через WebSocket


            return adminRegisterRequestMapper.toDto(savedRequest);
        }

    }

    // Принять заявку
    public void approveAdminRequest(Long requestId) {
        AdminRegisterRequest adminRequest = adminRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Admin request not found for ID: " + requestId));
        if (isRequestProcessed(adminRequest)) {
            throw new IllegalStateException("Cannot modify a processed request.");
        }
        adminRequest.setStatus(RequestStatus.APPROVED);
        adminRequest.setUpdatedDate(LocalDateTime.now());
        adminRequestRepository.save(adminRequest);

        User user = userRepository.findById(adminRequest.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found for ID: " + adminRequest.getUser().getId()));

        // Изменяем роль пользователя на ADMIN
        user.setRole(Role.ADMIN);
        userRepository.save(user);

    }

    // Отклонить заявку
    public void rejectAdminRequest(Long requestId) {
        AdminRegisterRequest adminRequest = adminRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Admin request not found for ID: " + requestId));
        // Проверяем статус
        if (isRequestProcessed(adminRequest)) {
            throw new IllegalStateException("Cannot modify a processed request.");
        }
        adminRequest.setStatus(RequestStatus.REJECTED);
        adminRequest.setUpdatedDate(LocalDateTime.now());
        adminRequestRepository.save(adminRequest);
        messagingTemplate.convertAndSend("/topic/solvedAdminRequest", adminRequest.getId()); // Уведомление через WebSocket

    }


    // Проверка, есть ли администраторы в системе
    private boolean hasRegisteredAdmins() {
        return userRepository.existsByRole(Role.ADMIN);
    }

    // Регистрация первого администратора автоматически
    private AdminRegisterRequestDto registerFirstAdminAutomatically(AdminRegisterRequestRequest requestDto) {
        User user = userRepository.findByUsername(requestDto.username())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Изменение роли на ADMIN и активность пользователя
        user.setRole(Role.ADMIN);
        userRepository.save(user);

        // Возвращаем успешный ответ
        AdminRegisterRequest adminRequest = new AdminRegisterRequest();
        adminRequest.setUser(user);
        adminRequest.setDescription(requestDto.description());
        adminRequest.setStatus(RequestStatus.APPROVED);
        adminRequest.setCreatedDate(LocalDateTime.now());
        AdminRegisterRequest savedRequest = adminRequestRepository.save(adminRequest);

        return adminRegisterRequestMapper.toDto(savedRequest);
    }
    private boolean isRequestProcessed(AdminRegisterRequest adminRequest) {
        return adminRequest.getStatus() == RequestStatus.APPROVED || adminRequest.getStatus() == RequestStatus.REJECTED;
    }

    public RoleResponse getRoleResponse() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Optional<String> role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst();
        String username = authentication.getName();

        return new RoleResponse(username,role.orElse("ROLE_USER"));
    }
    public boolean isRequestPendingByUsername(String username) {
        // Ищем заявку с таким именем пользователя в статусе PENDING
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Optional<AdminRegisterRequest> existingRequest = adminRequestRepository.findByUserIdAndStatus(user.getId(), RequestStatus.PENDING);
        return existingRequest.isPresent(); // Возвращаем true, если заявка найдена
    }
}
