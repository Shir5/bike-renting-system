package com.labwork.islabfirst.handler;

public class PersonInUseException extends RuntimeException {
    public PersonInUseException(String message) {
        super(message);
    }
}
