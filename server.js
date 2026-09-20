const express=require("express");
const path=require("path");
const fs=require("fs");
const multer=require("multer");
const bcrypt=require("bcryptjs");
const session=require("express-session");
const app=express(), PORT=process.env.PORT||3000;
const dataDir=path.join(__dirname,"data"), storePath=path.join(dataDir,"store.json");
const uploadDir=path.join(__dirname,"public","uploads");
fs.mkdirSync(dataDir,{recursive:true}); fs.mkdirSync(uploadDir,{recursive:true});

const ENV_ADMIN_USER=process.env.ADMIN_USER||"";
const ENV_ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||"";
const ENV_PASSWORD_HASH=ENV_ADMIN_PASSWORD?bcrypt.hashSync(ENV_ADMIN_PASSWORD,12):"";

const defaults={
 settings:{
  brand:"KHAN",hindi:"दही",tagline:"A little tradition. A lot of goodness.",
  phone:"+91 00000 00000",email:"",address:"",
  heroVideo:"/assets/khan-dahi-making.mp4",heroImage:"/assets/hero-poster.png"
 },
 products:[
  {id:"fresh-dahi",name:"Fresh Dahi",subtitle:"Thick · Creamy · Naturally set",image:"/assets/hero-poster.png",
   variants:[
    {label:"Single",size:"400 g",price:80,offerPrice:65,image:"/assets/hero-poster.png"},
    {label:"Pack of 6",size:"6 cups",price:420,offerPrice:390,image:"/assets/hero-poster.png"},
    {label:"Pack of 12",size:"12 cups",price:780,offerPrice:720,image:"/assets/hero-poster.png"}
   ]}
 ],
 reviews:[],
 credentials:{username:ENV_ADMIN_USER||"admin",passwordHash:ENV_PASSWORD_HASH||bcrypt.hashSync("ChangeMe123!",12)}
};
function read(){try{return JSON.parse(fs.readFileSync(storePath,"utf8"))}catch(e){write(defaults);return JSON.parse(JSON.stringify(defaults))}}
function write(data){const tmp=storePath+".tmp";fs.writeFileSync(tmp,JSON.stringify(data,null,2));try{fs.rmSync(storePath,{force:true})}catch(e){}fs.renameSync(tmp,storePath)}
if(!fs.existsSync(storePath))write(defaults);

app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({extended:true}));
app.use(session({secret:process.env.SESSION_SECRET||"khan-dahi-signature-session-2026",resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:86400000}}));
app.use(express.static(path.join(__dirname,"public")));

function auth(req,res,next){if(req.session.admin)return next();res.status(401).json({error:"Unauthorized"});}
app.get("/api/site",(req,res)=>{const d=read();res.json({settings:d.settings,products:d.products,reviews:d.reviews})});
app.post("/api/admin/login",async(req,res)=>{
 const d=read();
 const username=ENV_ADMIN_USER||d.credentials.username;
 const hash=ENV_PASSWORD_HASH||d.credentials.passwordHash;
 if(String(req.body.username||"")!==username || !(await bcrypt.compare(String(req.body.password||""),hash))) return res.status(401).json({error:"Invalid login"});
 req.session.admin=true;res.json({ok:true});
});
app.post("/api/admin/logout",auth,(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get("/api/admin/me",auth,(req,res)=>res.json({ok:true}));

app.post("/api/admin/settings",auth,(req,res)=>{const d=read();d.settings={...d.settings,...req.body};write(d);res.json({ok:true,settings:d.settings})});

app.get("/api/admin/products",auth,(req,res)=>res.json(read().products));
app.post("/api/admin/products",auth,(req,res)=>{
 const d=read(); const p=req.body;
 if(!p.name||!Array.isArray(p.variants)||!p.variants.length)return res.status(400).json({error:"Product name and at least one size/price are required"});
 const product={id:p.id||("p-"+Date.now()),name:String(p.name),subtitle:String(p.subtitle||""),image:String(p.image||"/assets/hero-poster.png"),variants:p.variants.map(v=>({label:String(v.label||"Size"),size:String(v.size||""),price:Number(v.price)||0,offerPrice:Number(v.offerPrice)||0,image:String(v.image||"/assets/hero-poster.png")}))};
 const idx=d.products.findIndex(x=>x.id===product.id);
 const old=idx>=0?d.products[idx]:null;
 if(idx>=0)d.products[idx]=product; else d.products.push(product);
 const referenced=new Set(d.products.flatMap(x=>[x.image,...(x.variants||[]).map(v=>v.image)]).filter(u=>typeof u==='string'&&u.startsWith('/uploads/')));
 const oldUrls=old?[old.image,...(old.variants||[]).map(v=>v.image)]:[];
 for(const u of oldUrls){if(u&&u.startsWith('/uploads/')&&!referenced.has(u)){try{fs.unlinkSync(path.join(__dirname,'public',u.slice(1)))}catch(e){}}}
 write(d);res.json({ok:true,product});
});
app.delete("/api/admin/products/:id",auth,(req,res)=>{const d=read();d.products=d.products.filter(p=>p.id!==req.params.id);write(d);res.json({ok:true})});

const storage=multer.diskStorage({destination:(req,file,cb)=>cb(null,uploadDir),filename:(req,file,cb)=>{const ext=path.extname(file.originalname).toLowerCase();cb(null,"product-"+Date.now()+"-"+Math.random().toString(36).slice(2,7)+ext)}});
const upload=multer({storage,limits:{fileSize:8*1024*1024},fileFilter:(req,file,cb)=>cb(null,/^image\/(jpeg|png|webp|avif)$/.test(file.mimetype))});
app.post("/api/admin/upload",auth,upload.single("image"),(req,res)=>{if(!req.file)return res.status(400).json({error:"Image required"});res.json({ok:true,url:"/uploads/"+req.file.filename})});

app.get("/api/admin/reviews",auth,(req,res)=>res.json(read().reviews));
app.post("/api/admin/reviews",auth,(req,res)=>{const d=read(),r={id:req.body.id||("r-"+Date.now()),name:String(req.body.name||""),rating:Number(req.body.rating)||5,text:String(req.body.text||"")};const i=d.reviews.findIndex(x=>x.id===r.id);if(i>=0)d.reviews[i]=r;else d.reviews.push(r);write(d);res.json({ok:true,review:r})});
app.delete("/api/admin/reviews/:id",auth,(req,res)=>{const d=read();d.reviews=d.reviews.filter(r=>r.id!==req.params.id);write(d);res.json({ok:true})});

app.get("/admin",(req,res)=>res.sendFile(path.join(__dirname,"public","admin.html")));
app.listen(PORT,()=>console.log("KHAN Dahi final running on http://localhost:"+PORT));