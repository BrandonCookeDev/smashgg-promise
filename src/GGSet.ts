

export namespace IGGSet{

	export interface GGSet{
		id: number
		eventId: number
		round: string
		player1?: Player
		player2?: Player
		isComplete: boolean
		score1?: number
		score2?: number
		winnerId?: number
		loserId?: number
		data?: SetEntity

		//getSet(id: number, options: ICommon.Options) : Promise<GGSet>
		//resolve(data: Entity) : Promise<GGSet>
		
		getRound() : string
		getPlayer1() : Player | null
		getPlayer2() : Player | null
		getWinnerId() : number | null
		getLoserId() : number | null
		getIsComplete() : boolean | null
		getPlayer1Score() : number | null
		getPlayer2Score() : number | null
		getWinner() : Player | undefined
		getLoser() : Player | undefined
		getGames() : number | string
		getBestOfCount() : number | string
		getWinnerScore() : number | string
		getLoserScore() : number | string
		getBracketId() : number | string 
		getMidsizeRoundText() : string
		getPhaseGroupId() : number | string
		getWinnersTournamentPlacement() : number | string
		getLosersTournamentPlacement() : number | string
		getStartedAt() : Date | null 
		getCompletedAt() : Date | null 
		nullValueString(prop: string) : string
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


/** Sets */
export class GGSet implements IGGSet.GGSet{
    constructor(id, eventId, round, player1, player2, isComplete=false, score1=0, score2=0, winnerId, loserId, data){
		if(!id)
			throw new Error('Id for Set cannot be null');
		if(!eventId)
			throw new Error('Event Id for Set cannot be null');
		if(!round)
			throw new Error('Round for Set cannot be null');
		if(!(player1 instanceof ggPlayer))
			throw new Error('Winner Player for Set cannot be null, and must be an instance of ggPlayer');
		if(!(player2 instanceof ggPlayer))
            throw new Error('Loser Player for Set cannot be null, and must be an instance of ggPlayer');

		this.id = id;
		this.eventId = eventId;
		this.round = round;
		this.player1 = player1;
		this.player2 = player2;
		this.score1 = score1;
		this.score2 = score2;
		this.isComplete = isComplete;
		this.winnerId = winnerId;
		this.loserId = loserId;

		this.data = data;
    }

    static get(id){
        let postParams = {
            type: 'set',
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
            type: 'sets',
            idArray: idArray
        }

        return request('POST', API_URL, postParams)
            .then(data => {
                return data.map(set => { return resolve(set); });
            })
            .catch(console.error);
    }

    getRound(){
        return this.round;
    }

    getWinnerId(){
        return this.winnerId;
    }

    getLoserId(){
        return this.loserId;
    }

    getGames(){
        return this.data.games
    }

    getBestOfCount(){
        return this.data.bestOf 
    }

    getWinnerScore(){
        return this.score1 > this.score2 ? this.score1 : this.score2;
    }

    getLoserScore(){
        return this.score1 < this.score2 ? this.score2 : this.score1;
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
        return this.WinnerPlayer.getFinalPlacement();
    }

    getLosersTournamentPlacement(){
        return this.LoserPlayer.getFinalPlacement();
    }
    */

    getCompletedAt(){
        return this.data.completedAt;
    }

    getStartedAt(){
        return this.data.startedAt;
    }
}
