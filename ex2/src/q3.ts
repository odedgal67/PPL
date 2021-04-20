import { ClassExp, ProcExp,  Exp, Program, makeIfExp, makeAppExp, makeVarRef, isClassExp, makeProgram, VarRef } from "./L31-ast";
import { Result, makeOk } from "../shared/result";
import { Binding } from "./L31-ast";
import { CExp, makeBoolExp, makePrimOp, makeProcExp } from "./L31-ast";
import {  map } from "ramda";
import {  isDefineExp, isExp, isProgram, makeDefineExp, makeVarDecl } from "./L31-ast";
import { first, rest } from "../shared/list";

/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/
export const class2proc = (exp: ClassExp): ProcExp =>{

   return  makeProcExp(exp.fields,[makeProcExp( [makeVarDecl('msg')],[makeBody(exp.methods )])]);
}
export const makeBody = (methods:Binding[]): CExp=>
{
    if (methods.length===0)
    {
        return makeBoolExp(false);
    }
    const s:VarRef = makeVarRef("'"+ (first(methods).var.var));
    const rands:CExp[] = [makeVarRef('msg'),s];
    return makeIfExp(/*test*/makeAppExp(makePrimOp("eq?"),rands ),/*then*/makeAppExp(first(methods).val,[]) ,/*alt*/makeBody(rest(methods)));
}


/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
{
    
    if (isProgram(exp))
    {
        return makeOk(makeProgram(map( L31ToL3Exp  ,exp.exps)))
    }
    else if (isExp(exp))
    {       
        return makeOk(L31ToL3Exp(exp));
        
    }
    return makeOk(exp);
}

export const L31ToL3Exp = (exp:Exp):Exp=>
{
    
    if (isDefineExp(exp)) 
    {
        return makeDefineExp(exp.var, isClassExp(exp.val) ? class2proc(exp.val) : exp.val );
        
    }
    else //cexp
    {
        return isClassExp(exp) ? class2proc(exp) :exp
 
    }
}

