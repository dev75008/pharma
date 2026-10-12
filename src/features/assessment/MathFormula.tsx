import katex from 'katex';
import DOMPurify from 'dompurify';
import 'katex/dist/katex.min.css';
export function renderSafeFormula(expression:string){return DOMPurify.sanitize(katex.renderToString(expression,{trust:false,throwOnError:false,maxExpand:100,maxSize:10,output:'htmlAndMathml'}),{USE_PROFILES:{html:true,mathMl:true}});}
export default function MathFormula({expression}:{expression:string}){return <div className="math-formula" aria-label="Équation du corrigé" dangerouslySetInnerHTML={{__html:renderSafeFormula(expression)}}/>;}
