"use client"

import { useState } from "react"

const BOARDS = [
{ w:4050, h:2050 },
{ w:4050, h:1230 },
{ w:2360, h:1020 },
{ w:2020, h:1020 }
]

const KERF = 5

const MATERIAL_PRICE:any = {
PE_RC:{
20:1.7,
40:1.7,
60:1.7
}
}

const CUT_COST:any={
10:0.0024,
12:0.0024,
15:0.0024,
20:0.0024,
25:0.0035,
30:0.0039,
35:0.0039,
40:0.0052,
45:0.0061,
50:0.0069,
60:0.0078,
70:0.0087,
75:0.0095,
80:0.0095,
90:0.0100,
100:0.0104,
110:0.0130,
120:0.0130,
130:0.0130,
140:0.0130,
150:0.0130
}

function weight(w:number,h:number,t:number){
return (w*h*t)/1000000
}

function parsePieces(text:string){

const lines=text.split("\n")

let pieces:any[]=[]

lines.forEach(l=>{

l=l.trim()

if(!l) return

let qty=1
let w=0
let h=0
let t=0

if(l.includes("-")){
const parts=l.split("-")
qty=parseInt(parts[0])
l=parts[1]
}

const dims=l.split("x")

w=parseFloat(dims[0])
h=parseFloat(dims[1])
t=parseFloat(dims[2])

for(let i=0;i<qty;i++){
pieces.push({w,h,t})
}

})

return pieces
}

function piecesFromStrips(board:any,piece:any){

const strips=Math.floor((board.h+KERF)/(piece.h+KERF))

const piecesPerStrip=Math.floor((board.w+KERF)/(piece.w+KERF))

return {
strips,
piecesPerStrip,
piecesPerBoard:strips*piecesPerStrip
}

}

export default function Home(){

const [input,setInput]=useState("")
const [material,setMaterial]=useState("PE_RC")
const [result,setResult]=useState<any>(null)

function calculate(){

const pieces=parsePieces(input)

if(pieces.length===0)return

const thickness=pieces[0].t

const piece=pieces[0]

const totalPieces=pieces.length

const pieceArea=piece.w*piece.h

const pieceWeight=weight(piece.w,piece.h,thickness)

const piecesWeightTotal=pieceWeight*totalPieces

let best:any=null

BOARDS.forEach(board=>{

const boardArea=board.w*board.h

const fit1=piecesFromStrips(board,piece)

const rotated={w:piece.h,h:piece.w}

const fit2=piecesFromStrips(board,rotated)

const bestFit=fit1.piecesPerBoard>fit2.piecesPerBoard?fit1:fit2

const piecesPerBoard=bestFit.piecesPerBoard

if(piecesPerBoard===0)return

const boardsNeeded=Math.ceil(totalPieces/piecesPerBoard)

const piecesLastBoard=totalPieces-(boardsNeeded-1)*piecesPerBoard

const usedAreaFull=(boardsNeeded-1)*piecesPerBoard*pieceArea

const usedAreaLast=piecesLastBoard*pieceArea

const usedAreaTotal=usedAreaFull+usedAreaLast

const totalBoardArea=boardsNeeded*boardArea

const wasteArea=totalBoardArea-usedAreaTotal

const wastePercent=(wasteArea/totalBoardArea)*100

const boardWeight=weight(board.w,board.h,thickness)

const totalBoardWeight=boardWeight*boardsNeeded

const wasteWeight=totalBoardWeight-piecesWeightTotal

let priceKg=1.7

if(material==="PE_RC"){
priceKg=MATERIAL_PRICE.PE_RC[thickness]||1.7
}

const materialCost=totalBoardWeight*priceKg

const cutLength=(board.w + board.h*2)/10

const cutCost=cutLength*(CUT_COST[thickness]||0)*boardsNeeded

const totalCost=materialCost+cutCost

const priceKgPieces=totalCost/piecesWeightTotal

const usedWidth=bestFit.strips*piece.h+(bestFit.strips-1)*KERF

const scrapWidth=board.h-usedWidth

const scrapHeight=board.w

const resultTemp={

board,
boardsNeeded,
piecesPerBoard,
wastePercent,
wasteWeight,
piecesWeightTotal,
totalBoardWeight,
materialCost,
cutCost,
totalCost,
priceKgPieces,
scrapWidth,
scrapHeight

}

if(!best ||
resultTemp.wastePercent<best.wastePercent ||
(resultTemp.wastePercent===best.wastePercent && resultTemp.materialCost<best.materialCost)
){
best=resultTemp
}

})

setResult(best)

}

return(

<div style={{padding:40,fontFamily:"Arial"}}>

<h1>Optimizador Corte Vapla JT</h1>

<h2>Configuración</h2>

<p>Material</p>

<select value={material} onChange={e=>setMaterial(e.target.value)}>
<option value="PE_RC">PE RC</option>
</select>

<p>Piezas</p>

<textarea
style={{width:"100%",height:120}}
placeholder={`Ejemplo

100-600x600x60`}
value={input}
onChange={e=>setInput(e.target.value)}
/>

<br/><br/>

<button onClick={calculate}>
Optimizar
</button>

{result && (

<div style={{marginTop:40}}>

<h2>Resultado</h2>

<p><b>Placa elegida:</b> {result.board.w} × {result.board.h}</p>

<p><b>Placas necesarias:</b> {result.boardsNeeded}</p>

<p><b>Peso piezas:</b> {result.piecesWeightTotal.toFixed(2)} kg</p>

<p><b>Peso placas usadas:</b> {result.totalBoardWeight.toFixed(2)} kg</p>

<p><b>Desperdicio:</b> {result.wasteWeight.toFixed(2)} kg ({result.wastePercent.toFixed(2)}%)</p>

<p><b>Recorte principal:</b> {result.scrapWidth.toFixed(0)} × {result.scrapHeight.toFixed(0)} mm</p>

<p><b>Coste material:</b> {result.materialCost.toFixed(2)} €</p>

<p><b>Coste corte:</b> {result.cutCost.toFixed(2)} €</p>

<p><b>Coste fabricación:</b> {result.totalCost.toFixed(2)} €</p>

<p><b>Coste fabricación:</b> {result.priceKgPieces.toFixed(2)} €/kg</p>

</div>

)}

</div>

)

}