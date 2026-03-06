"use client";
import { useState } from "react";

const BOARDS = [
  { w: 4050, h: 2050 },
  { w: 4050, h: 1230 },
  { w: 2360, h: 1020 },
  { w: 2020, h: 1020 }
];

const CUT_COST: Record<number, number> = {
10:0.0024,12:0.0024,15:0.0024,20:0.0024,
25:0.0035,30:0.0039,35:0.0039,40:0.0052,
45:0.0061,50:0.0069,60:0.0078,70:0.0087,
75:0.0095,80:0.0095,90:0.0100,100:0.0104,
110:0.0130,120:0.0130,130:0.0130,140:0.0130,150:0.0130
};

const MATERIAL_PRICE:any = {
PE_RC:{20:1.70,25:1.70,30:1.70,40:1.70,50:1.70},
PE500:{natural:{20:2.30,30:2.30,40:2.30}},
PE1000:{natural:{20:2.60,30:2.60,40:2.60}},
PP:{natural:{20:2.10,30:2.10,40:2.10}}
};

function parsePieces(text:string){
  const lines=text.split("\n");
  let pieces:any[]=[];
  
  lines.forEach(l=>{
    const line=l.trim();
    if(!line)return;

    let qty=1;
    let dims=line;

    if(line.includes("-")){
      const parts=line.split("-");
      qty=parseInt(parts[0]);
      dims=parts[1];
    }

    const p=dims.split("x").map(n=>parseInt(n));
    if(p.length===3){
      for(let i=0;i<qty;i++){
        pieces.push({w:p[0],h:p[1],t:p[2]});
      }
    }
  });

  return pieces;
}

function weight(w:number,h:number,t:number){
  return (w*h*t)/1000000;
}

export default function Home(){

const [input,setInput]=useState("");
const [result,setResult]=useState<any>(null);

const [material,setMaterial]=useState("PE_RC");
const [color,setColor]=useState("natural");

function calculate(){

  const pieces=parsePieces(input);

  if(pieces.length===0)return;

  const thickness=pieces[0].t;

  const board=BOARDS[0];

  let piecesWeight=0;

  pieces.forEach(p=>{
    piecesWeight+=weight(p.w,p.h,p.t);
  });

  const boardWeight=weight(board.w,board.h,thickness);

  const cutLength=board.h*2+board.w;
  const cutCost=(cutLength/10)*(CUT_COST[thickness]||0);

  let priceKg=1.7;

  if(material==="PE_RC"){
    priceKg=MATERIAL_PRICE.PE_RC[thickness]||1.7;
  }

  const materialCost=boardWeight*priceKg;

  const totalCost=materialCost+cutCost;

  const priceKgPieces=totalCost/piecesWeight;

  setResult({
    piecesWeight,
    boardWeight,
    materialCost,
    cutCost,
    totalCost,
    priceKgPieces,
    board
  });

}

return(

<div style={{padding:40,fontFamily:"Arial"}}>

<h1>Optimizador Corte Vapla JT v1</h1>

<h2>Configuración</h2>

<div style={{display:"flex",gap:20}}>

<div>
Material<br/>
<select value={material} onChange={e=>setMaterial(e.target.value)}>
<option value="PE_RC">PE RC</option>
<option value="PE500">PE 500</option>
<option value="PE1000">PE 1000</option>
<option value="PP">PP</option>
</select>
</div>

{material!=="PE_RC"&&(
<div>
Color<br/>
<select value={color} onChange={e=>setColor(e.target.value)}>
<option value="natural">Natural</option>
<option value="color">Color</option>
</select>
</div>
)}

</div>

<h2>Piezas</h2>

<textarea
rows={8}
style={{width:"100%"}}
placeholder="2-2500x1200x20"
value={input}
onChange={e=>setInput(e.target.value)}
/>

<br/><br/>

<button onClick={calculate}>Optimizar</button>

{result&&(

<div style={{marginTop:40}}>

<h2>Resultado</h2>

<p><b>Placa usada:</b> {result.board.w} x {result.board.h}</p>

<p><b>Peso piezas:</b> {result.piecesWeight.toFixed(2)} kg</p>

<p><b>Peso placa:</b> {result.boardWeight.toFixed(2)} kg</p>

<p><b>Coste material:</b> {result.materialCost.toFixed(2)} €</p>

<p><b>Coste corte:</b> {result.cutCost.toFixed(2)} €</p>

<p><b>Coste total:</b> {result.totalCost.toFixed(2)} €</p>

<p><b>Precio medio piezas:</b> {result.priceKgPieces.toFixed(2)} €/kg</p>

</div>

)}

</div>

);
}