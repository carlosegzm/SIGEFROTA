CREATE TABLE vehicles (
    id             UUID PRIMARY KEY,
    plate          VARCHAR(10) NOT NULL UNIQUE,
    model          VARCHAR(100),
    brand          VARCHAR(100),
    year           INTEGER,
    current_km     INTEGER,
    status         VARCHAR(20) NOT NULL
);

CREATE TABLE drivers (
    id                    UUID PRIMARY KEY,
    name                  VARCHAR(150) NOT NULL,
    license_number        VARCHAR(20),
    license_category      VARCHAR(5),
    license_expiration    DATE,
    phone                 VARCHAR(20) NOT NULL
);

CREATE TABLE driver_vehicle (
    driver_id   UUID NOT NULL REFERENCES drivers(id),
    vehicle_id  UUID NOT NULL REFERENCES vehicles(id),
    PRIMARY KEY (driver_id, vehicle_id)
);