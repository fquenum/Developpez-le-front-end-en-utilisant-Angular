import { Participation } from "./Participation";

export interface Olympic { // représente un pays avec toutes ses participations historique au JO
    id : number;            // identifiant unique, sert essentiellement a changer de pages
    country : string;          //pays
    participations: Participation [];       //un pays a plusieurs participations
}

