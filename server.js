const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({limit:"20mb"}));
app.use(express.urlencoded({extended:true}));

// ================= DATABASE =================

const db = new sqlite3.Database("./hr.db",(err)=>{
if(err) console.log(err);
else console.log("SQLite Connected");
});

// ================= UPLOAD FOLDER =================

const uploadDir = path.join(__dirname,"uploads");

if(!fs.existsSync(uploadDir)){
fs.mkdirSync(uploadDir);
}

app.use("/uploads",express.static(uploadDir));

// ================= MULTER =================

const storage = multer.diskStorage({

destination:(req,file,cb)=>{
cb(null,uploadDir);
},

filename:(req,file,cb)=>{
cb(null,Date.now()+"-"+file.originalname);
}

});

const upload = multer({storage});


// ===================================================
// ================= GET ALL EMPLOYEES ===============
// ===================================================

app.get("/api/offers",(req,res)=>{

db.all(
"SELECT * FROM onboarding ORDER BY id DESC",
[],
(err,rows)=>{

if(err){
return res.status(500).json({success:false});
}

res.json({
success:true,
data:rows
});

});

});


// ===================================================
// ================= OFFER LETTER DOWNLOAD ===========
// ===================================================

app.get("/api/offers/:id/offer-letter",(req,res)=>{

const id=req.params.id;

db.get(
"SELECT * FROM onboarding WHERE id=?",
[id],
(err,row)=>{

if(err || !row){
return res.status(404).send("Offer not found");
}

const letter=`
OFFER LETTER

Name: ${row.candidate_name}

Designation: ${row.designation}

Salary: ${row.salary}

Location: ${row.work_location}

Joining Date: ${row.date_of_joining}

Welcome to Closing Circles.
`;

res.setHeader(
"Content-Disposition",
`attachment; filename=offer_${row.id}.txt`
);

res.send(letter);

});

});


// ===================================================
// ================= DELETE EMPLOYEE =================
// ===================================================

app.delete("/api/offers/:id",(req,res)=>{

const id=req.params.id;

db.run(
"DELETE FROM onboarding WHERE id=?",
[id],
function(err){

if(err){
return res.status(500).json({success:false});
}

res.json({
success:true,
message:"Employee deleted"
});

});

});


// ===================================================
// ================= CREATE OFFER ====================
// ===================================================

app.post("/api/offers/create",(req,res)=>{

const{
candidate_name,
email,
mobile,
designation,
salary,
work_location,
date_of_joining
}=req.body;

const offer_id=
"OFF-"+Math.random().toString(36).substring(2,8).toUpperCase();

const sql=`
INSERT INTO onboarding
(
offer_id,
candidate_name,
email,
mobile,
designation,
salary,
work_location,
date_of_joining,
status
)
VALUES (?,?,?,?,?,?,?,?,?)
`;

db.run(
sql,
[
offer_id,
candidate_name,
email,
mobile,
designation,
salary,
work_location,
date_of_joining,
"Pending"
],
function(err){

if(err){
console.log(err);
return res.status(500).json({success:false});
}

const link=
`https://hr-frontend-bay.vercel.app/onboarding/${offer_id}`;

res.json({
success:true,
onboarding_link:link
});

});

});


// ===================================================
// ================= GET SINGLE OFFER ================
// ===================================================

app.get("/api/offers/:offer_id",(req,res)=>{

const offer_id=req.params.offer_id;

db.get(
"SELECT * FROM onboarding WHERE offer_id=?",
[offer_id],
(err,row)=>{

if(!row){
return res.status(404).json({success:false});
}

res.json(row);

});

});


// ===================================================
// ================= SUBMIT ONBOARDING ===============
// ===================================================

app.post(
"/api/offers/:offer_id/submit",
upload.fields([
{name:"aadhaar"},
{name:"pan"},
{name:"bank_proof"},
{name:"photo"},
{name:"signedAppointment"}
]),
(req,res)=>{

try{

const offer_id=req.params.offer_id;

// safe parse
let joining={};

if(req.body.joiningDetails){
joining=JSON.parse(req.body.joiningDetails);
}

// files

const aadhaar=req.files?.aadhaar?.[0]?.filename || null;
const pan=req.files?.pan?.[0]?.filename || null;
const bank_proof=req.files?.bank_proof?.[0]?.filename || null;
const photo=req.files?.photo?.[0]?.filename || null;
const signed=req.files?.signedAppointment?.[0]?.filename || null;

const signature=req.body.signature || null;

const sql=`
UPDATE onboarding SET
father_name=?,
dob=?,
gender=?,
address=?,
city=?,
state=?,
pincode=?,
bank_name=?,
account_number=?,
ifsc=?,
emergency_name=?,
emergency_contact=?,
qualification=?,
university=?,
passing_year=?,
signature=?,
aadhaar=?,
pan=?,
bank_proof=?,
photo=?,
signed_appointment=?,
status='Completed'
WHERE offer_id=?
`;

db.run(
sql,
[
joining.father_name || null,
joining.dob || null,
joining.gender || null,
joining.address || null,
joining.city || null,
joining.state || null,
joining.pincode || null,
joining.bank_name || null,
joining.account_number || null,
joining.ifsc || null,
joining.emergency_name || null,
joining.emergency_contact || null,
joining.qualification || null,
joining.university || null,
joining.passing_year || null,
signature,
aadhaar,
pan,
bank_proof,
photo,
signed,
offer_id
],
function(err){

if(err){
console.log("DB ERROR:",err);
return res.status(500).json({
success:false,
message:"Database error"
});
}

res.json({
success:true,
message:"Onboarding submitted"
});

});

}catch(error){

console.log("Submit error:",error);

res.status(500).json({
success:false,
message:"Submission failed"
});

}

});


// ===================================================
// ================= ROOT ============================
// ===================================================

app.get("/",(req,res)=>{
res.send("HR Onboarding Backend Running");
});


// ===================================================
// ================= START SERVER ====================
// ===================================================

app.listen(PORT,()=>{
console.log("Server running on port",PORT);
});