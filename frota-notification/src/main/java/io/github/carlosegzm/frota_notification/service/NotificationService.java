package io.github.carlosegzm.frota_notification.service;

import io.github.carlosegzm.frota_notification.dto.message.ExpirationAlertMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class NotificationService {

    private final JavaMailSender mailSender;

    @Value("${notification.fleet-manager-email}")
    private String fleetManagerEmail;

    public void sendAlertEmail(ExpirationAlertMessage message) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(fleetManagerEmail);
            mail.setSubject("SIGEFROTA Alert - " + message.alertType());
            mail.setText(
                    "Vehicle: " + message.plate() + "\n" +
                            "Alert: " + message.description() + "\n" +
                            "Due date: " + message.dueDate()
            );

            mailSender.send(mail);
            log.info("-> Email sent successfully");

        } catch (Exception e) {
            log.error("-> Error sending email: {}", e.getMessage());
        }


    }

}
