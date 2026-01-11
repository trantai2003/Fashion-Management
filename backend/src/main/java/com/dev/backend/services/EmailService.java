package com.dev.backend.services;

import com.dev.backend.exception.customize.CommonException;
import jakarta.mail.MessagingException;

import java.util.Map;

public interface EmailService {
    void sendEmail(String to, String subject, String content) throws MessagingException;

    void sendHtmlEmail(String to, String subject, String htmlTemplate, Map<String, Object> parameters) throws CommonException;

    void sendHtmlEmailFromTemplate(String to, String subject, String templateFileName, Map<String, Object> parameters) throws CommonException;

    String loadTemplate(String templateFileName) throws CommonException;

    void clearTemplateCache();

    void clearTemplate(String templateFileName);

}