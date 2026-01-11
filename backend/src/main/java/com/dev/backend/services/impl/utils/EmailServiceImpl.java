package com.dev.backend.services.impl.utils;


import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    // Cache template
    private final Map<String, String> templateCache = new ConcurrentHashMap<>();

    /**
     * Gửi email
     * @param to
     * @param subject
     * @param content
     * @throws CommonException
     */
    @Override
    public void sendEmail(String to, String subject, String content) throws CommonException {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
            log.info("[sendEmail] Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("[sendEmail] Error sending email to: {}", to, e);
            throw new CommonException("Error sending email to: " + to, e);
        }
    }


    /**
     * Gửi email HTML với template và parameters
     *
     * @param to           Email người nhận
     * @param subject      Tiêu đề email
     * @param htmlTemplate HTML template với placeholders dạng {{key}}
     * @param parameters   Map chứa key-value để thay thế placeholders
     * @throws CommonException
     */
    public void sendHtmlEmail(String to, String subject, String htmlTemplate, Map<String, Object> parameters) throws CommonException {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);

            // Replace placeholders in template
            String processedHtml = processTemplate(htmlTemplate, parameters);
            helper.setText(processedHtml, true); // true = isHtml

            mailSender.send(mimeMessage);
            log.info("[sendHtmlEmail] HTML email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("[sendHtmlEmail] Error creating HTML email for: {}", to, e);
            throw new CommonException("Error creating HTML email for: " + to, e);
        } catch (Exception e) {
            log.error("[sendHtmlEmail] Error sending HTML email to: {}", to, e);
            throw new CommonException("Error sending HTML email to: " + to, e);
        }
    }


    /**
     * Gửi email HTML từ template file với parameters
     * @param to Email người nhận
     * @param subject Tiêu đề email
     * @param templateFileName Tên file template trong resources/templates (không cần .html)
     * @param parameters Map chứa key-value để thay thế placeholders
     * @throws CommonException
     */
    public void sendHtmlEmailFromTemplate(String to, String subject, String templateFileName, Map<String, Object> parameters) throws CommonException {
        try {
            String htmlTemplate = loadTemplate(templateFileName);
            sendHtmlEmail(to, subject, htmlTemplate, parameters);
        } catch (Exception e) {
            log.error("[sendHtmlEmailFromTemplate] Error sending email from template {} to: {}", templateFileName, to, e);
            throw new CommonException("Error sending email from template " + templateFileName + " to: " + to, e);
        }
    }


    /**
     * Xử lý template bằng cách thay thế placeholders {{key}} bằng values
     *
     * @param template   HTML template
     * @param parameters Map chứa key-value
     * @return Processed HTML string
     */
    private String processTemplate(String template, Map<String, Object> parameters) {
        if (template == null || parameters == null || parameters.isEmpty()) {
            return template;
        }

        String result = template;

        // Pattern để tìm placeholders dạng {{key}}
        Pattern pattern = Pattern.compile("\\{\\{(\\w+)\\}\\}");
        Matcher matcher = pattern.matcher(template);

        while (matcher.find()) {
            String placeholder = matcher.group(0); // {{key}}
            String key = matcher.group(1); // key

            Object value = parameters.get(key);
            String replacement = value != null ? value.toString() : "";

            result = result.replace(placeholder, replacement);
        }

        return result;
    }


    /**
     * Đọc template từ file trong resources/templates
     * @param templateFileName Tên file (không cần .html)
     * @return HTML content string
     * @throws CommonException
     */
    public String loadTemplate(String templateFileName) throws CommonException {
        // Kiểm tra cache trước
        String cacheKey = templateFileName;
        if (templateCache.containsKey(cacheKey)) {
            log.debug("[loadTemplate] Template {} loaded from cache", templateFileName);
            return templateCache.get(cacheKey);
        }

        try {
            // Thêm .html nếu chưa có
            String fileName = templateFileName.endsWith(".html") ? templateFileName : templateFileName + ".html";
            String templatePath = "templates/" + fileName;

            ClassPathResource resource = new ClassPathResource(templatePath);

            if (!resource.exists()) {
                log.error("[loadTemplate] Template file not found: {}", templatePath);
                throw new CommonException("Template file not found: " + templatePath);
            }

            try (InputStream inputStream = resource.getInputStream()) {
                byte[] bytes = FileCopyUtils.copyToByteArray(inputStream);
                String template = new String(bytes, StandardCharsets.UTF_8);

                // Cache template
                templateCache.put(cacheKey, template);
                log.info("[loadTemplate] Template {} loaded and cached successfully", templateFileName);

                return template;
            }
        } catch (IOException e) {
            log.error("[loadTemplate] Error loading template: {}", templateFileName, e);
            throw new CommonException("Error loading template: " + templateFileName, e);
        }
    }

    /**
     * Clear template cache (useful for development/testing)
     */
    public void clearTemplateCache() {
        templateCache.clear();
        log.info("[clearTemplateCache] Template cache cleared");
    }

    /**
     * Clear specific template from cache
     * @param templateFileName Template name to clear
     */
    public void clearTemplate(String templateFileName) {
        templateCache.remove(templateFileName);
        log.info("[clearTemplate] Template {} cleared from cache", templateFileName);
    }
}