\c employees_db;

INSERT INTO departments (name)
VALUES 
    ('Engineering'),
    ('Finance'),
    ('Human Resources'),
    ('Marketing'),
    ('Sales');

INSERT INTO roles (title, salary, department_id)
VALUES 
    ('Software Engineer', 80000, 1),
    ('Lead Engineer', 120000, 1),
    ('Accountant', 70000, 2),
    ('HR Manager', 90000, 3),
    ('Marketing Coordinator', 60000, 4),
    ('Sales Representative', 50000, 5);


INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES 
    ('John', 'Doe', 1, NULL), 
    ('Jane', 'Smith', 2, 1),  
    ('Sarah', 'Johnson', 3, NULL), 
    ('Mike', 'Brown', 4, NULL), 
    ('Emily', 'Davis', 5, NULL), 
    ('James', 'Wilson', 6, 5);  