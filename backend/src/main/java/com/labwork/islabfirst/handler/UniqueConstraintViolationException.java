package com.labwork.islabfirst.handler;

import jakarta.validation.ValidationException;

public class UniqueConstraintViolationException extends ValidationException {
    public UniqueConstraintViolationException(Class<?> entity, String field, String value) {
        super(String.format(
                "Value '%s' of field '%s' for entity '%s' violates unique constraint",
                value, field, entity.getSimpleName()
        ));
    }
}