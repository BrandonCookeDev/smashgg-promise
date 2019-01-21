import * as NI from './util/NetworkInterface'
import { API_URL } from './util/Common'
import { Player } from './internal'
import { IPlayer } from './internal'

export namespace IGGSet{

	export interface GGSet{
		id: number
		eventId: number
		round: string
		isComplete: boolean
		data: SetEntity
		winner?: Player
		loser?: Player
		score1?: number
		score2?: number
		winnerId?: number
		loserId?: number

		//getSet(id: number, options: ICommon.Options) : Promise<GGSet>
		//resolve(data: Entity) : Promise<GGSet>
		
		getRound() : string
		getWinner() : Player | undefined
		getLoser() : Player | undefined
		getWinnerId() : number | undefined
		getLoserId() : number | undefined
		getIsComplete() : boolean | undefined
		getWinnerScore() : number | undefined
		getLoserScore() : number | undefined
		getWinner() : Player | undefined
		getLoser() : Player | undefined
		getGames() : number | string
		getBestOfCount() : number | undefined
		getWinnerScore() : number | undefined
		getLoserScore() : number | undefined
		getBracketId() : number | undefined 
		getMidsizeRoundText() : undefined
		getPhaseGroupId() : number | undefined
		getStartedAt() : Date | undefined 
		getCompletedAt() : Date | undefined 
	}

	export interface Data{
		entities: Entity
	}

	export interface Entity{
		sets: SetEntity,
		[x: string]: any
	}

	export interface SetEntity{
		id: number,
		eventId: number,
		fullRoundText: string,
		entrant1Score: number,
		entrant2Score: number,
		entrant1Id?: number,
		entrant2Id?: number,
		winnerId?: number,
		loserId?: number,
		startedAt?: number,
		completedAt?: number,
		[x: string]: any
	}
}

import Data = IGGSet.Data
import Entity = IGGSet.Entity
import SetEntity = IGGSet.SetEntity

/** Sets */
export class GGSet implements IGGSet.GGSet{

	public id: number
	public eventId: number
	public round: string
	public isComplete: boolean
	public data: SetEntity

	public winner?: Player
	public loser?: Player
	public score1?: number
	public score2?: number
	public winnerId?: number
	public loserId?: number

	constructor(id: number, eventId: number, round: string, 
				isComplete: boolean=false, data: SetEntity,
				winner: Player | undefined = undefined,
				loser: Player | undefined = undefined,
				score1: number=0, score2: number=0, 
				winnerId: number = 0, loserId: number = 0){
		if(!id)
			throw new Error('Id for Set cannot be null');
		if(!eventId)
			throw new Error('Event Id for Set cannot be null');
		if(!round)
			throw new Error('Round for Set cannot be null');
		if(winner != undefined && !(winner instanceof Player))
			throw new Error('Winner Player for Set cannot be null, and must be an instance of ggPlayer');
		if(loser != undefined && !(loser instanceof Player))
            throw new Error('Loser Player for Set cannot be null, and must be an instance of ggPlayer');

		this.id = id;
		this.eventId = eventId;
		this.round = round;
		this.data = data;

		this.winner = winner;
		this.loser = loser;
		this.score1 = score1;
		this.score2 = score2;
		this.isComplete = isComplete;
		this.winnerId = winnerId;
		this.loserId = loserId;
	}
	
	static resolve(data: Data) : Promise<GGSet>{
		return new Promise(function(resolve, reject){
			let playerIds: number[] = [data.entities.sets.winnerId, data.entities.sets.loserId].filter(id => id != undefined) as number[]
			Player.getFromIdArray(playerIds)
				.then(players => {
					let winner: Player | undefined = data.entities.sets.winnerId ?
						players.filter(player => player.id === data.entities.sets.winnerId)[0] :
						undefined
					let loser: Player | undefined = data.entities.sets.loserId ?
						players.filter(player => player.id === data.entities.sets.loserId)[0] :
						undefined

					let winnerScore = Math.max.apply(null, ([data.entities.sets.entrant1Score, data.entities.sets.entrant2Score].filter(score => score != undefined)))
					let loserScore = Math.min.apply(null, ([data.entities.sets.entrant1Score, data.entities.sets.entrant2Score].filter(score => score != undefined)))
					
					
					return new GGSet(
						data.entities.sets.id,
						data.entities.sets.eventId,
						data.entities.sets.fullRoundText,
						data.entities.sets.completedAt != undefined,
						data.entities.sets,
						winner,
						loser,
						winnerScore,
						loserScore,
						winner != undefined ? winner.id : 0,
						loser != undefined ? loser.id : 0,
					)
				})
				.catch(reject)
		})
	}

    static get(id: number) : Promise<GGSet>{
        let postParams = {
            type: 'set',
            id: id
        }

        return NI.request('POST', API_URL, postParams)
            .then( (data: Data) => {
                return GGSet.resolve(data);
            }) 
            .catch(console.error);
        
    }

    static getFromIdArray(idArray: number[]) : Promise<GGSet[]>{
        let postParams = {
            type: 'sets',
            idArray: idArray
        }

        return NI.request('POST', API_URL, postParams)
            .then( (data: Data[]) => {
                return Promise.all(
					data.map(set => { 
						return GGSet.resolve(set); 
					}
				));
            })
            .catch(console.error);
    }

	getIsComplete() : boolean{
		return this.isComplete;
	}

    getRound() : string {
        return this.round;
	}
	
	getWinner() : Player | undefined{
		return this.winner;
	}

	getLoser() : Player | undefined{
		return this.loser;
	}

    getWinnerId() : number | undefined{
        return this.winnerId;
    }

    getLoserId() : number | undefined{
        return this.loserId;
	}

    getGames(){
        return this.data.games
    }

    getBestOfCount() : number | undefined{
        return this.data.bestOf 
    }

    getWinnerScore() : number | undefined{
		if(this.score1 && this.score2)
			return this.score1 > this.score2 ? this.score1 : this.score2;
		else if(this.score1 && !this.score2) return this.score1
		else if(this.score2 && !this.score1) return this.score2
		else return undefined
    }

    getLoserScore(){
		if(this.score1 && this.score2)
			return this.score1 < this.score2 ? this.score2 : this.score1;
		else return undefined
    }

    getBracketId(){
        return this.data.bracketId;
    }

    getMidsizeRoundText(){
        return this.data.midRoundText;
    }

    getPhaseGroupId(){
        return this.data.phaseGroupId;
    }

    /*
    getWinnersTournamentPlacement(){
        return this.winner.getFinalPlacement();
    }

    getLosersTournamentPlacement(){
        return this.LoserPlayer.getFinalPlacement();
    }
    */

    getCompletedAt() : Date | undefined{
		let ret = new Date(0);
		this.data.completedAt ? ret.setUTCSeconds(this.data.completedAt) : undefined;
		return ret;		
    }

    getStartedAt() : Date | undefined{
		let ret = new Date(0);
		this.data.startedAt ? ret.setUTCSeconds(this.data.startedAt) : undefined;
		return ret;
    }
}
