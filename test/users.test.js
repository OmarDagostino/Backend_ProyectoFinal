import { setLoggerLevel } from '../src/errorManagement/logger.js'; 
// Configura el nivel del logger antes de ejecutar los tests

import { describe, it, before } from 'mocha';
import mongoose from 'mongoose'
import chai from 'chai';
import chaiHttp from 'chai-http';
import FormData from 'form-data'
import {config} from '../src/config/config.js'
import {router} from '../src/routes/router.users.js'
import fs from 'fs';
import supertest from 'supertest-session';
import { usersServices } from '../src/services/usersServices.js';
import path from 'path'
import __dirname from '../src/util.js';
chai.use(chaiHttp)


mongoose.connect(config.MONGO_URL);

const form = new FormData();
const expect=chai.expect
const requester=supertest("http://localhost:8080")

describe('Probando el proyecto de comercio electrónico', function () {
    this.timeout(10000);
    
    before (async function () {
      
        setLoggerLevel('error');
        
            })
    after(async () => {
      const userToDelete = await usersServices.obtenerUsuarioPorId(userIdABorrar)
      // borrar documentos de prueba creados
      let linkABorrar = userToDelete.documents[0].reference 
        if (fs.existsSync(linkABorrar)) {
                fs.unlink(linkABorrar, (error) => {
                if (error) {
                  console.error(`Error al borrar el archivo: ${error.message}`);
                }})
        } else {
            console.error('El archivo no existe');
          }
          linkABorrar = userToDelete.documents[1].reference 
          if (fs.existsSync(linkABorrar)) {
                  fs.unlink(linkABorrar, (error) => {
                  if (error) {
                    console.error(`Error al borrar el archivo: ${error.message}`);
                  }})
          } else {
              console.error('El archivo no existe');
            }
            linkABorrar = userToDelete.documents[2].reference 
            if (fs.existsSync(linkABorrar)) {
                    fs.unlink(linkABorrar, (error) => {
                    if (error) {
                      console.error(`Error al borrar el archivo: ${error.message}`);
                    }})
            } else {
                console.error('El archivo no existe');
              }
        // eliminar usuario de prueba creado
        await usersServices.eliminarUsuario(userIdABorrar)
          
        // restaurar mode de logger
        const levelSegunEntorno = config.MODE_OPTION !== 'production' ? 'debug' : 'info';
        setLoggerLevel(levelSegunEntorno);

        mongoose.connection.close();  // Cierra la conexión a la base de datos   
  
      });

    let userIdABorrar 
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
                userIdABorrar = user3._id
                let filePath = path.resolve(__dirname, '../test/Identificacion.txt');
                
                const response = await requester
                .post(`/api/users/${user3._id}/documents`)
                .set('Content-Type', `multipart/form-data; boundary=${form.getBoundary()}`)
                .field('tipoArchivo1', 'documento')
                .field('otroTexto1','')
                .field('tipoDocumento1', 'identificacion')
                .attach('archivos1', filePath);
            
                filePath = path.resolve(__dirname, '../test/EstadoCuenta.txt');
                const response1  = await requester
                .post(`/api/users/${user3._id}/documents`)
                .set('Content-Type', `multipart/form-data; boundary=${form.getBoundary()}`)
                .field('tipoArchivo1', 'documento')
                .field('otroTexto1','')
                .field('tipoDocumento1', 'estadoCuenta')                
                .attach('archivos1', filePath);
                
                filePath = path.resolve(__dirname, '../test/Domicilio.txt');
                const response2 = await requester
                .post(`/api/users/${user3._id}/documents`)
                .set('Content-Type', `multipart/form-data; boundary=${form.getBoundary()}`)
                .field('tipoDocumento1', 'domicilio')
                .field('otroTexto1','')
                .field('tipoArchivo1', 'documento')
                .attach('archivos1', filePath);             
      
                usuarioOriginal = user3.typeofuser
                if (user3.typeofuser === 'user') {
                    typeOfUserTarget = 'premium'
                }
                if (user3.typeofuser === 'premium') {
                    typeOfUserTarget = 'user'
                }
                
                const user4 = await requester.get(`/api/users/premium/usuarioDePrueba@gmail.com`)
                
                expect(user4.status).equal(201)
                const user5 = await usersServices.obtenerUsuarioPorEmail(mailDePrueba)
                expect(user5.typeofuser).equal(typeOfUserTarget)
                const user6 = await requester.get(`/api/users/premium/usuarioDePrueba@gmail.com`)
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

