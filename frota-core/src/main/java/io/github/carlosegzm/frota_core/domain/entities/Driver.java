package io.github.carlosegzm.frota_core.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "drivers")
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(unique = true, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String licenseNumber;

    private String licenseCategory;

    private LocalDate licenseExpiration;

    @Column(nullable = false)
    private String phone;

    @ManyToMany
    @JoinTable(
            name = "driver_vehicle",
            joinColumns = @JoinColumn(name = "driver_id"),
            inverseJoinColumns = @JoinColumn(name = "vehicle_id")
    )
    @Builder.Default
    private List<Vehicle> vehicles = new ArrayList<>();

}
