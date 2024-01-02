import {productsDataManager as DAOProducts} from '../dao/productsDataManager.js'

class ProductServices {

constructor (daoProducts) {
    this.daoProducts = new daoProducts
}

async obtenerProductos (combinedFilter, options) {
    return await this.daoProducts.obtenerProductos (combinedFilter, options) 
}

async obtenerProducto (pid) {
    return await this.daoProducts.obtenerProducto (pid)
}

async obtenerProductoPorCodigo (codigo) {
    return await this.daoProducts.obtenerProductoPorCodigo (codigo)
}

async crearProducto (newProduct) {
    return await this.daoProducts.crearProducto (newProduct)
}

async actualizarProducto (producto,pid) {
    return await this.daoProducts.actualizarProducto (producto,pid)
}

async eliminarProducto (pid) {
    return await this.daoProducts.eliminarProducto (pid)
}


}

export const productServices = new ProductServices (DAOProducts)