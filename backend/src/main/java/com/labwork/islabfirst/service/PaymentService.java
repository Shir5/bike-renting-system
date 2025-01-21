package com.labwork.islabfirst.service;

import com.labwork.islabfirst.dto.BicycleDto;
import com.labwork.islabfirst.dto.PaymentDto;
import com.labwork.islabfirst.dto.request.CreateBicycleRequest;
import com.labwork.islabfirst.dto.request.CreatePaymentRequest;
import com.labwork.islabfirst.entity.model.Station;
import com.labwork.islabfirst.entity.security.User;
import com.labwork.islabfirst.handler.EntityNotFoundByIdException;
import com.labwork.islabfirst.handler.EntityNotFoundByUsernameException;
import com.labwork.islabfirst.mapper.PaymentMapper;
import com.labwork.islabfirst.repository.PaymentRepository;
import com.labwork.islabfirst.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PaymentMapper paymentMapper;

    public Page<PaymentDto> findAllByUser(String name, Pageable pageable) {
        if (name != null) {

            User user = userRepository.findByUsername(name)
                    .orElseThrow(() -> new EntityNotFoundByUsernameException(User.class, name));
            return paymentRepository.findAllByUser(user, pageable).map(paymentMapper::toDto);
        }

        return paymentRepository.findAll(pageable).map(paymentMapper::toDto);
    }


    @Transactional(isolation = Isolation.SERIALIZABLE)
    public PaymentDto create(CreatePaymentRequest request) {

        var payment = paymentMapper.toEntity(request);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();


        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundByUsernameException(User.class, username));

        user.setBalance(user.getBalance() + payment.getAmount());
        payment.setUser(user);

        var saved = paymentRepository.save(payment);

//        messagingTemplate.convertAndSend("/topic/newPerson", personMapper.toDto(saved));
        return paymentMapper.toDto(saved);
    }
}
