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
    "Add a department",
    "Add a role",
    "Add an employee",
    "Update an employees' roles",
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
    case "Add a department":
     addDepartment();
     break;
    case "Add a role":
     addRole();
     break;
    case "Add an employee":
     addEmployee();
     break;
    case "Update an employees' roles":
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
   message: "Enter the name of the department:",
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
 pool.query("SELECT id, name FROM departments", (err, res) => {
  if (err) throw err;

  const departments = res.rows;

  inquirer
   .prompt([
    {
     name: "title",
     type: "input",
     message: "Enter the role title:",
    },
    {
     name: "salary",
     type: "input",
     message: "Enter the salary for the role:",
    },
    {
     name: "department_name",
     type: "list",
     message: "Select the department for this role:",
     choices: departments.map((department) => department.name),
    },
   ])
   .then((answers) => {
    const selectedDepartment = departments.find(
     (department) => department.name === answers.department_name
    );
    const department_id = selectedDepartment ? selectedDepartment.id : null;

    pool.query(
     "INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)",
     [answers.title, answers.salary, department_id],
     (err) => {
      if (err) throw err;
      console.log("Role added successfully!");
      startApp();
     }
    );
   });
 });
}

// Add an employees

function addEmployee() {
 pool.query("SELECT id, title FROM roles", (err, roleRes) => {
  if (err) throw err;

  const roles = roleRes.rows;

  pool.query(
   "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees",
   (err, empRes) => {
    if (err) throw err;

    const managers = empRes.rows;

    inquirer
     .prompt([
      {
       name: "first_name",
       type: "input",
       message: "Enter the employee's first name:",
      },
      {
       name: "last_name",
       type: "input",
       message: "Enter the employee's last name:",
      },
      {
       name: "role_title",
       type: "list",
       message: "Select the role for this employee:",
       choices: roles.map((role) => role.title),
      },
      {
       name: "manager_name",
       type: "list",
       message: "Select the manager for this employee (or choose None):",
       choices: ["None", ...managers.map((manager) => manager.name)],
      },
     ])
     .then((answers) => {
      const selectedRole = roles.find(
       (role) => role.title === answers.role_title
      );
      const role_id = selectedRole ? selectedRole.id : null;

      const selectedManager = managers.find(
       (manager) => manager.name === answers.manager_name
      );
      const manager_id = selectedManager ? selectedManager.id : null;

      pool.query(
       "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
       [answers.first_name, answers.last_name, role_id, manager_id || null],
       (err) => {
        if (err) throw err;
        console.log("Employee added successfully!");
        startApp();
       }
      );
     });
   }
  );
 });
}

// Update an employees roles

function updateEmployeeRole() {
 pool.query(
  "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees",
  (err, empRes) => {
   if (err) throw err;

   const employees = empRes.rows;

   pool.query("SELECT id, title FROM roles", (err, roleRes) => {
    if (err) throw err;

    const roles = roleRes.rows;

    inquirer
     .prompt([
      {
       name: "employee_name",
       type: "list",
       message: "Select the employee to update:",
       choices: employees.map((employee) => employee.name),
      },
      {
       name: "role_title",
       type: "list",
       message: "Select the new role for this employee:",
       choices: roles.map((role) => role.title),
      },
     ])
     .then((answers) => {
      const selectedEmployee = employees.find(
       (employee) => employee.name === answers.employee_name
      );
      const employee_id = selectedEmployee ? selectedEmployee.id : null;

      const selectedRole = roles.find(
       (role) => role.title === answers.role_title
      );
      const role_id = selectedRole ? selectedRole.id : null;

      pool.query(
       "UPDATE employees SET role_id = $1 WHERE id = $2",
       [role_id, employee_id],
       (err) => {
        if (err) throw err;
        console.log("Employee role updated successfully!");
        startApp();
       }
      );
     });
   });
  }
 );
}

// Start the app
startApp();

app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});
