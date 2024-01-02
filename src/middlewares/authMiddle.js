export function authUser (req, res, next) {
    if (!req.session.usuario) {
        return res.status(403).send("Debes hacer LogIn")
    }
    if (req.session.usuario.typeofuser==='user' || req.session.usuario.typeofuser==='premium') {
      next();
    } else {
      res.status(401).send("No autorizado");
    }
  }
  
  export function authAdmin (req, res, next) {
    if (!req.session.usuario) {
        return res.status(403).send("Debes hacer LogIn")
    }
  
    if (req.session.usuario.typeofuser=='admin'|| req.session.usuario.typeofuser=='premium') {
      next();
    } else {
      res.status(401).send("No autorizado");
    }
  }

  
// middleware para redireccionar al login si no tiene una sesion activa 
export const auth=(req,res,next)=>{
  if (req.session.usuario) {
    
      next ()
  } else {
      return res.redirect('/login')
  }
}

// middleware para redireccionar a la vista principal si tiene una sesion activa 
export const auth2=(req,res,next)=>{
  if (req.session.usuario) {
      return res.redirect('/products')  
  } else {
      next ()
  }
}

