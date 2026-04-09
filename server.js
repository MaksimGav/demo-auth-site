const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const DEV = "1234321";

// встав свої ключі
const PUBLIC_KEY = "ТУТ_PUBLIC_KEY";
const PRIVATE_KEY = "ТУТ_PRIVATE_KEY";

let users = {};
let codes = {};

function today(){
  return new Date().toISOString().split("T")[0];
}

function generateCode(){
  return crypto.randomBytes(4).toString("hex");
}

// LOGIN
app.post("/login",(req,res)=>{
  const {email, phone} = req.body;

  if(phone === DEV){
    return res.json({role:"admin"});
  }

  if(!users[email]){
    const code = generateCode();

    users[email] = {
      phone,
      active:false,
      code
    };

    codes[code] = {used:null};
  }

  if(!users[email].active){
    return res.json({role:"no-access"});
  }

  res.json({
    role:"user",
    code:users[email].code
  });
});

// ОПЛАТА
app.post("/create-payment",(req,res)=>{
  const {email} = req.body;

  const data = Buffer.from(JSON.stringify({
    public_key: PUBLIC_KEY,
    version:"3",
    action:"pay",
    amount:"100",
    currency:"UAH",
    description:"Підписка Cleango",
    order_id:Date.now().toString(),
    sandbox:1,
    server_url:"https://cleango-server.onrender.com/payment-callback",
    metadata:{email}
  })).toString("base64");

  const signature = crypto
    .createHash("sha1")
    .update(PRIVATE_KEY + data + PRIVATE_KEY)
    .digest("base64");

  res.json({data, signature});
});

// CALLBACK
app.post("/payment-callback",(req,res)=>{
  const json = JSON.parse(
    Buffer.from(req.body.data,"base64").toString()
  );

  const email = json.metadata.email;

  if(users[email]){
    users[email].active = true;
  }

  res.send("ok");
});

// ADMIN
app.get("/admin/users",(req,res)=>{
  res.json(users);
});

app.post("/admin/deactivate",(req,res)=>{
  const {email} = req.body;

  if(users[email]){
    users[email].active = false;
  }

  res.json({ok:true});
});

// QR CHECK
app.get("/check/:code",(req,res)=>{
  const code = req.params.code;

  if(!codes[code]){
    return res.json({message:"❌ нема"});
  }

  if(codes[code].used === today()){
    return res.json({message:"❌ вже використано"});
  }

  res.json({message:"✅ ок"});
});

// QR USE
app.post("/use/:code",(req,res)=>{
  const code = req.params.code;

  if(codes[code]){
    codes[code].used = today();
  }

  res.json({message:"✔ списано"});
});

app.listen(PORT, ()=>console.log("server started"));
