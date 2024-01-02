export const errorHandler=(error, req, res, next)=>{
    if(error){
        if(error.codigo){
            console.error (` ${error.codigo}  ${error.descripcion}: ${error.causa} ${error.stack}`);

            res.setHeader('Content-Type','application/json');
            return res.status(400).send({error:error.descripcion})
        }else {
            console.error('Error inesperado:', error);
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
              error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`
            });
          }
          
    }

    next()
}