import __dirname from '../util.js';
import {Server} from 'socket.io';
import { chatModel } from '../../src/models/chat.model.js';
import express from 'express';


// sp dinámica del CHAT
// en CHAT interaction 

export function chatController(server) {
  const app = express();
  let mensajes = [];
  leerMensajes();
  let usuarios = [];

  const io = new Server(server);
  app.locals.io = io;

  io.on('connection', (socket) => {
    console.log(`se ha conectado un cliente con id ${socket.id}`);

    io.on('message', (data) => {
      console.log(data);
    });

    socket.on('id', (email) => {
      console.log(`se ha conectado el usuario ${email}`);
      mensajes.push({
        user: 'server',
        message: 'Bienvenido al chat',
      });
      usuarios.push({ id: socket.id, usuario: email });
      socket.emit('bienvenida', mensajes);
      socket.broadcast.emit('nuevoUsuario', email);
      mensajes.pop();
    });

    socket.on('nuevoMensaje', (mensaje) => {
      mensajes.push(mensaje);
      io.emit('llegoMensaje', mensaje);
      const newmessage = new chatModel({
        user: mensaje.user,
        message: mensaje.message,
      });

      newmessage
        .save()
        .then(() => {
          console.log('Nuevo mensaje guardado con éxito:');
        })
        .catch((error) => {
          console.error('Error inesperado al guardar el mensaje:', error);
        });
    });

    socket.on('disconnect', () => {
      console.log(`se desconecto el cliente con id ${socket.id}`);
      let indice = usuarios.findIndex((usuario) => usuario.id === socket.id);
      if (indice >= 0) {
        let emaildesconectado = usuarios[indice].usuario;
        socket.broadcast.emit('desconexion', emaildesconectado);
        usuarios.splice(indice, 1);
      }
    });
  });

  async function leerMensajes() {
    try {
      const mensajesDB = await chatModel.find({}, 'user message').maxTimeMS(20000).exec();
      const mensajesArray = mensajesDB.map((documento) => ({
        user: documento.user,
        message: documento.message,
      }));
      mensajes.length = 0;
      mensajes.push(...mensajesArray);
    } catch (error) {
      console.error('Error inesperado al leer los mensajes guardados:', error);
    }
  }
}

export default chatController;
