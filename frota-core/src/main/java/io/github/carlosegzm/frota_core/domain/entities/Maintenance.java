package io.github.carlosegzm.frota_core.domain.entities;

import io.github.carlosegzm.frota_core.domain.enums.MaintenanceType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "maintenances")
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(unique = true, nullable = false)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceType type;

    @Column(nullable = false)
    private Integer registeredKm;

    @Column(nullable = false)
    private LocalDate performedAt;

    private Integer nextDueKm;

    private LocalDate nextDueDate;
}
