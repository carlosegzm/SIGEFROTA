package io.github.carlosegzm.frota_core.domain.entities;

import io.github.carlosegzm.frota_core.domain.enums.VehicleStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String plate;

    private String model;

    private String brand;

    private Integer year;

    private Integer currentKm;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status;

    @ManyToMany(mappedBy = "vehicles")
    @Builder.Default
    private List<Driver> drivers = new ArrayList<>();
}
