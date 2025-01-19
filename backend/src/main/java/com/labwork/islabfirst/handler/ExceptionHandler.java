package com.labwork.islabfirst.handler;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ControllerAdvice;

@ControllerAdvice
public class ExceptionHandler {

    @org.springframework.web.bind.annotation.ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Object> handleAuthenticationException(AuthenticationException e) {
        return new ResponseEntity<>("Cannot authenticate: " + e.getMessage(), HttpStatus.FORBIDDEN);
    }
    // Обработка исключений для случая, когда персона используется в фильмах
    @org.springframework.web.bind.annotation.ExceptionHandler(PersonInUseException.class)
    public ResponseEntity<Object> handlePersonInUseException(PersonInUseException e) {
        return new ResponseEntity<>("Person in use: "+e.getMessage(), HttpStatus.BAD_REQUEST);
    }
}
