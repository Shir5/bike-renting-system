package com.labwork.islabfirst.service.authentication;

import com.labwork.islabfirst.dto.response.JwtResponse;
import com.labwork.islabfirst.dto.request.LoginRequest;
import com.labwork.islabfirst.dto.request.RegisterRequest;
import com.labwork.islabfirst.dto.UserDto;
import com.labwork.islabfirst.mapper.UserMapper;
import com.labwork.islabfirst.entity.security.Role;
import com.labwork.islabfirst.entity.security.User;
import com.labwork.islabfirst.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;


    public JwtResponse authenticate(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                 )
        );
        var user = findUserByUsername(request.username());
        return generateJwt(user);
    }


    public JwtResponse registerUser(RegisterRequest request) {
        if (request.password().length() < 4) {
            throw new IllegalArgumentException("Password must be at least 4 characters long.");
        }

        var user = createUser(request);
        return generateJwt(user);
    }


    private User createUser(RegisterRequest request) {
        validateRegisterRequest(request);
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.USER);
        return userRepository.save(user);
    }

    private JwtResponse generateJwt(User user) {
        String jwt = jwtService.generateToken(user);
        return new JwtResponse(jwt);
    }



    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationServiceException("User not found with id: " + userId));
    }

    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    private void validateRegisterRequest(RegisterRequest request) {
        validateUsername(request.username());
    }

    private void validateUsername(String username) {
        if (userRepository.existsByUsername(username)) {
            throw new AuthenticationServiceException("Username " + username + " is taken");
        }
    }

}
