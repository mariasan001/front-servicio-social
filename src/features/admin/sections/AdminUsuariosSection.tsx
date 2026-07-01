import { ADMIN_SECTION_ENDPOINTS } from "../constants/endpoints";
import type { UsuarioInternoResponse } from "../types/usuario.types";
import { ApiSection, probeListAndDetail } from "@/shared/components/ApiSection";
import {
  getUsuarioInterno,
  listUsuariosInternos,
} from "../services/usuarios.service";

export async function AdminUsuariosSection() {
  const probes = await probeListAndDetail<UsuarioInternoResponse>({
    listLabel: "Listado de usuarios internos",
    listPath: "GET /api/admin/usuarios-internos",
    detailLabelPrefix: "Detalle usuario",
    detailPath: (id) => `GET /api/admin/usuarios-internos/${id}`,
    listRequest: () => listUsuariosInternos(),
    detailRequest: (id) => getUsuarioInterno(id),
    idKey: "idUsuario",
  });

  return (
    <ApiSection
      sectionId="admin-usuarios"
      title="Usuarios internos"
      description="Administración de cuentas internas del sistema."
      endpoints={ADMIN_SECTION_ENDPOINTS.usuarios}
      probes={probes}
    />
  );
}
