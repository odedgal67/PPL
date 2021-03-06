/* 2.1 */

export const MISSING_KEY = '___MISSING___'

type PromisedStore<K, V> = {
    get(key: K): Promise<V>,
    set(key: K, value: V): Promise<void>,
    delete(key: K): Promise<void>
}


export function makePromisedStore<K, V>(): PromisedStore<K, V> {
    let map : Map<K,V> = new Map<K,V>();
    return {
        get(key: K){ 
            return new Promise<V> ((resolve, reject) => {
                const returnValue = map.get(key)
                returnValue !== undefined ?
                resolve(returnValue) : reject(MISSING_KEY)
            });
        },
        set(key: K, value: V)
        {
            return new Promise<void> ((resolve) => {
                map.set(key, value);
                resolve();
            })
        },
        delete(key: K) 
        {
            return new Promise<void>((resolve, reject)=>
            {
                map.delete(key) ? resolve()
                :reject(MISSING_KEY)
            }
            )
        }
    }
}




 export function getAll<K, V>(store: PromisedStore<K, V>, keys: K[]): Promise<V[]> {
    let arr : V[] = [];
    return new Promise((resolve, reject)=>{
        keys.map((key:K) =>
        {
            store.get(key).then((v)=>arr.push(v)).catch(()=>reject(MISSING_KEY));
        }
        )
        resolve(arr);
    })

 }

 /* 2.2 */

 async function asyncMemoHelper<T,R>(store: PromisedStore<T,R>, f: (param :T)=>R, param:T) : Promise<R>
 {
    try
    {
      return await store.get(param);
    }
    catch
    {
        store.set(param,f(param));
        return await store.get(param);
    }
    
 }

 export function asycMemo<T, R>(f: (param: T) => R): (param: T) => Promise<R> {
    let store : PromisedStore<T,R> = makePromisedStore();

    return (param:T)=>asyncMemoHelper(store, f, param)
 }

// /* 2.3 */

 export function lazyFilter<T>(genFn: () => Generator<T>, filterFn: (param : T) => Boolean): ()=> Generator<T> {
    function* newGen()
    {
        const iterator = genFn();
        for (let x of iterator)
        {
            if (filterFn(x))
            {
                yield(x);
            }
        }
    }
    return newGen;
 }

 export function lazyMap<T, R>(genFn: () => Generator<T>, mapFn: (param:T) => R): () => Generator<R> {
    function* newGen()
    {
        const iterator = genFn();
        for(let x of iterator)
        {
            yield(mapFn(x));
        }
    } 
    return newGen;

 }

// /* 2.4 */

async function asyncWaterfallWithRetryHelperFirstFunc(func : (() => Promise<any>)):Promise<any>
{
    let numOfFails = 0
    return new Promise(async (resolve, reject)=>{
        try
        {

            let res:any = await func()
            resolve(res)
            
        }
        catch
        {
            while (numOfFails<2)
            {
                setTimeout(resolve, 2000)
                try{
                    let res:any = await func( )
                    resolve(res)
                    break;
                }
                catch
                {
                    numOfFails++;
                }  
            }
            
            reject()            
        }
    })
    
}

async function asyncWaterfallWithRetryHelper(func : ((param:any) => Promise<any>), returnValue:any):Promise<any>
{
    let numOfFails = 0
    return new Promise(async (resolve, reject)=>{
        try
        {

            let res:any = await func(await returnValue)
            resolve(res)
        }
        catch
        {
            while (numOfFails<2)
            {
                setTimeout(resolve, 2000)
                try{
                    let res:any = await func(await returnValue)
                    resolve(res)
                    break;
                }
                catch
                {
                    numOfFails++;
                }
               
                
            }
            
            reject()            
        }    
    }) 
}

 export async function asyncWaterfallWithRetry(fns: [() => Promise<any>, ...((param:any) => Promise<any>)[]]): Promise<any> {
    let returnValue:Promise<any>;
    returnValue =await asyncWaterfallWithRetryHelperFirstFunc(fns[0]) ;
    fns.slice(1).map( (func : ((param:any) => Promise<any>))=>{
        returnValue  = asyncWaterfallWithRetryHelper(func,returnValue)
   
    })
    return returnValue;
   
 }