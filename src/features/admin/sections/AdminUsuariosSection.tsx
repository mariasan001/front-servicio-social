import { ADMIN_SECTION_ENDPOINTS } from "../constants/endpoints";
import type { UsuarioInternoResponse } from "../types/usuario.types";
import {
  AdminApiSection,
  runAdminProbe,
} from "../components/AdminApiSection/AdminApiSection";
import {
  getUsuarioInterno,
  listUsuariosInternos,
} from "../services/usuarios.service";

export async function AdminUsuariosSection() {
  const listProbe = await runAdminProbe(
    "Listado de usuarios internos",
    "GET /api/admin/usuarios-internos",
    () => listUsuariosInternos(),
  );

  const probes = [listProbe];
  const firstId = listProbe.ok
    ? (listProbe.data as UsuarioInternoResponse[] | undefined)?.[0]?.idUsuario
    : undefined;

  if (firstId) {
    probes.push(
      await runAdminProbe(
        `Detalle usuario #${firstId}`,
        `GET /api/admin/usuarios-internos/${firstId}`,
        () => getUsuarioInterno(firstId),
      ),
    );
  }

  return (
    <AdminApiSection
      title="Usuarios internos"
      description="Administración de cuentas internas del sistema."
      endpoints={ADMIN_SECTION_ENDPOINTS.usuarios}
      probes={probes}
    />
  );
}
