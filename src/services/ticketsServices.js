import {ticketsDataManager as DAOTickets} from "../dao/ticketsDataManager.js";

class TicketsServices {

    constructor (daoTickets) {
        this.daoTickets = new daoTickets ()
    }

    async obtenerTicket (tid) {
        return await this.daoTickets.obtenerTicket (tid)
    }

    async obtenerCodigoMayor () {
        return await this.daoTickets.obtenerCodigoMayor ()
    }

    async crearTicket  (newticket) {
        return await this.daoTickets.crearTicket (newticket)
    }

}

export const ticketsServices = new TicketsServices(DAOTickets)