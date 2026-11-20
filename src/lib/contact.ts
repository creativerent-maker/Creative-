import ajustes from '../content/ajustes.json';

const digits = (s: string) => s.replace(/\D/g, '');
export const contact = {
  ...ajustes,
  telHref: `tel:+34${digits(ajustes.telefono)}`,
  movilHref: `tel:+34${digits(ajustes.movil)}`,
  whatsapp: `https://wa.me/34${digits(ajustes.movil)}`,
  mailHref: `mailto:${ajustes.email}`,
  telIntl: `+34${digits(ajustes.telefono)}`,
};
