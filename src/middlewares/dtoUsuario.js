export function  dtousuario (req, res, next) {
  try {
    const usuario = req.session.usuario;


    const usuarioDTO = {
      name: usuario.name,
      email: usuario.email,
      cartId: usuario.cartId,
      typeofuser: usuario.typeofuser,
      age: usuario.age,
      last_name: usuario.last_name,
    };

    req.dto = { usuario: usuarioDTO }; // Almacenar el DTO en el objeto de solicitud
    next();
  } catch (error) {
    console.error('Error en el middleware DTO', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
export default dtousuario