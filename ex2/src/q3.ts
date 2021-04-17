import { ClassExp, ProcExp,  Exp, Program, makeIfExp, makeStrExp, makeAppExp, makeVarRef, parseL31Exp, isClassExp, isCExp, makeProgram, isAppExp, makeClassExp, isLitExp } from "./L31-ast";
import { Result, makeFailure, mapResult, makeOk } from "../shared/result";
import { Binding, VarDecl } from "./L31-ast";
import { CExp, IfExp, makeBoolExp, makePrimOp, makeProcExp } from "./L31-ast";
import { makeCompoundSExp } from "../imp/L3-value";
import { bind, map } from "ramda";
import { isAtomicExp, isDefineExp, isExp, isProgram, LitExp, makeLitExp, makeVarDecl, StrExp } from "../imp/L3-ast";

/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/
export const class2proc = (exp: ClassExp): ProcExp =>{

   return  makeProcExp(exp.fields,[makeProcExp( [makeVarDecl("msg")],[makeBody(0, "msg", exp )])]);
   
}
export const makeBody = (counter:number,msg:string, exp:ClassExp): IfExp=>
{
    const s:LitExp = makeLitExp("'"+ makeStrExp(exp.methods[counter].var.var).val);//maybe literal exp
    const rands:CExp[] = [makeVarRef(msg),s];
    if (counter===exp.methods.length-1)
    {
  
        return  makeIfExp(/*test*/makeAppExp(makePrimOp("eq?"),rands ),/*then*/exp.methods[counter].val ,/*alt*/makeStrExp("#f"))
    }
    
    return makeIfExp(/*test*/makeAppExp(makePrimOp("eq?"),rands ),/*then*/exp.methods[counter].val ,/*alt*/makeBody(counter+1, msg,exp));
    
    
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
        bind(mapResult(L31ToL3NotProg,exp.exps), (e:Exp[])=>makeOk(makeProgram(e)));
    }
    else if (isExp(exp))
    {
        
        return L31ToL3NotProg(exp);

    }
}
/*
export type AtomicExp = NumExp | BoolExp | StrExp | PrimOp | VarRef;
export type CompoundExp = AppExp | IfExp | ProcExp | LetExp | LitExp | ClassExp;
export type CExp =  AtomicExp | CompoundExp;
*/
export const L31ToL3NotProg = (exp:Exp):Result<Exp>=>
{
    if (isDefineExp(exp))
    {
        return L31ToL3NotProg(exp.val);

    }
    else{
        return isClassExp(exp) ?  makeOk(class2proc(exp)):
        isAtomicExp(exp) ? makeOk(exp) :
        L31ToL3NotProg(exp);
    }
}
