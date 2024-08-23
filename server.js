const express = require("express");
const inquirer = require("inquirer");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3001;

// Setup PostgreSQL client
const pool = new Pool({
 user: "postgres",
 password: "dragon12",
 host: "localhost",
 database: "employees_db",
});

pool.connect();

// Start the application
function startApp() {
 inquirer
  .prompt({
   name: "action",
   type: "list",
   message: "What would you like to do?",
   choices: [
    "View all departments",
    "View all roles",
    "View all employees",
    "Add a departments",
    "Add a roles",
    "Add an employees",
    "Update an employees roles",
    "Exit",
   ],
  })
  .then((answer) => {
   switch (answer.action) {
    case "View all departments":
     viewAllDepartments();
     break;
    case "View all roles":
     viewAllRoles();
     break;
    case "View all employees":
     viewAllEmployees();
     break;
    case "Add a departments":
     addDepartment();
     break;
    case "Add a roles":
     addRole();
     break;
    case "Add an employees":
     addEmployee();
     break;
    case "Update an employees roles":
     updateEmployeeRole();
     break;
    case "Exit":
     pool.end();
     process.exit();
     break;
   }
  });
}

// View all departments
function viewAllDepartments() {
 pool.query("SELECT id, name FROM departments", (err, res) => {
  if (err) throw err;
  console.table(res.rows);
  startApp();
 });
}

// View all roles
function viewAllRoles() {
 const query = `
    SELECT roles.id, roles.title, roles.salary, departments.name AS departments
    FROM roles
    JOIN departments ON roles.department_id = departments.id
  `;
 pool.query(query, (err, res) => {
  if (err) throw err;
  console.table(res.rows);
  startApp();
 });
}

// View all employees
function viewAllEmployees() {
 const query = `
    SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS departments, roles.salary, 
           CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employees
    LEFT JOIN roles ON employees.role_id = roles.id
    LEFT JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees manager ON manager.id = employees.manager_id
  `;
 pool.query(query, (err, res) => {
  if (err) throw err;
  console.table(res.rows);
  startApp();
 });
}

// Add a departments
function addDepartment() {
 inquirer
  .prompt({
   name: "department_name",
   type: "input",
   message: "Enter the name of the departments:",
  })
  .then((answer) => {
   pool.query(
    "INSERT INTO departments (name) VALUES ($1)",
    [answer.department_name],
    (err) => {
     if (err) throw err;
     console.log("Department added successfully!");
     startApp();
    }
   );
  });
}

// Add a roles
function addRole() {
 inquirer
  .prompt([
   {
    name: "title",
    type: "input",
    message: "Enter the roles title:",
   },
   {
    name: "salary",
    type: "input",
    message: "Enter the salary for the roles:",
   },
   {
    name: "department_id",
    type: "input",
    message: "Enter the departments ID for the roles:",
   },
  ])
  .then((answers) => {
   pool.query(
    "INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)",
    [answers.title, answers.salary, answers.department_id],
    (err) => {
     if (err) throw err;
     console.log("Role added successfully!");
     startApp();
    }
   );
  });
}

// Add an employees
function addEmployee() {
 inquirer
  .prompt([
   {
    name: "first_name",
    type: "input",
    message: "Enter the employees's first name:",
   },
   {
    name: "last_name",
    type: "input",
    message: "Enter the employees's last name:",
   },
   {
    name: "role_id",
    type: "input",
    message: "Enter the employees's roles ID:",
   },
   {
    name: "manager_id",
    type: "input",
    message: "Enter the manager's ID (or leave blank if none):",
   },
  ])
  .then((answers) => {
   pool.query(
    "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
    [
     answers.first_name,
     answers.last_name,
     answers.role_id,
     answers.manager_id || null,
    ],
    (err) => {
     if (err) throw err;
     console.log("Employee added successfully!");
     startApp();
    }
   );
  });
}

// Update an employees roles
function updateEmployeeRole() {
 inquirer
  .prompt([
   {
    name: "employee_id",
    type: "input",
    message: "Enter the ID of the employees you want to update:",
   },
   {
    name: "new_role_id",
    type: "input",
    message: "Enter the new roles ID for the employees:",
   },
  ])
  .then((answers) => {
   pool.query(
    "UPDATE employees SET role_id = $1 WHERE id = $2",
    [answers.new_role_id, answers.employee_id],
    (err) => {
     if (err) throw err;
     console.log("Employee roles updated successfully!");
     startApp();
    }
   );
  });
}

// Start the app
startApp();

app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});
