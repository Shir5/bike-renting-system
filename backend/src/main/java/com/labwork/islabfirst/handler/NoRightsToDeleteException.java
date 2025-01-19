package com.labwork.islabfirst.handler;

public class NoRightsToDeleteException extends RuntimeException {
    public NoRightsToDeleteException(String message) {
        super(message);
    }
}
