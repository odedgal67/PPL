
import { map } from 'ramda';
import { VarDecl } from '../imp/L3-ast';
import { bind } from '../shared/optional';
import { Result, makeFailure, makeOk, mapResult } from '../shared/result';
import {VarRef,ProcExp, Exp, Program, BoolExp, isBoolExp,isNumExp, isStrExp, isLitExp, isVarRef, isProcExp, isIfExp, isAppExp, isPrimOp, isLetExp,isDefineExp, isProgram, NumExp, StrExp, LitExp, CExp, AppExp, LetExp, DefineExp } from '../src/L31-ast'

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string>  => 
{
    if(isProgram(exp))
    {
        return bind(mapResult(l2ToPython,exp.exps), (exps:Exp[]) => makeOk(`${exps[0].join('\n')};`.join(exps.slice(1))));
    }
    isBoolExp(exp) ? valueToStringBool(exp) :
    isNumExp(exp) ? valueToStringNum(exp) :
    isStrExp(exp) ? valueToStringStr(exp) :
    isLitExp(exp) ? valueToStringLit(exp) :
    isVarRef(exp) ? valueToStringVarRef(exp) :
    isProcExp(exp) ? valueToStringProc(exp) :
    isIfExp(exp) ? makeOk(`(if ${l2ToPython(exp.test)} ${l2ToPython(exp.then)} ${l2ToPython(exp.alt)})`) :
    isAppExp(exp) ? valueToStringApp(exp) :
    isPrimOp(exp) ? makeOk(exp.op) :
    isDefineExp(exp) ? valueToStringDefine(exp):
    exp;
}

export const valueToStringBool = (exp: BoolExp): Result<string> =>
{
   return  isBoolExp(exp) ? (exp.val ? makeOk('true') : makeOk('false')) :
   makeFailure('never');
}

export const valueToStringNum = (exp: NumExp) : Result<string> =>
{
    return  isNumExp(exp) ? (makeOk(exp.val.toString())) :
    makeFailure('never');
}

export const valueToStringStr = (exp: StrExp) : Result<string> =>
{
    return  isStrExp(exp) ? (makeOk(exp.val)) :
    makeFailure('never');
}

export const valueToStringLit = (exp: LitExp) : Result<string> =>
{
    return  isLitExp(exp) ? (makeOk()) :
    makeFailure('never');
}

export const valueToStringVarRef = (exp: VarRef) : Result<string> =>
{
    return  isVarRef(exp) ? (makeOk(exp.var)) :
    makeFailure('never');
}

export const valueToStringProc = (exp: ProcExp) : Result<string> =>
{
    const args : VarDecl[] =  exp.args;
    return makeOk(`(lambda (${map( (arg : VarDecl)=> arg.var, exp.args).join(",")}) = ${wholeBodyToString(exp.body)})`);
}

export const valueToStringApp = (exp: AppExp): Result<string> =>
{
  
}

export const valueToStringDefine = (exp: DefineExp): Result<string> =>
{
    return isDefineExp(exp) ? makeOk(`(define ${exp.var.var} ${l2ToPython(exp.val)})`) : 
    makeFailure('never');
}










//recursive function to make the whole body a string
export const wholeBodyToString = (body : CExp[]): string =>
{
    const res: Result<string> = l2ToPython(body[0]);
    if(res.tag === 'Ok')
    {
        const s:string = res.value;
        return body.length === 1 ? s : s.concat(wholeBodyToString(body.slice(0)));
    }
    return 'never';
}


