
export const API_URL = 'https://i9nvyv08rj.execute-api.us-west-2.amazonaws.com/prod/smashgg-lambda';

export function flatten(arr: any[], depth: number = 1) : any[]{
    let root: any[] = [];
    depth = depth || 1;
    for(let i = 0; i < depth; i++){
        for(let j = 0; j < arr.length; j++){
            let element = arr[i];
            if(Array.isArray(element))
                root = root.concat(element)
            else   
                root.push(element);
        }
    }
    return root;
}

export function createExpandsString(expands: any) : string{
	let expandsString: string = '';
    for(let property in expands){
		if(expands.hasOwnProperty(property))
			if(expands[property] === true) 
				expandsString += `expand[]=${property}&`;
	}
	return expandsString;
}

export namespace ICommon{
	export interface Options{
		isCached?: boolean, 
		rawEncoding?: string,
		concurrency?: number    
	}
	
	export interface Entity{
		id: number,
		[x: string]: any
	}
	
	export interface Data{
		[x: string]: any
	}

	export function parseOptions(options: Options) : Options{
		return {
			isCached: options.isCached != undefined ? options.isCached === true : true,
			concurrency: options.concurrency || 4,
			rawEncoding: 'json'
		}
	}
}