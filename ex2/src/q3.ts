import { ClassExp, ProcExp,  Exp, Program, makeIfExp, makeStrExp, makeAppExp, makeVarRef, parseL31Exp, isClassExp, isCExp, makeProgram, isAppExp, makeClassExp, isLitExp, VarRef } from "./L31-ast";
import { Result, makeFailure, mapResult, makeOk } from "../shared/result";
import { Binding, VarDecl } from "./L31-ast";
import { CExp, IfExp, makeBoolExp, makePrimOp, makeProcExp } from "./L31-ast";
import { makeCompoundSExp } from "../imp/L3-value";
import { bind, map } from "ramda";
import { isAtomicExp, isDefineExp, isExp, isProgram, LitExp, makeDefineExp, makeLitExp, makeVarDecl, StrExp } from "./L31-ast";
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
/*
export type Exp = DefineExp | CExp;
export type AtomicExp = NumExp | BoolExp | StrExp | PrimOp | VarRef;
export type CompoundExp = AppExp | IfExp | ProcExp | LetExp | LitExp | ClassExp;
export type CExp =  AtomicExp | CompoundExp;
*/
export const L31ToL3Exp = (exp:Exp):Exp=>
{
    if (isDefineExp(exp))
    {
        return makeDefineExp(exp.var, isClassExp(exp.val) ? class2proc(exp.val) : exp.val );
        
    }
    else //cexp
    {
        if (isClassExp(exp))
        {
             return class2proc(exp);
        }
        else
        {
             return exp
        }
        
    }
}

