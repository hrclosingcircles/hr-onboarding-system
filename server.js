const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Create SQLite database file
const db = new sqlite3.Database("./database.db");

// Create workers table if not exists
db.run(`
CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT,
    mobile TEXT,
    aadhaar_number TEXT,
    address TEXT,
    uan_number TEXT,
    esic_number TEXT,
    bank_account TEXT,
    ifsc_code TEXT,
    nominee_name TEXT,
    family_details TEXT,
    dob TEXT,
    gender TEXT,
    joining_date TEXT,
    exit_date TEXT,
    position TEXT,
    department TEXT,
    branch_name TEXT,
    company_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

// Add worker
app.post("/api/workers", (req, res) => {
    const {
        full_name,
        mobile,
        aadhaar_number,
        address,
        uan_number,
        esic_number,
        bank_account,
        ifsc_code,
        nominee_name,
        family_details,
        dob,
        gender,
        joining_date,
        exit_date,
        position,
        department,
        branch_name,
        company_name
    } = req.body;

    const sql = `
        INSERT INTO workers (
            full_name, mobile, aadhaar_number, address,
            uan_number, esic_number, bank_account, ifsc_code,
            nominee_name, family_details, dob, gender,
            joining_date, exit_date, position,
            department, branch_name, company_name
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
        full_name, mobile, aadhaar_number, address,
        uan_number, esic_number, bank_account, ifsc_code,
        nominee_name, family_details, dob, gender,
        joining_date, exit_date, position,
        department, branch_name, company_name
    ], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Worker added successfully", id: this.lastID });
    });
});

// Get all workers
app.get("/api/workers", (req, res) => {
    db.all("SELECT * FROM workers", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
