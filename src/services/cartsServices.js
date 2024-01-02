import {cartsDataManager as DAOCarts} from "../dao/cartsDataManager.js";

class CartsServices {

    constructor (daoCarts) {
        this.daoCarts = new daoCarts ()
    }

    async obtenerCarrito (cid) {
        return await this.daoCarts.obtenerCarrito (cid)
    }

    async obtenerCarritoSinPopulate (cid) {
        return await this.daoCarts.obtenerCarritoSinPopulate (cid)
    }

    async actualizarCarrito (newcart,cid) {
        return await this.daoCarts.actualizarCarrito (newcart,cid)
    }

    async crearCarrito  (newcart) {
        return await this.daoCarts.crearCarrito (newcart)
    }

}

export const cartsServices = new CartsServices (DAOCarts)