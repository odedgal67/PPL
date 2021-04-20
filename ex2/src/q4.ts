
import { map } from 'ramda';
import { Result, makeFailure, makeOk, mapResult, isOk, bind } from '../shared/result';
import {VarDecl,VarRef,ProcExp, Exp, Program, BoolExp, isBoolExp,isNumExp, isStrExp, isVarRef, isProcExp, isIfExp, isAppExp, isPrimOp,isDefineExp, isProgram, NumExp, StrExp, LitExp, CExp, AppExp, LetExp, DefineExp, PrimOp, IfExp } from '../src/L31-ast'

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string>  => 
{
    if(isProgram(exp))
    {
        return bind(mapResult(l2ToPython,exp.exps), (exps:string[]) => makeOk(`${exps.join("\n")}`));
    }
    const r:Result<string> = 
    isBoolExp(exp) ? valueToStringBool(exp) :
    isNumExp(exp) ? valueToStringNum(exp) :
    isStrExp(exp) ? valueToStringStr(exp) :
    isVarRef(exp) ? valueToStringVarRef(exp) :
    isProcExp(exp) ? valueToStringProc(exp) :
    isIfExp(exp) ? valueToStringIf(exp) :
    isAppExp(exp) ? valueToStringApp(exp) :
    isPrimOp(exp) ? valueToStringPrimOp(exp) :
    isDefineExp(exp) ? valueToStringDefine(exp):
    makeFailure('never');
    return r;
    
}

export const valueToStringBool = (exp: BoolExp): Result<string> =>
{
   return exp.val ? makeOk('true'):makeOk('false')
}
export const valueToStringNum = (exp: NumExp) : Result<string> =>
{
    return  makeOk(exp.val.toString()); 
}
export const valueToStringStr = (exp: StrExp) : Result<string> =>
{
    return  makeOk(exp.val) ;
}
export const valueToStringVarRef = (exp: VarRef) : Result<string> =>
{
    return  makeOk(exp.var) ;
}
export const valueToStringProc = (exp: ProcExp) : Result<string> =>
{
   return bind(l2ToPython(exp.body[0]),(str:string)=> makeOk(`(lambda ${map( (arg : VarDecl)=> arg.var, exp.args).join(",")} : ${str})`));
}
export const valueToStringApp = (exp: AppExp): Result<string> =>
{     
    if(isPrimOp(exp.rator))
    {
        const res : Result<string> = l2ToPython(exp.rator);
        if(isOk(res))
        {
            if(res.value === "not")
            {
                return bind(mapResult(l2ToPython,exp.rands), (rands:string[]) => makeOk(`(not ${rands[0]})`)) ;
            }
            return bind(bind(mapResult(l2ToPython, exp.rands), (s:string[])=>makeOk(s.join(` ${res.value} `))), (str:string)=>makeOk("("+str+")"));
        }
    }
    const res : Result<string> = l2ToPython(exp.rator);
    if(isOk(res))
    {  
        const s:string = `${res.value}(${map( (rand : CExp)=>
            {
             const r:Result<string> = l2ToPython(rand);
             return isOk(r) ? r.value : 'never'
            },
              exp.rands).join(",")})`;
        return makeOk(s);
    }  
    return makeFailure('never');            
}

export const valueToStringDefine = (exp: DefineExp): Result<string> =>
{
    return isDefineExp(exp) ?  bind(l2ToPython(exp.val),(str:string)=> makeOk(`${exp.var.var} = ${str}`)) : makeFailure('never');
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
    return (isOk(then) && isOk(test) && isOk(alt)) ? makeOk(`(${then.value} if ${test.value} else ${alt.value})`) : makeFailure("never");
}


