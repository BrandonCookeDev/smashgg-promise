
export namespace IPlayer{

	export interface Player{
		id: number
		tag: string
		name?: string
		country?: string
		state?: string
		sponsor?: string
		participantId?: number
		data?: Entity

		loadData(data: Entity) : void
		//getPlayer(id: number, options: Options) : Promise<Player>
		//resolveEntities(player: Entity) : Player
		//resolve(data: Entity) : Player
		getId() : number
		getTag(): string 
		getName(): string | undefined
		getCountry(): string | undefined
		getState(): string | undefined
		getSponsor(): string | undefined
		getParticipantId() : number | undefined
		getFinalPlacement() : number | undefined
		nullValueString(prop: string) : string
	}

	export interface Data{
		id: number,
		entities: Entity,
		mutations: any,
		[x: string]: any
	}

	export interface Entity{
		id: number,
		eventId: number,
		mutations: Mutations,
		[x: string]: any
	}

	export interface Mutations{
		participants: Participants,
		players: Players
	}

	export interface Participants{
		[x: string]: {
			id: number,
			gamerTag: string,
			playerId?: number,
			prefix?: string,
			[x: string]: any
		}
	}

	export interface Players{
		[x: string]: {
			id: number,
			name?: string,
			gamerTag: string,
			country?: string,
			state?: string,
			prefix?: string,
			region?: string,
			[x: string]: any
		}
	}

	export interface Options{
		isCached?: boolean,
		rawEncoding?: string
	}
}


/** Players */
export class Player implements IPlayer.Player{
    constructor(id, tag, name, country, state, sponsor, participantId, data){
        if(!id)
            throw new Error('Player ID cannot be null');

        this.id = id;
        this.tag = tag;
        this.name = name;
        this.country = country;
        this.state = state;
        this.sponsor = sponsor;
        this.participantId = participantId;

        if(data)
            this.data = JSON.parse(data);
    }

    static resolve(data){
        try{
            let playerId = 0;
            let participantId = 0;

            for(let id in data.mutations.players){
                if(isNaN(parseInt(id))) break;
                playerId = id;
            }

            let playerDetails = data.mutations.players[playerId];

            let P = new ggPlayer(
                parseInt(playerId),
                playerDetails.gamerTag,
                playerDetails.name,
                playerDetails.country,
                playerDetails.state,
                playerDetails.prefix,
                parseInt(data.id),
                JSON.stringify(data)
            );
            return P;
        } catch(e){
            console.error(e.message);
            throw e;
        }
    }

    static get(id){
        let postParams = {
            type: 'player',
            id: id
        }

        return request('POST', API_URL, postParams)
            .then(data => {
                return resolve(data);
            }) 
            .catch(console.error);
        
    }

    static getFromIdArray(idArray){
        let postParams = {
            type: 'players',
            idArray: idArray
        }

        return request('POST', API_URL, postParams)
            .then(data => {
                data.map(player => { return resolve(player); });
            })
            .catch(console.error);
    }

    getId(){
        return this.id;
    }

    getTag(){
        return this.tag;
    }

    getName(){
        return this.name;
    }

    getCountry(){
        return this.country;
    }

    getState(){
        return this.state;
    }

    getSponsor(){
        return this.sponsor;
    }

    getParticipantId(){
        return this.participantId;
    }

    getFinalPlacement(){
        return this.data.finalPlacement
    }
}