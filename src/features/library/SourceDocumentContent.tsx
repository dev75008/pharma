import { useMemo } from 'react';
import DOMPurify from 'dompurify';

export function sanitizeDocument(html:string) {
 return DOMPurify.sanitize(html,{
  ALLOWED_TAGS:['p','strong','b','em','i','ul','ol','li','table','thead','tbody','tfoot','tr','td','th','caption','sub','sup','h3','h4','br','abbr'],
  ALLOWED_ATTR:['colspan','rowspan','scope','title'],ALLOW_DATA_ATTR:false,ALLOW_ARIA_ATTR:false,
 });
}
export default function SourceDocumentContent({html}:{html:string}) {
 const clean=useMemo(()=>sanitizeDocument(html),[html]);
 return <div className="source-document-html" dangerouslySetInnerHTML={{__html:clean}}/>;
}
