package io.github.carlosegzm.frota_core.scheduler;

import io.github.carlosegzm.frota_core.domain.entities.Document;
import io.github.carlosegzm.frota_core.domain.entities.Maintenance;
import io.github.carlosegzm.frota_core.domain.enums.AlertType;
import io.github.carlosegzm.frota_core.dto.message.ExpirationAlertMessage;
import io.github.carlosegzm.frota_core.repository.DocumentRepository;
import io.github.carlosegzm.frota_core.repository.MaintenanceRepository;
import io.github.carlosegzm.frota_core.messaging.ExpirationAlertPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Component
public class ExpirationCheckJob {

    private static final int ALERT_WINDOW_DAYS = 30;

    private final MaintenanceRepository maintenanceRepository;
    private final DocumentRepository documentRepository;
    private final ExpirationAlertPublisher expirationAlertPublisher;

    @Scheduled(cron = "0 0 8 * * *")
    public void checkUpcomingExpirations() {
        LocalDate alertWindow = LocalDate.now().plusDays(ALERT_WINDOW_DAYS);

        List<Maintenance> upcomingMaintenances = maintenanceRepository.findByNextDueDateBefore(alertWindow);
        List<Document> upcomingDocuments = documentRepository.findByExpiresAtBefore(alertWindow);

        upcomingMaintenances.forEach(maintenance -> {
            ExpirationAlertMessage message = new ExpirationAlertMessage(
                    maintenance.getVehicle().getId(),
                    maintenance.getVehicle().getPlate(),
                    AlertType.MAINTENANCE,
                    "Maintenance due: " + maintenance.getType(),
                    maintenance.getNextDueDate()
            );
            expirationAlertPublisher.publish(message);
        });

        upcomingDocuments.forEach(document -> {
            ExpirationAlertMessage message = new ExpirationAlertMessage(
                    document.getVehicle().getId(),
                    document.getVehicle().getPlate(),
                    AlertType.DOCUMENT,
                    "Document expiring: " + document.getType(),
                    document.getExpiresAt()
            );
            expirationAlertPublisher.publish(message);
        });

    }


}
