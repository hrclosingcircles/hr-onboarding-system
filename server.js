const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// ================= POSTGRES CONNECTION =================

const pool = new Pool({
connectionString: process.env.DATABASE_URL,
ssl: { rejectUnauthorized: false }
});


// ================= UPLOAD FOLDER =================

const uploadDir = path.join(__dirname,"uploads");

if(!fs.existsSync(uploadDir)){
fs.mkdirSync(uploadDir);
}

app.use("/uploads",express.static(uploadDir));


// ================= MULTER =================

const storage = multer.diskStorage({
destination:(req,file,cb)=>cb(null,uploadDir),
filename:(req,file,cb)=>cb(null,Date.now()+"-"+file.originalname)
});

const upload = multer({storage});


// ======================================================
// CREATE TABLE + MIGRATION (RUNS ON SERVER START)
// ======================================================

async function initDB(){

await pool.query(`

CREATE TABLE IF NOT EXISTS onboarding(

id SERIAL PRIMARY KEY,

offer_id TEXT,

candidate_name TEXT,
designation TEXT,
salary TEXT,
work_location TEXT,
date_of_joining TEXT,

mobile TEXT,
email TEXT,

status TEXT DEFAULT 'Pending',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

father_name TEXT,
dob TEXT,
gender TEXT,
address TEXT,
city TEXT,
state TEXT,
pincode TEXT,

bank_name TEXT,
account_number TEXT,
ifsc TEXT,

emergency_name TEXT,
emergency_contact TEXT,

qualification TEXT,
university TEXT,
passing_year TEXT,

signature TEXT,

aadhaar TEXT,
pan TEXT,
bank_proof TEXT,
photo TEXT,
signed_appointment TEXT

)

`);

}

initDB();


// ======================================================
// GET ALL EMPLOYEES
// ======================================================

app.get("/api/offers", async(req,res)=>{

try{

const result = await pool.query(
"SELECT * FROM onboarding ORDER BY id DESC"
);

res.json({
success:true,
data:result.rows
});

}
catch(err){

console.log(err);

res.status(500).json({success:false});

}

});


// ======================================================
// CREATE OFFER
// ======================================================

app.post("/api/offers/create",async(req,res)=>{

try{

const{
candidate_name,
email,
mobile,
designation,
salary,
work_location,
date_of_joining
}=req.body;

const offer_id =
"OFF-"+Math.random().toString(36).substring(2,8).toUpperCase();

await pool.query(
`INSERT INTO onboarding
(offer_id,candidate_name,designation,salary,work_location,date_of_joining,email,mobile)
VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
[
offer_id,
candidate_name,
designation,
salary,
work_location,
date_of_joining,
email,
mobile
]
);

const link=
`https://hr-frontend-bay.vercel.app/onboarding/${offer_id}`;

res.json({
success:true,
onboarding_link:link
});

}
catch(err){

console.log(err);

res.status(500).json({success:false});

}

});


// ======================================================
// GET OFFER FOR ONBOARDING PAGE
// ======================================================

app.get("/api/offers/:offer_id",async(req,res)=>{

try{

const offer_id=req.params.offer_id;

const result = await pool.query(
"SELECT * FROM onboarding WHERE offer_id=$1",
[offer_id]
);

if(result.rows.length===0){
return res.status(404).json({success:false});
}

res.json(result.rows[0]);

}
catch(err){

console.log(err);

res.status(500).json({success:false});

}

});


// ======================================================
// SUBMIT ONBOARDING
// ======================================================

app.post(
"/api/offers/:offer_id/submit",

upload.fields([
{name:"aadhaar"},
{name:"pan"},
{name:"bank_proof"},
{name:"photo"},
{name:"signedAppointment"}
]),

async(req,res)=>{

try{

const offer_id=req.params.offer_id;

let joining={};

if(req.body.joiningDetails){
joining=JSON.parse(req.body.joiningDetails);
}

const signature=req.body.signature || null;

const aadhaar=req.files?.aadhaar?.[0]?.filename || null;
const pan=req.files?.pan?.[0]?.filename || null;
const bank_proof=req.files?.bank_proof?.[0]?.filename || null;
const photo=req.files?.photo?.[0]?.filename || null;
const signed_appointment=req.files?.signedAppointment?.[0]?.filename || null;

await pool.query(

`UPDATE onboarding SET

father_name=$1,
dob=$2,
gender=$3,
address=$4,
city=$5,
state=$6,
pincode=$7,

bank_name=$8,
account_number=$9,
ifsc=$10,

emergency_name=$11,
emergency_contact=$12,

qualification=$13,
university=$14,
passing_year=$15,

signature=$16,

aadhaar=$17,
pan=$18,
bank_proof=$19,
photo=$20,
signed_appointment=$21,

status='Completed'

WHERE offer_id=$22
`,

[
joining.father_name,
joining.dob,
joining.gender,
joining.address,
joining.city,
joining.state,
joining.pincode,

joining.bank_name,
joining.account_number,
joining.ifsc,

joining.emergency_name,
joining.emergency_contact,

joining.qualification,
joining.university,
joining.passing_year,

signature,

aadhaar,
pan,
bank_proof,
photo,
signed_appointment,

offer_id
]

);

res.json({
success:true,
message:"Onboarding submitted"
});

}
catch(err){

console.log(err);

res.status(500).json({success:false});

}

});


// ======================================================
// DELETE EMPLOYEE
// ======================================================

app.delete("/api/offers/:id",async(req,res)=>{

try{

const id=req.params.id;

await pool.query(
"DELETE FROM onboarding WHERE id=$1",
[id]
);

res.json({success:true});

}
catch(err){

console.log(err);

res.status(500).json({success:false});

}

});


// ======================================================
// OFFER LETTER
// ======================================================

app.get("/api/offers/:id/offer-letter",async(req,res)=>{

try{

const id=req.params.id;

const result = await pool.query(
"SELECT * FROM onboarding WHERE id=$1",
[id]
);

if(result.rows.length===0){
return res.send("Offer not found");
}

const row=result.rows[0];

const html=`

<h1>Appointment Letter</h1>

<p>Name: ${row.candidate_name}</p>
<p>Designation: ${row.designation}</p>
<p>Salary: ${row.salary}</p>
<p>Location: ${row.work_location}</p>
<p>Joining Date: ${row.date_of_joining}</p>

<h3>Employee Signature</h3>

<img src="${row.signature}" width="200"/>

`;

res.send(html);

}
catch(err){

console.log(err);

res.status(500).send("Error");

}

});


// ======================================================
// SERVER START
// ======================================================

app.listen(PORT,()=>{
console.log("Server running on port",PORT);
});