import { describe, it, before } from 'mocha';
import mongoose from 'mongoose'
import chai from 'chai';
import supertest from 'supertest-session';
import { usersServices } from '../src/services/usersServices.js';

await mongoose.connect('mongodb+srv://omardagostino:laly9853@cluster0.x1lr5sc.mongodb.net/ecommerce1')

const expect=chai.expect
const requester=supertest("http://localhost:8080")

describe('Probando el proyecto de comercio electrónico', function () {
    this.timeout(10000);
   
    describe('Pruebas del modulo de sesiones', function () {

        describe('Test 1 : prueba del endpoint Post para hacer Login de un usuario ', function () {
    
            it('El router inicia la sesion de un usuario, testea su contraseña y da una respuesta 302. Si es incorrecta la contraseña debe redirigirse a /api/sesions/errorLogin, caso contrario a /products', async function () {
            
                let usuarioIncorrecto={email:"usuarioDePrueba@gmail.com", password:"cualquierpasswordmenoslacorrecta"}
                let user2 = await requester.post("/api/sesions/login").send(usuarioIncorrecto)
                expect(user2.status).equal(302)
                expect(user2.header.location).equal('/api/sesions/errorLogin')
                let usuarioPrueba={email:"usuarioDePrueba@gmail.com", password:"prueba"}
                let user1 = await requester.post("/api/sesions/login").send(usuarioPrueba)
                    if (user1.header.location !== '/products') {
                        let registroPrueba={email:"usuarioDePrueba@gmail.com", password:"prueba",name:"usuario",last_name:"Prueba",age:44}
                        let user = await requester.post("/api/sesions/registro").send(registroPrueba)
                        user1 = await requester.post("/api/sesions/login").send(usuarioPrueba)
                    }
                expect(user1.status).equal(302)
                expect(user1.header.location).equal('/products')
            });
        });
        describe('Test 2 : Prueba del endpoint Get (Premium) para cambiar el tipo de usuario ', function () {
            let typeOfUserTarget 
            let usuarioOriginal
            it('El router debe acceder al usuario y modificar su typeOfUser de premium a user y viseversa, dando una respuesta 201', async function () {
                let mailDePrueba = {username:"usuarioDePrueba@gmail.com"} 
                const user3 = await usersServices.obtenerUsuarioPorEmail(mailDePrueba)
                usuarioOriginal = user3.typeofuser
                if (user3.typeofuser === 'user') {
                    typeOfUserTarget = 'premium'
                }
                if (user3.typeofuser === 'premium') {
                    typeOfUserTarget = 'user'
                }
                
                const user4 = await requester.get(`/api/sesions/premium/usuarioDePrueba@gmail.com`)
                
                expect(user4.status).equal(201)
                const user5 = await usersServices.obtenerUsuarioPorEmail(mailDePrueba)
                expect(user5.typeofuser).equal(typeOfUserTarget)
                const user6 = await requester.get(`/api/sesions/premium/usuarioDePrueba@gmail.com`)
                expect(user6.status).equal(201)
                const user7 = await usersServices.obtenerUsuarioPorEmail(mailDePrueba)
                expect(usuarioOriginal).equal(user7.typeofuser)        
            });
        });
        describe('Test 3 : Prueba del endpoint get (Current) para obtener los datos del usuario que hizo login', function () {
    
            it('El router debe deveolver las propiedades no confidenciales del usuario y dar una respuesta 200', async function () {
                
                let response3 = await requester.get('/api/sesions/current')
                expect(response3.status).equal(200);
                expect(response3.body.usuario).to.have.property('name')
                expect(response3.body.usuario).to.have.property('email')
                expect(response3.body.usuario).to.have.property('cartId')
                expect(response3.body.usuario).to.have.property('typeofuser')
                expect(response3.body.usuario).to.have.property('age')
                expect(response3.body.usuario).to.have.property('last_name')
                expect(response3.body.usuario).not.to.have.property('password')
                    
            });
        });
    });
})

