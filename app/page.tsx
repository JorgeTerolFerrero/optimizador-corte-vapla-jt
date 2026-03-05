"use client";
import { useState } from "react";

export default function Home(){

const [text,setText]=useState("");
const [result,setResult]=useState(null);

function calculate(){

const lines=text.split("\n");

let pieces=[];

lines.forEach(l=>{

const cleaned=l.replace("-", " ");
const n=cleaned.match(/\d+/g);

if(!n) return;

let qty=1;
let w;
let h;
let t;

if(n.length===4){
qty=+n[0];
w=+n[1];
h=+n[2];
t=+n[3];
}

if(n.length===3){
w=+n[0];
h=+n[1];
t=+n[2];
}

for(let i=0;i<qty;i++){
pieces.push({w,h,t});
}

});

const boards=[
{w:4050,h:2050},
{w:4050,h:1230},
{w:2360,h:1020},
{w:2020,h:1020}
];

let board=null;

boards.forEach(b=>{

const fits=pieces.every(p=>
(p.w<=b.w && p.h<=b.h) ||
(p.h<=b.w && p.w<=b.h)
);

if(fits){

if(!board || b.w*b.h < board.w*board.h){
board=b;
}

}

});

if(!board){
setResult(null);
return;
}

const used=pieces.reduce((a,b)=>a+(b.w*b.h),0);

const waste=((board.w*board.h-used)/(board.w*board.h))*100;

setResult({
board,
waste
});

}

return(

<div style={{padding:40,fontFamily:"Arial"}}>

<h1>Optimizador Corte Vapla JT v.1</h1>

<textarea
style={{width:"100%",height:150}}
placeholder={`Ejemplo:
2-2500x1200x20
3-800x500x30`}
value={text}
onChange={e=>setText(e.target.value)}
/>

<br/><br/>

<button
onClick={calculate}
style={{padding:10,fontSize:16}}
>
Calcular
</button>

{result && (

<div style={{marginTop:30}}>

<h2>Resultado</h2>

<p>
Placa sugerida:
{result.board.w} x {result.board.h}
</p>

<p>
Recorte:
{result.waste.toFixed(1)} %
</p>

</div>

)}

</div>

);

}