package com.labwork.islabfirst.handler;

public class EntityNotFoundByIdException extends jakarta.persistence.EntityNotFoundException {
    public EntityNotFoundByIdException(Class<?> entityClass, Long id) {
        super(entityClass.getSimpleName() + "not found with id " + id);
    }}
