package com.labwork.islabfirst.handler;


public class EntityNotFoundByUsernameException extends jakarta.persistence.EntityNotFoundException {
    public EntityNotFoundByUsernameException(Class<?> entityClass, String username) {
        super(entityClass.getSimpleName() + "not found with username " + username);
    }}
