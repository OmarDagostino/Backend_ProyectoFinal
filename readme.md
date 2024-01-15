# Proyecto Final
# Comisión 55565  de CoderHouse

## Autor : Omar D'Agostino

## Idioma

- De la documentacion de Swagger : la app esta preparada para elegir el idioma que desee que se muestre en la documentacion que visualiza Swagger, si se la llama con -l o --language se puede optar por sp para español o en para inglés, si no se informa, el default es inglés 

- De los comentarios dentro del código : no encontre una forma automática de setear el idioma, pero si se quiere tener una mejor experiencia con la seleccion del idioma de los comentarios dentro del código, es necesario agregar la extensión Better Comments a la instalación de VSC , y luego modificar el archivo settings.json de VSC (preferencias de usuarios) con el contenido de alguno de los archivos settings.json que estan en la carpeta settings.json de mi proyecto. Esto se hace con las teclas Crtl + Shift + P y buscar el archivo Preferences:Open User Settings (json). Si eligen el contenido both.settings.json => veran los comentarios en ambos idiomas, si eligen en.settings.json => veran los comentarios en inglés, si eligen sp.settings.json => veran los comentarios en español. Luego de modificar el archivo settings.json de su VSC deben reinicializar VSC para que tenga efecto. Si no hacen esta instalación los comentarios se veran en ambos idiomas de la forma tradicional, caso contrario los veran en rojo con fondo amarillo para el idioma español y negro con fondo celeste para inglés

## Variables de entorno

- Existen 4 archivos .env
    - .env.development
    - .env.mocha 
    - .env.production 
    - .env.staging

el objetivo de esta diversidad se debe a la posibilidad de apuntar a distintas URL o instancias de dichas varibales, dependiendo del estado del proyecto , esto se logra seleccionando el modo con -m o --modo y las alternativas obviamente son development , mocha, production y staging. El default es development.

## scripts del Package.json 

- Los tres srcipts básicos son dev , start y test . existe un cuarto script que se denomina dev-test y que esta orientado a ejecutar las pruebas de integración con mocha, chai y supertest, para ello el script abre la app.js y luego ejecuta los tests. El modo elegido en este caso es 'mocha' y ademas de elegir archivo de entorno especifico, hace un nuevo setup del nivel de logger del proyecto, para ver un resultado mas limpio en la terminal. No obstante cuando termine este proceso , es recomendable detener el servidor (que sigue funcionando), si se quieren utilizar otros entornos.

## subida de archivos de documentos de usuarios

- Acorde a lo solicitado existe una ruta para subir multiples archivos con Multer, esta es /users/:uid/documents . Hay una vista especifica para los usuarios, que tiene un formulario que permite subir los archivos. Para cada archivo a subir se solicita el nombre (tiene un elección que se despliega en la cual aparecen los nombres de los archivos indispensables para subir a categoria Premium, estos son : identificacion, domicilio y estado de cuenta, pero si se desea subir otro documento, se puede hacer eligiendo 'otro', en este caso le solicitara que tipee el nombre del documento a subir), el tipo de archivo (tiene una eleccion obligatoria de las 3 categorías especificadas , estas son : documentos, imagen de perfil o imagen de producto), segun sea el tipo de archivo se guardara en una sub-carpeta de la carpeta uploads segun corresponda : documents, profile o products . Cuando se selecciona el archivo a subir , se habilita otra linea para que pueda subir un archivo mas ( y asi sucesivamente hasta la cantidad que se requiera).

- Nombre de los archivos subidos : el formato del nombre grabado es : "el ID del usuario + . + fecha y hora de la grabacion + . + nombre y extension del archivo seleccionado". La direccion y el nombre del archivo son grabados en el archivo de usuarios en un array que tambien contiene el nombre elegido del documento. Cuando no se utilice la vista de handlebars para subir archivos, en el body de la petición deben venir las propiedades correspondiens : tipoDocumento1 => debe contener el nombre del documento (uno de los solicitados u 'otro' ), otroTexto1 => debe venir vacio si se eligio alguno de los nombre de documentos solicitados o debe venir el nombre del archivo que se quiere registrar, tipoDeArchivo1 => debe tener una de las tres opciones posibles documents, profiles o products. El archivo a subir debe estar en la propiedad archivos1 del tipo file. Si es un solo archivo a subir, debe ser un objeto normal conteniendo las propiedades correponsientes. Si son multiples archivos , debe ser un array de objetos, donde cada uno tenga todas las propiedades necesarias.

Si la carpeta uploads no esta creada , la aplicación la creará, al igual que las subcarpetas de cada categoría. 

Nota : en la carpeta de test existen 3 archivos de prueba : Domicilio.txt, EstadoCuenta.txt e Identificación.txt, que son usados en las pruebas de testeo con mocha, chai y supertest a efectos de poder constatar la subida de archivos y chequear la actualizacion del usuario a Premium. 

## menues de las vistas creadas con Handlebars 

- Cuando se ingresa a la vista general que el servidor atiende en el puerto 8080 (como fue requerido), se despliega la vista para hacer el login (tiene la opcion de hacer login con GitHub o ir a registrarse como usuario, en este caso debera hacer login una vez registrado). Una vez que fue exitoso el login se despliega la vista para que el usuario pueda elegir los productos a comprar y un menu con todas las posibilidades. (si el usuario es premium tendra la opción de ir al menu premium). Para poder hacer el upgrade a Premium (esto se hace con un boton en la vista de mostrar datos del usuario), el usuario debe subir los documentos obligatorios, y podra hacer el upgrade en la vista de datos del usuario. En el menu Premium , el usuario podra crear, modificar y eliminar los productos de su portfolio (solo se mostraran estos productos).

- Si el login lo hizo el administrador se le mostrara el menu con las tareas que el administrador puede hacer. 

-El menu de usuario permite agregar productos al carrito, ver los datos del usuario, hacer logout, subir documentos y ver el contenido del carrito, en donde podrá hacer el proceso de compra. 

-Todas las vistas de handlebars se manejan con el ruteador de vistas router.views.js

## Logger 
- Logger se establece según el entorno que se este ejecutando, e imprime los mensajes acorde a las especificaciones solicitadas (en archivo de log si es un entorno de produccion, o en consola si es un entorno de desarrollo; y con niveles distintos de gravedad), en todos los casos se imprime el time stamp junto con la descripción.

- Prueba : existe una ruta especifica api/loggerTest que imprime mensajes de error de prueba consigurados a tal efecto.

## Base de datos 
- Colecciones : 
    - users1 => Usuarios
    - products1 => Products
    - carts1 => Carritos de compra
    - sessions => Sesiones 
    - tickets1 => Tickets
    - lasttickets1 => Ultimo numero de ticket
    - messages1 => Mensajes del chat

- Las bases de datos estan cargadas con los datos necesarios para hacer todos los procesos implementados, pero si se quiere probar con bases de datos vacias, se debe registrar un usuario con el mail adminCoder@coder.com, y luego entrar por el servicio de MongoDB Atlas y modificar manualmente el tipo de usuario a 'admin'. De esta forma se podrá acceder como administrador del sitio. 

## Datos de prueba : 

- Usuarios : además del administrador (con la contraseña requerida en la consigna), se han registrado 4 usuarios adicionales cuyos emails y contraseñas son los siguientes : 
    1) lauzambo@gmail.com => "Laura" (es un usuario Premium)
    2) juan@comprador.com => "Juan"
    3) ana@compulsiva.com => "Ana"
    4) omardagostino@gmail.com => ingresado con GitHub 

- Productos : se han creado 72 productos , de los cuales 15 fueron ingresados por el usuario Premium lauzambo@gmail.com , y el resto por el administrador   

## Tecnologías utilizadas : 
- Node JS : v18.16.1
- Motor de plantillas : Handlebars
- Estrategias de autenticación : Passport local y Passport con Git Hub
- Hasheo de password : Bcrypt
- Logger : Winston
- Websocket : socket.io
- Test : Mocha / chai / supertest 
- Documentación : Swagger (Idioma Ingles en modalidad -l en / Idioma Español en modalidad -l sp)
- Servicio de mail : nodemailer con gmail
- Subida de archivos : Multer
- Router : express
- Persistencia en Base de datos : Mongo DB Atlas usado con Mongoose
    -base de datos : ecommerce1
    -colecciones : products1 / carts1 / messages1 /sessions / users1 / tickets1 /lasttickets1
- Dependencias 
   - "@faker-js/faker": "^8.3.1",
   - "bcrypt": "^5.1.1",
   - "commander": "^11.1.0",
   - "connect-mongo": "^5.0.0",
   - "cookie-parser": "^1.4.6",
   - "crypto": "^1.0.1",
   - "dotenv": "^16.3.1",
   - "express": "^4.18.2",
   - "express-handlebars": "^7.1.2",
   - "express-session": "^1.17.3",
   - "express-validator": "^7.0.1",
   - "jsonwebtoken": "^9.0.2",
   - "mongoose": "^7.5.1",
   - "mongoose-paginate-v2": "^1.7.4",
   - "multer": "^1.4.5-lts.1",
   - "nodemailer": "^6.9.7",
   - "nodemon": "^3.0.1",
   - "passport": "^0.6.0",
   - "passport-github2": "^0.1.12",
   - "passport-local": "^1.0.0",
   - "socket.io": "^4.7.2",
   - "socket.io-client": "^4.7.2",
   - "swagger-jsdoc": "^6.2.8",
   - "swagger-ui-express": "^5.0.0",
   - "winston": "^3.11.0"
- Dependencias de desarrollo: 
`  - "chai": "^4.3.10",
   - "mocha": "^10.2.0",
   - "nodemon": "^3.0.1",
   - "supertest": "^6.3.3"

