CREATE TABLE maintenances (
    id              UUID PRIMARY KEY,
    vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
    type            VARCHAR(30) NOT NULL,
    registered_km   INTEGER NOT NULL,
    performed_at    DATE NOT NULL,
    next_due_km     INTEGER,
    next_due_date   DATE
);

CREATE TABLE documents (
    id           UUID PRIMARY KEY,
    vehicle_id   UUID NOT NULL REFERENCES vehicles(id),
    type         VARCHAR(30) NOT NULL,
    issued_at    DATE NOT NULL,
    expires_at   DATE NOT NULL
);

CREATE TABLE fuels (
    id            UUID PRIMARY KEY,
    vehicle_id    UUID NOT NULL REFERENCES vehicles(id),
    type          VARCHAR(20),
    refueled_at   DATE NOT NULL,
    liters        NUMERIC(8,2) NOT NULL,
    total_cost    NUMERIC(10,2) NOT NULL,
    odometer_km   INTEGER NOT NULL
);

CREATE TABLE trips (
    id            UUID PRIMARY KEY,
    vehicle_id    UUID NOT NULL REFERENCES vehicles(id),
    driver_id     UUID NOT NULL REFERENCES drivers(id),
    origin        VARCHAR(150) NOT NULL,
    destination   VARCHAR(150) NOT NULL,
    distance_km   INTEGER NOT NULL,
    trip_date     DATE NOT NULL
);