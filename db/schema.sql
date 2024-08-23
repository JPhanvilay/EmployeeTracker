DROP DATABASE IF EXISTS employees;
CREATE DATABASE employees;

\c employees;

CREATE TABLE departments(
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
);

CREATE TABLE roles(
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL,
    department INTEGER,
    FOREIGN KEY (department) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE employees(
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(30) NOT NULL,
    lastname VARCHAR(30) NOT NULL,
    role_id INTEGER,
    manager_id INTEGER
);