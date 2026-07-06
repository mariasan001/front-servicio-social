export type DocumentoEstatusResponse = {
  idProcesoDocumento: number;
  tipoDocumento?: string;
  nombreDocumento?: string;
  estatus?: string;
  obligatorio?: boolean;
};

export type CartaMetadataResponse = {
  idCarta: number;
  tipoCarta?: string;
  folio?: string;
  estatus?: string;
  fechaEmision?: string;
};
