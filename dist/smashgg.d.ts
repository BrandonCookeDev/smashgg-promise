declare module "util/NetworkInterface" {
    export function request(method: string, url: string, data: any): Promise<any>;
}
declare module "util/Common" {
    export const API_URL = "https://i9nvyv08rj.execute-api.us-west-2.amazonaws.com/prod/smashgg-lambda";
    export function flatten(arr: any[], depth?: number): any[];
    export function createExpandsString(expands: any): string;
    export namespace ICommon {
        interface Options {
            isCached?: boolean;
            rawEncoding?: string;
            concurrency?: number;
        }
        interface Entity {
            id: number;
            [x: string]: any;
        }
        interface Data {
            [x: string]: any;
        }
        function parseOptions(options: Options): Options;
    }
}
declare module "Phase" {
    import { PhaseGroup, Player, GGSet } from "internal";
    import { IPhaseGroup } from "internal";
    export namespace IPhase {
        interface Phase {
            id: number;
            url: string;
            data: Data | string;
            isCached: boolean;
            rawEncoding: string;
            expandsString: string;
            expands: Expands;
            loadData(data: Data): Data | string;
            getData(): Data;
            load(): Promise<Data | string>;
            getPhaseGroups(options: Options): Promise<Array<PhaseGroup>>;
            getSets(options: Options): Promise<Array<GGSet>>;
            getPlayers(options: Options): Promise<Array<Player>>;
            getIncompleteSets(options: Options): Promise<Array<GGSet>>;
            getCompleteSets(options: Options): Promise<Array<GGSet>>;
            getSetsXMinutesBack(minutesBack: number, options: Options): Promise<Array<GGSet>>;
            getFromDataEntities(prop: string): any;
            getName(): string;
            getEventId(): number;
            nullValueString(prop: string): string;
            emitPhaseReady(): void;
            emitPhaseError(err: Error): void;
        }
        interface Options {
            isCached?: boolean;
            expands?: Expands;
            rawEncoding?: string;
        }
        interface Expands {
            groups: boolean;
        }
        interface Data {
            entities: Entity;
            [x: string]: any;
        }
        interface Entity {
            id: number;
            groups: [IPhaseGroup.Entity];
            [x: string]: any;
        }
        function getDefaultData(): {
            id: number;
        };
        function getDefaultExpands(): {
            groups: boolean;
        };
        function getDefaultOptions(): Options;
        function parseExpands(expands?: Expands): Expands;
        function parseOptions(options: Options): Options;
    }
    import Data = IPhase.Data;
    import Expands = IPhase.Expands;
    /** PHASES */
    export class Phase {
        id: number;
        expands: Expands;
        data: Data;
        constructor(id: number, expands: Expands, data: string);
        static get(id: number, expands?: Expands): Promise<Phase>;
        getName(): any;
        getEventId(): any;
        getPhaseGroups(): Promise<PhaseGroup[]>;
        getPhasePlayers(): Promise<Player[]>;
        getPhaseMatchIds(): Promise<void | any[]>;
        getPhaseSets(): Promise<{}>;
    }
}
declare module "PhaseGroup" {
    import { Player, GGSet } from "internal";
    import { IPlayer, IGGSet } from "internal";
    import PlayerEntity = IPlayer.Entity;
    export namespace IPhaseGroup {
        interface PhaseGroup {
            id: number;
            url: string;
            data: Data | string;
            rawEncoding: string;
            expandsString: string;
            expands: Expands;
            players: Array<Player>;
            sets: Array<GGSet>;
            loadData(data: Data): Data | string;
            getData(): Data;
            load(): Promise<Data | string>;
            getPlayers(options: Options): Promise<Array<Player>>;
            getSets(options: Options): Promise<Array<GGSet>>;
            getCompleteSets(options: Options): Promise<Array<GGSet>>;
            getIncompleteSets(options: Options): Promise<Array<GGSet>>;
            getSetsXMinutesBack(minutes: number, options: Options): Promise<Array<GGSet>>;
            resolveSet(set: IGGSet.SetEntity): Promise<GGSet | undefined>;
            getFromDataEntities(prop: string): any;
            getPhaseId(): number;
            getEntrants(): Array<IPlayer.Entity> | [];
            nullValueString(prop: string): string;
            emitPhaseGroupReady(): void;
            emitPhaseGroupError(err: Error): void;
            findPlayerByParticipantId(id: number): Promise<Player | undefined>;
        }
        interface Options {
            isCached?: boolean;
            rawEncoding?: string;
            expands?: Expands;
        }
        interface Expands {
            sets: boolean;
            entrants: boolean;
            standings: boolean;
            seeds: boolean;
        }
        interface Data {
            entities: Entity;
        }
        interface Entity {
            id: number;
            sets?: [IGGSet.SetEntity];
            entrants?: [PlayerEntity];
            standings?: [{
                [x: string]: any;
            }];
            seeds?: [{
                [x: string]: any;
            }];
            [x: string]: any;
        }
        function parseOptions(options: Options): Options;
        function getDefaultOptions(): Options;
        function getDefaultData(): Data;
        function getDefaultExpands(): Expands;
    }
    import Data = IPhaseGroup.Data;
    import Expands = IPhaseGroup.Expands;
    /** PHASE GROUPS */
    export class PhaseGroup {
        id: number;
        expands: Expands;
        data: Data;
        constructor(id: number, expands: Expands, data: string);
        static get(id: number, expands?: Expands): Promise<PhaseGroup>;
        getPhaseId(): number;
        getPlayers(): Promise<Player[]>;
        getMatchIds(): Promise<number[]>;
        getSets(): Promise<GGSet[]>;
        findPlayerByParticipantId(id: number): Promise<Player>;
        findPlayersByIds(...ids: number[]): Promise<Player[]>;
    }
}
declare module "Tournament" {
    import { Player, GGSet, Event } from "internal";
    import { IEvent } from "internal";
    export namespace ITournament {
        interface Tournament {
            data: Data | string;
            name: string | number;
            expands: Expands;
            getAllPlayers(options: Options): Promise<Array<Player>>;
            getAllSets(options: Options): Promise<Array<GGSet>>;
            getAllEvents(options: Options): Promise<Array<Event>>;
            getIncompleteSets(options: Options): Promise<Array<GGSet>>;
            getCompleteSets(options: Options): Promise<Array<GGSet>>;
            getId(): number;
            getName(): string;
            getSlug(): string;
            getTimezone(): string;
            getStartTime(): Date | null;
            getStartTimeString(): string | null;
            getEndTime(): Date | null;
            getEndTimeString(): string | null;
            getWhenRegistrationCloses(): Date | null;
            getWhenRegistrationClosesString(): string | null;
            getCity(): string;
            getState(): string;
            getZipCode(): string;
            getContactEmail(): string;
            getContactTwitter(): string;
            getOwnerId(): string;
            getVenueFee(): string;
            getProcessingFee(): string;
        }
        interface Options {
            expands?: Expands;
            isCached?: boolean;
            rawEncoding?: string;
        }
        interface Expands {
            event: boolean;
            phase: boolean;
            groups: boolean;
            stations: boolean;
        }
        interface Data {
            entities: Entity;
        }
        interface Entity {
            tournament: TournamentEntity;
            event?: [IEvent.EventEntity];
            phase?: [IPhase.Entity];
            groups?: [IPhaseGroup.Entity];
            stations?: {
                [x: string]: any;
            };
            [x: string]: any;
        }
        interface TournamentEntity {
            id: number;
            [x: string]: any;
        }
        function getDefaultData(): Data;
        function getDefaultExpands(): Expands;
        function getDefaultOptions(): Options;
        function parseExpands(expands?: Expands): {
            event: boolean;
            phase: boolean;
            groups: boolean;
            stations: boolean;
        };
        function parseOptions(options: Options): {
            expands: {
                event: boolean;
                phase: boolean;
                groups: boolean;
                stations: boolean;
            };
            isCached: boolean;
            rawEncoding: string;
        };
    }
    import Data = ITournament.Data;
    import Expands = ITournament.Expands;
    import { IPhase } from "Phase";
    import { IPhaseGroup } from "PhaseGroup";
    /** TOURNAMENTS */
    export class Tournament implements ITournament.Tournament {
        name: string;
        expands: Expands;
        data: Data;
        constructor(name: string, expands: Expands, data: string);
        static get(tournamentName: string, expands?: Expands): Promise<{}>;
        getId(): number;
        getName(): any;
        getSlug(): any;
        getTimezone(): any;
        getStartTime(): Date;
        getStartTimeString(): string;
        getEndTime(): Date;
        getEndTimeString(): string;
        getWhenRegistrationCloses(): Date;
        getWhenRegistrationClosesString(): string;
        getCity(): any;
        getState(): any;
        getZipCode(): any;
        getContactEmail(): any;
        getContactTwitter(): any;
        getOwnerId(): any;
        getVenueFee(): any;
        getProcessingFee(): any;
        getAllEvents(): Promise<Event[]>;
        getAllMatchIds(): Promise<number[]>;
        getAllSets(): Promise<GGSet[]>;
        getIncompleteSets(): Promise<GGSet[]>;
        getCompleteSets(): Promise<GGSet[]>;
        getAllPlayers(): Promise<Player[]>;
    }
}
declare module "Player" {
    export namespace IPlayer {
        interface Player {
            id: number;
            tag: string;
            name?: string;
            country?: string;
            state?: string;
            sponsor?: string;
            participantId?: number;
            data?: Data;
            getId(): number;
            getTag(): string;
            getName(): string | undefined;
            getCountry(): string | undefined;
            getState(): string | undefined;
            getSponsor(): string | undefined;
            getParticipantId(): number | undefined;
            getFinalPlacement(): number | undefined;
        }
        interface Data {
            entities: Entity;
            [x: string]: any;
        }
        interface Entity {
            id: number;
            eventId: number;
            mutations: Mutations;
            [x: string]: any;
        }
        interface Mutations {
            participants: Participants;
            players: Players;
        }
        interface Participants {
            [x: string]: {
                id: number;
                gamerTag: string;
                playerId?: number;
                prefix?: string;
                [x: string]: any;
            };
        }
        interface Players {
            [x: string]: {
                id: number;
                gamerTag: string;
                name?: string;
                country?: string;
                state?: string;
                prefix?: string;
                region?: string;
                [x: string]: any;
            };
        }
        interface Options {
            isCached?: boolean;
            rawEncoding?: string;
        }
        function getDefaultData(): Data;
        function getDefaultEntity(): {
            id: number;
            eventId: number;
            mutations: {
                participants: {
                    "0": {
                        id: number;
                        gamerTag: string;
                    };
                };
                players: {
                    "0": {
                        id: number;
                        gamerTag: string;
                    };
                };
            };
        };
    }
    import Data = IPlayer.Data;
    import Entity = IPlayer.Entity;
    /** Players */
    export class Player implements IPlayer.Player {
        id: number;
        tag: string;
        data: Data;
        name?: string;
        country?: string;
        state?: string;
        sponsor?: string;
        participantId?: number;
        constructor(id: number, tag: string, data: string, name?: string, country?: string, state?: string, sponsor?: string, participantId?: number);
        static resolve(entity: Entity): Player;
        static get(id: number): Promise<Player>;
        static getFromIdArray(idArray: number[]): Promise<Player[]>;
        getId(): number;
        getTag(): string;
        getName(): string | undefined;
        getCountry(): string | undefined;
        getState(): string | undefined;
        getSponsor(): string | undefined;
        getParticipantId(): number | undefined;
        getFinalPlacement(): any;
    }
}
declare module "GGSet" {
    import { Player } from "internal";
    export namespace IGGSet {
        interface GGSet {
            id: number;
            eventId: number;
            round: string;
            isComplete: boolean;
            data: SetEntity;
            winner?: Player;
            loser?: Player;
            score1?: number;
            score2?: number;
            winnerId?: number;
            loserId?: number;
            getRound(): string;
            getWinner(): Player | undefined;
            getLoser(): Player | undefined;
            getWinnerId(): number | undefined;
            getLoserId(): number | undefined;
            getIsComplete(): boolean | undefined;
            getWinnerScore(): number | undefined;
            getLoserScore(): number | undefined;
            getWinner(): Player | undefined;
            getLoser(): Player | undefined;
            getGames(): number | string;
            getBestOfCount(): number | undefined;
            getWinnerScore(): number | undefined;
            getLoserScore(): number | undefined;
            getBracketId(): number | undefined;
            getMidsizeRoundText(): undefined;
            getPhaseGroupId(): number | undefined;
            getStartedAt(): Date | undefined;
            getCompletedAt(): Date | undefined;
        }
        interface Data {
            entities: Entity;
        }
        interface Entity {
            sets: SetEntity;
            [x: string]: any;
        }
        interface SetEntity {
            id: number;
            eventId: number;
            fullRoundText: string;
            entrant1Score: number;
            entrant2Score: number;
            entrant1Id?: number;
            entrant2Id?: number;
            winnerId?: number;
            loserId?: number;
            startedAt?: number;
            completedAt?: number;
            [x: string]: any;
        }
    }
    import Data = IGGSet.Data;
    import SetEntity = IGGSet.SetEntity;
    /** Sets */
    export class GGSet implements IGGSet.GGSet {
        id: number;
        eventId: number;
        round: string;
        isComplete: boolean;
        data: SetEntity;
        winner?: Player;
        loser?: Player;
        score1?: number;
        score2?: number;
        winnerId?: number;
        loserId?: number;
        constructor(id: number, eventId: number, round: string, isComplete: boolean | undefined, data: SetEntity, winner?: Player | undefined, loser?: Player | undefined, score1?: number, score2?: number, winnerId?: number, loserId?: number);
        static resolve(data: Data): Promise<GGSet>;
        static get(id: number): Promise<GGSet>;
        static getFromIdArray(idArray: number[]): Promise<GGSet[]>;
        getIsComplete(): boolean;
        getRound(): string;
        getWinner(): Player | undefined;
        getLoser(): Player | undefined;
        getWinnerId(): number | undefined;
        getLoserId(): number | undefined;
        getGames(): any;
        getBestOfCount(): number | undefined;
        getWinnerScore(): number | undefined;
        getLoserScore(): number | undefined;
        getBracketId(): any;
        getMidsizeRoundText(): any;
        getPhaseGroupId(): any;
        getCompletedAt(): Date | undefined;
        getStartedAt(): Date | undefined;
    }
}
declare module "internal" {
    export * from "Tournament";
    export * from "Phase";
    export * from "PhaseGroup";
    export * from "Player";
    export * from "GGSet";
    export * from "Event";
}
declare module "Event" {
    import { ICommon } from "util/Common";
    import { Phase, PhaseGroup, Player, GGSet } from "internal";
    import { ITournament } from "internal";
    import Entity = ICommon.Entity;
    import TournamentData = ITournament.Data;
    import TournamentOptions = ITournament.Options;
    export namespace IEvent {
        interface Event {
            id: number;
            url: string;
            data: Data | string;
            eventId: string | number;
            expands: Expands;
            expandsString: string;
            tournamentId: string | undefined;
            tournamentSlug: string;
            isCached: boolean;
            rawEncoding: string;
            phases: Array<Phase>;
            groups: Array<PhaseGroup>;
            loadData(data: object): object | string;
            getData(): Data;
            load(options: Options, tournamentOptions: TournamentOptions): Promise<Data | string>;
            getEventPhases(options: Options): Promise<Array<Phase>>;
            getEventPhaseGroups(options: Options): Promise<Array<PhaseGroup>>;
            getSets(options: Options): Promise<Array<GGSet>>;
            getPlayers(options: Options): Promise<Array<Player>>;
            getIncompleteSets(options: Options): Promise<Array<GGSet>>;
            getCompleteSets(options: Options): Promise<Array<GGSet>>;
            getSetsXMinutesBack(minutesBack: number, options: Options): Promise<Array<GGSet>>;
            getFromEventEntities(prop: string): any;
            getFromTournamentEntities(prop: string): any;
            getId(): number;
            getName(): string;
            getTournamentId(): number;
            getSlug(): string;
            getTournamentSlug(): string;
            getStartTime(): Date | null;
            getStartTimeString(): string | null;
            getEndTime(): Date | null;
            getEndTimeString(): string | null;
            nullValueString(prop: string): string;
            emitEventReady(): void;
            emitEventError(err: Error): void;
        }
        interface Options {
            isCached?: boolean;
            rawEncoding?: string;
            expands?: Expands;
        }
        interface Expands {
            phase: boolean;
            groups: boolean;
        }
        interface Data {
            tournament: TournamentData;
            event: EventData;
        }
        interface EventData {
            entities: {
                event: EventEntity;
                phase?: [ICommon.Entity];
                groups?: [ICommon.Entity];
            };
        }
        interface EventEntity {
            slug: string;
            tournamentId: number;
            groups?: [Entity];
            phase?: [Entity];
            [x: string]: any;
        }
        function parseExpands(expands: Expands): Expands;
        function getDefaultData(): Data;
        function getDefaultExpands(): Expands;
        function getDefaultEventData(): EventData;
        function getTournamentSlug(slug: string): string;
        function getDefaultOptions(): Options;
        function parseOptions(options: Options): Options;
    }
    import Data = IEvent.EventData;
    import Expands = IEvent.Expands;
    /** EVENTS */
    export class Event {
        tournamentName: string;
        eventName: string;
        expands: Expands;
        data: Data;
        eventId: number | undefined;
        constructor(tournamentName: string, eventName: string, expands: Expands | undefined, data: string, eventId?: number);
        static get(tournamentName: string, eventName: string, expands?: Expands): Promise<Event>;
        static getEventById(tournamentName: string, eventId: number): Promise<Event>;
        getName(): any;
        getSlug(): string;
        getStartTime(): Date;
        getEndTime(): Date;
        getEventPhases(): Promise<Phase[]>;
        getEventMatchIds(): Promise<number[]>;
        getEventPhaseGroups(): Promise<PhaseGroup[]>;
    }
}
declare module "smashgg" {
    import { Tournament } from "Tournament";
    import { Event } from "Event";
    import { Phase } from "Phase";
    import { PhaseGroup } from "PhaseGroup";
    import { GGSet } from "GGSet";
    import { Player } from "Player";
    const smashgg: {
        Tournament: typeof Tournament;
        Event: typeof Event;
        Phase: typeof Phase;
        PhaseGroup: typeof PhaseGroup;
        GGSet: typeof GGSet;
        Player: typeof Player;
    };
    export default smashgg;
}
