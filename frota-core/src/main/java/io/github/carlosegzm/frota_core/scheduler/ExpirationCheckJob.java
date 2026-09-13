package io.github.carlosegzm.frota_core.scheduler;

import io.github.carlosegzm.frota_core.domain.entities.Document;
import io.github.carlosegzm.frota_core.domain.entities.Maintenance;
import io.github.carlosegzm.frota_core.repository.DocumentRepository;
import io.github.carlosegzm.frota_core.repository.MaintenanceRepository;
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

    @Scheduled(cron = "0 0 8 * * *")
    public void checkUpcomingExpirations() {
        LocalDate alertWindow = LocalDate.now().plusDays(ALERT_WINDOW_DAYS);

        List<Maintenance> upcomingMaintenances = maintenanceRepository.findByNextDueDateBefore(alertWindow);
        List<Document> upcomingDocuments = documentRepository.findByExpiresAtBefore(alertWindow);

        log.info("Found {} maintenance(s) approaching due date", upcomingMaintenances.size());
        log.info("Found {} document(s) approaching expiration", upcomingDocuments.size());

        upcomingMaintenances.forEach(maintenance ->
                log.info("Maintenance {} for vehicle {} is due on {}",
                        maintenance.getId(), maintenance.getVehicle().getPlate(), maintenance.getNextDueDate())
        );

        upcomingDocuments.forEach(document ->
                log.info("Document {} for vehicle {} expires on {}",
                        document.getId(), document.getVehicle().getPlate(), document.getExpiresAt())
        );

    }


}
