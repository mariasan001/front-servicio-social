export type UsuarioInternoResponse = {
  idUsuario: number;
  username: string;
  nombreCompleto: string;
  correo: string;
  telefono?: string;
  activo?: boolean;
  roles: string[];
  escuelaId?: number;
  escuelaNombre?: string;
  cargo?: string;
  puedeDescargarCartas?: boolean;
  enlaceActivo?: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
};

export type CrearUsuarioInternoRequest = {
  username: string;
  password: string;
  nombreCompleto: string;
  correo: string;
  telefono?: string;
  roles: string[];
  escuelaId?: number;
  cargo?: string;
  puedeDescargarCartas?: boolean;
};

export type ActualizarUsuarioInternoRequest = {
  nombreCompleto?: string;
  correo?: string;
  telefono?: string;
  activo?: boolean;
  roles?: string[];
  escuelaId?: number;
  cargo?: string;
  puedeDescargarCartas?: boolean;
};

export type ResetPasswordUsuarioRequest = {
  password: string;
};

export type ListUsuariosInternosFilters = {
  rol?: string;
  activo?: boolean;
  username?: string;
  correo?: string;
  nombre?: string;
};
