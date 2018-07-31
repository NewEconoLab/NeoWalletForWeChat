declare function accAdd(arg1: string | number, arg2: string | number): number;
declare function accSub(arg1: string | number, arg2: string | number): number;
declare function accMul(arg1: string | number, arg2: string | number): number;
declare function accDiv(arg1: string | number, arg2: string | number): number;

interface Number
{
    add(arg: string | number): number;
    sub(arg: string | number): number;
    mul(arg: string | number): number;
    div(arg: string | number): number;
}