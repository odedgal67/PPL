
import { map } from 'ramda';
import { VarDecl } from '../imp/L3-ast';
import { closureToString, compoundSExpToString, isClosure, isEmptySExp, isSymbolSExp, Value } from '../imp/L3-value';
//import { bind } from '../shared/optional';

import { isCompoundSexp } from '../shared/parser';
import { Result, makeFailure, makeOk, mapResult, isOk, bind } from '../shared/result';
import { isNumber, isString } from '../shared/type-predicates';
import {VarRef,ProcExp, Exp, Program, BoolExp, isBoolExp,isNumExp, isStrExp, isLitExp, isVarRef, isProcExp, isIfExp, isAppExp, isPrimOp, isLetExp,isDefineExp, isProgram, NumExp, StrExp, LitExp, CExp, AppExp, LetExp, DefineExp, PrimOp, IfExp } from '../src/L31-ast'

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string>  => 
{
    if(isProgram(exp))
    {
        const a:Result<string>[] = map(l2ToPython,exp.exps);
        // (exps:string[]) => (makeOk(`${map((exp:string)=>exp.concat('\n'), exps)}`));
        const b:string[] =  map(  (s:Result<string>) => isOk(s) ? s.value+('\n') : 'never',a)  ;
        //const c=[4,6,7,7,9,0,9,8,78]

        for(let i=0;i<b.length;i++)
        {
            console.log("qqqqqqqqqqqqqqqqqqqqqqqqqq     "+b[i].toString());
        }
        return makeOk(b.toString());
        //makeOk(`${exps[0]};`.join('\n').join(exps.slice(1))));
    }
    
        const r:Result<string> = 
        isBoolExp(exp) ? valueToStringBool(exp) :
        isNumExp(exp) ? valueToStringNum(exp) :
        isStrExp(exp) ? valueToStringStr(exp) :
        //isLitExp(exp) ? valueToStringLit(exp) :
        isVarRef(exp) ? valueToStringVarRef(exp) :
        isProcExp(exp) ? valueToStringProc(exp) :
        isIfExp(exp) ? valueToStringIf(exp) :
        isAppExp(exp) ? valueToStringApp(exp) :
        isPrimOp(exp) ? valueToStringPrimOp(exp) :
        isDefineExp(exp) ? valueToStringDefine(exp):
        makeFailure('nev');
        return r;

    //varDec
    

    

    
}
/*
export type Exp = DefineExp | CExp;
export type AtomicExp = NumExp | BoolExp | StrExp | PrimOp | VarRef;
export type CompoundExp = AppExp | IfExp | ProcExp | LetExp | LitExp | ClassExp;
export type CExp =  AtomicExp | CompoundExp;
*/
/*
Note: The primitive operators of L2 are: +, -, *, /, <, >, =, number?, boolean?, eq?, and, or, not

*/

export const valueToStringBool = (exp: BoolExp): Result<string> =>
{

   if(exp.val) 
   {
        return makeOk('true')
   }  
   else
   {
        return makeOk('false')
   } 
   //return makeFailure('never2');
}

export const valueToStringNum = (exp: NumExp) : Result<string> =>
{
    return  isNumExp(exp) ? (makeOk(exp.val.toString())) :
    makeFailure('never3');
}

export const valueToStringStr = (exp: StrExp) : Result<string> =>
{
    return  isStrExp(exp) ? (makeOk(exp.val)) :
    makeFailure('never4');
}

/*
export const valueToStringLit = (exp: LitExp) : Result<string> =>
{
    return  isLitExp(exp) ? (makeOk(unparseLitExp(exp))) :
    makeFailure('never5');
}
*/

export const valueToStringVarRef = (exp: VarRef) : Result<string> =>
{
    return  isVarRef(exp) ? (makeOk(exp.var)) :
    makeFailure('never6');
}

export const valueToStringProc = (exp: ProcExp) : Result<string> =>
{
    return makeOk(`(lambda ${map( (arg : VarDecl)=> arg.var, exp.args).join(",")} : ${wholeBodyToString(exp.body)})`);
}
/*
Note: The primitive operators of L2 are: +, -, *, /, <, >, =, number?, boolean?, eq?, and, or, not

*/
export const valueToStringApp = (exp: AppExp): Result<string> =>
{
    if(isPrimOp(exp.rator))
    {
        const res : Result<string> = l2ToPython(exp.rator);
        if(isOk(res))
        {
            const s:Result<string>[] =map(l2ToPython, exp.rands)

            const str:string = `(${map( (rand :Result<string>)=>isOk(rand)?rand.value+" "+res.value+" ":'never', s)}`;    
            const newStr = str.slice(0,str.length-3)+')';
            return makeOk(newStr.replace(/[,]/g, ""));
        }
    } 
    const res : Result<string> = l2ToPython(exp.rator);
    if(res.tag==='Ok')
    {
        console.log("ooooooo "+res.value);
        const s:string = `${res.value}(${map( (rand : CExp)=>
            {

             const r:Result<string> = l2ToPython(rand);
             return isOk(r) ? r.value : 'never'
            },
              exp.rands).join(",")})`;//good
        return makeOk(s);
    }  
    return makeFailure('never7');
    /*
    isAppExp(exp) ? (isIfExp(exp.rator) || (isPrimOp(exp.rator) && !isLambdaOperator(exp.rator)) ?
                    (isPrimOp(exp.rator) && exp.rator.op) === 'not' ?
                    bind(l2ToPython(exp.rands[0]), (str: string) => makeOk(`(not ${str})`)) : 
                    safe2((rator: string, rands: string[]) => makeOk(`(${rands.join(` ${rator} `)})`)) (l2ToPython(exp.rator), mapResult(l2ToPython, exp.rands)) :
                    safe2((rator: string, rands: string[]) => makeOk(`${rator}(${rands.join(`,`)})`)) (l2ToPython(exp.rator), mapResult(l2ToPython, exp.rands))) :
    */
}

export const valueToStringDefine = (exp: DefineExp): Result<string> =>
{
    if(isDefineExp(exp)) 
    {
        const r:Result<string> = l2ToPython(exp.val);
        if (isOk(r))
        {
            return makeOk(`${exp.var.var} = ${r.value}`) 
        }
       
    } 
    return makeFailure('never8');
}
export const valueToStringPrimOp = (exp:PrimOp):Result<string> =>
{
    return exp.op === "=" ? makeOk("=="):
    exp.op === "or" ? makeOk("||"):
    exp.op === "and" ? makeOk("&&"):
    exp.op === "eq?" ? makeOk("=="):
    exp.op === "number?" ? makeOk("(lambda x : type(x) == number)"):
    exp.op === "number?" ? makeOk("(lambda x : type(x) == bool)"):
    makeOk(exp.op);
}
export const valueToStringIf = (exp:IfExp):Result<string> =>
{
    const then :Result<string> = l2ToPython(exp.then);
    const test:Result<string> = l2ToPython(exp.test);
    const alt:Result<string> = l2ToPython(exp.alt);
    if (isOk(then) && isOk(test) && isOk(alt))
    {
        return makeOk(`(${then.value} if ${test.value} else ${alt.value})`)   ;
    }
    return makeFailure("never10");
    
}
/*
const unparseLitExp = (le: LitExp): string =>
    isEmptySExp(le.val) ? `'()` :
    isSymbolSExp(le.val) ? `'${valToString(le.val)}` :
    isCompoundSexp(le.val) ? `'${valToString(le.val)}` :
    `${le.val}`;
*/
//recursive function to make the whole body a string
export const wholeBodyToString = (body : CExp[]): string =>
{
    const res: Result<string> = l2ToPython(body[0]);
    return isOk(res) ? res.value : 'never9';
}
/*
export const valToString = (val:Value): string =>
    isNumber(val) ?  val.toString() :
    val === true ? '#t' :
    val === false ? '#f' :
    isString(val) ? `"${val}"` :
    isClosure(val) ? closureToString(val) :
    isPrimOp(val) ? val.op :
    isSymbolSExp(val) ? val.val :
    isEmptySExp(val) ? "()" :
    isCompoundSexp(val) ? compoundSExpToString(val) :
    val.val1.toString();

*/

