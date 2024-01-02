# Desafío de la clase 44
# Comisión 55565  de CoderHouse

## Autor : Omar D'Agostino

## Funcionalidades agregadas 
    * Implementacion de la ruta api/users/:uid/documents para subir multiples archivos con Multer. Se creo la vista upload con handlebars para enviar el formulario correspondiente. En el mismo se elige el tipo de archivo entre documentos, imagen del perfil o imagen de productos, y se graba en la carpeta correspondiente (cuya carpeta raiz es upload) según corresponda. Si las carpetas no existen, las crea.  El nombre del archivo guardado tiene la siguiente estructura : userId.fechayhora.nombre del archivo original.extensión del archivo original. El link del archivo y su nombre de archivo se guarda en el registro del usuario en el array documents.  

    * En la vista de los datos del usuario se modifico el controlador que maneja el cambio a usuario premium (pulsando el boton de upgrade) para permitir hacer este cambio solo a los usuarios que hayan subido documentos con nombres : identificacion, estadoCuenta y domicilio.
    - 
   

## Tecnologías utilizadas : 
- Node JS : v18.16.1
- Motor de plantillas : Handlebars
- Estrategias de autenticación : Passport local y Passport con Git Hub
- Hasheo de password : Bcrypt
- Logger : Winston
- Websocket : socket.io
- Mongo DB Atlas usado con Mongoose
    -base de datos : ecommerce1
    -colecciones : products1 / carts1 / messages1 /sessions / users1 / tickets1 /lasttickets1
- Dependencias 
    "@faker-js/faker": "^8.3.1",
    "bcrypt": "^5.1.1",
    "commander": "^11.1.0",
    "connect-mongo": "^5.0.0",
    "cookie-parser": "^1.4.6",
    "crypto": "^1.0.1",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-handlebars": "^7.1.2",
    "express-session": "^1.17.3",
    "express-validator": "^7.0.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.5.1",
    "mongoose-paginate-v2": "^1.7.4",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.7",
    "nodemon": "^3.0.1",
    "passport": "^0.6.0",
    "passport-github2": "^0.1.12",
    "passport-local": "^1.0.0",
    "socket.io": "^4.7.2",
    "socket.io-client": "^4.7.2",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0",
    "winston": "^3.11.0"
  Dependencias de desarrollo: 
    "chai": "^4.3.10",
    "mocha": "^10.2.0",
    "nodemon": "^3.0.1",
    "supertest": "^6.3.3"

