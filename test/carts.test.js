import { describe, it, before } from 'mocha';
import mongoose from 'mongoose'
import chai from 'chai';
import supertest from 'supertest-session';
import {productModel} from '../src/models/product.model.js';

await mongoose.connect('mongodb+srv://omardagostino:laly9853@cluster0.x1lr5sc.mongodb.net/ecommerce1')

const expect=chai.expect
const requester=supertest("http://localhost:8080")
let productId
let cartId

describe('Probando el proyecto de comercio electrónico', function () {
  this.timeout(20000);

    after (async function () {
      let response4 = await requester.delete("/api/products/"+`${productId}`)
    })

  describe('Pruebas del modulo de carritos', function () {
    describe('Test 1 : Prueba del endpoint POST para agregar un poducto a un carrito', function () {
  
      it('El router debe agregar a un carrito con el producto informado con cantidad 1', async function () {
      
        let usuarioPrueba={email:"usuarioDePrueba@gmail.com", password:"prueba"}
        let user1 = await requester.post("/api/sesions/login").send(usuarioPrueba)
        console.log ('** user1.status**', user1.status)
        console.log ('*** user1.location***', user1.header.location)
        if (user1.status === 302 && user1.header.location === '/api/sesions/errorLogin') {
            let registroPrueba={email:"usuarioDePrueba@gmail.com", password:"prueba",name:"usuario",last_name:"Prueba",age:44}
            let user = await requester.post("/api/sesions/registro").send(registroPrueba)
            user1 = await requester.post("/api/sesions/login").send(usuarioPrueba)
        }
        let usuario = await requester.get("/api/sesions/current")
        cartId = usuario.body.usuario.cartId
        
        const existingProduct = await productModel.findOne();
        let objectProductId = existingProduct._id
        productId = objectProductId.toString()

        let borrarCarrito = await requester.delete(`/api/carts/${cartId}`)

        let carritoDePrueba = await requester.post(`/api/carts/${cartId}/product/${objectProductId}`)
        
        expect(carritoDePrueba.status).equal(201) 

        let contenidoDelCarrito = await requester.get(`/api/carts/${cartId}`)
        expect(contenidoDelCarrito.body.products[0].productId._id).to.be.equal(productId)
        
        expect(contenidoDelCarrito.body.products[0].quantity).to.be.equal(1)

      });
    });

    describe('Test 2 : Prueba del endpoint GET para retornar un carrito por su Id', function () {
  
      it('El router debe obtener los productos de un carrito y  dar una respuesta 200', async function () {
              
        let carritoObtenido= await requester.get(`/api/carts/${cartId}`)
        expect(carritoObtenido.status).equal(200);

        expect(carritoObtenido.body).to.have.property('products')
      });
    });
    describe('Test 3 : Prueba del endpoint DELETE para eliminar un producto de un carrito', function () {
  
      it('El router debe eliminar un producto del array de productos de un carrito y devolver una respuesta 201', async function () {
             
        let borrarUnProducto = await requester.delete(`/api/carts/${cartId}/product/${productId}`)
        expect(borrarUnProducto.status).equal(201);

        let carritoDePrueba = await requester.get(`/api/carts/${cartId}`)
        let index = carritoDePrueba.body.products.findIndex(p=> p.productId === productId )

        expect (index).equal(-1)
        
      });
    });
  });
})

