import { describe, it, before } from 'mocha';
import mongoose from 'mongoose'
import chai from 'chai';
import supertest from 'supertest-session';

await mongoose.connect('mongodb+srv://omardagostino:laly9853@cluster0.x1lr5sc.mongodb.net/ecommerce1')

const expect=chai.expect
const requester=supertest("http://localhost:8080")
let productId

describe('Probando el proyecto de comercio electrónico', function () {
  this.timeout(20000);

    after (async function () {
      let response4 = await requester.delete("/api/products/"+`${productId}`)
    })

  describe('Pruebas del modulo de productos', function () {
    describe('Test 1 : Prueba del endpoint GET para todos o varios productos', function () {
  
      it('El router debe devolver un objeto con los productos y un estado success', async function () {
    
        let usuarioPrueba={email:"adminCoder@coder.com", password:"adminCod3r123"}
        let user=await requester.post("/api/sesions/login").send(usuarioPrueba)
        let response = await requester.get("/api/products")
        expect(response.body).to.have.property('payload');
        expect(response.body.status).equal('success') 
      });
    });
    describe('Test 2 : Prueba del endpoint POST para crear un producto', function () {
  
      it('El router debe crear un producto con todas sus propiedades y dar una respuesta 200', async function () {
             
        let productoPrueba ={title:"producto de prueba", description:"descripcion del producto de prueba", code:"CODIGODEPRUEBA", price: 1200, stock: 100, category:"categoriadeprueba" }
        let response1 = await requester.post("/api/products").send(productoPrueba)
        expect(response1.status).equal(200);

        let response2 = await requester.get("/api/products?limit=10000000000")
        const index = response2.body.payload.findIndex(product => product.code === 'CODIGODEPRUEBA');
        expect(response2.body.payload[index]).to.have.property('title')
        expect(response2.body.payload[index]).to.have.property('description')
        expect(response2.body.payload[index]).to.have.property('price')
        expect(response2.body.payload[index]).to.have.property('stock')
        expect(response2.body.payload[index]).to.have.property('category')
        expect(response2.body.payload[index]).to.have.property('owner')
        expect(response2.body.payload[index]).to.have.property('status')
        productId = response2.body.payload[index]._id
        
      });
    });
    describe('Test 3 : Prueba del endpoint get para buscar un producto por su ID', function () {
  
      it('El router debe deveolver las propiedades del producto y devolver una respuesta 200', async function () {
             
        let response3 = await requester.get("/api/products/"+`${productId}`)
        expect(response3.status).equal(200);

        expect(response3.body).to.have.property('title')
        expect(response3.body).to.have.property('description')
        expect(response3.body).to.have.property('price')
        expect(response3.body).to.have.property('stock')
        expect(response3.body).to.have.property('category')
        expect(response3.body).to.have.property('owner')
        expect(response3.body).to.have.property('status')
        
        
      });
    });
  });
})

