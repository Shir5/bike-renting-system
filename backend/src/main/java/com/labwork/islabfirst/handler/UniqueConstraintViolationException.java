package com.labwork.islabfirst.handler;

import jakarta.validation.ValidationException;

public class UniqueConstraintViolationException extends ValidationException {
    public UniqueConstraintViolationException(Class<?> entity, String field) {
        super(String.format(
                "Value of field '%s' for entity '%s' violates unique constraint",
                field, entity.getSimpleName()
        ));
    }
}