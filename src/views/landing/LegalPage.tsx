import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export type LegalKind = 'privacy' | 'terms' | 'security';

interface LegalPageProps {
  kind: LegalKind;
  onBack: () => void;
}

/**
 * Pagina reutilizable para Privacidad, Terminos y Seguridad. El contenido es
 * una plantilla generica marcada como [BORRADOR] — debe pasar revision legal
 * antes de publicarse. La estructura y el indice ya son los definitivos.
 */
export default function LegalPage({ kind, onBack }: LegalPageProps) {
  const { language } = useLanguage();
  const isEs = language === 'es';

  const titles: Record<LegalKind, { es: string; en: string }> = {
    privacy: { es: 'Política de privacidad', en: 'Privacy Policy' },
    terms: { es: 'Términos de servicio', en: 'Terms of Service' },
    security: { es: 'Seguridad', en: 'Security' },
  };

  const sectionsByKind: Record<LegalKind, { heading: string; body: string }[]> = {
    privacy: isEs
      ? [
          {
            heading: '1. Datos que recogemos',
            body: 'Recogemos los datos estrictamente necesarios para que la plataforma funcione: identificadores de cuenta, datos de perfil que tú o tus clientes introducís, mediciones y check-ins, y datos técnicos básicos de uso (logs de acceso e IP) por motivos de seguridad.',
          },
          {
            heading: '2. Cómo usamos esos datos',
            body: 'Únicamente para prestar el servicio: mostrarte tus clientes, sus planes y su progreso; emitir cobros a través de Stripe; enviar notificaciones que tú o tu cliente habéis activado. Nunca vendemos datos a terceros ni los usamos para publicidad.',
          },
          {
            heading: '3. Subencargados',
            body: 'Operamos sobre infraestructura europea y trabajamos con encargados especializados (Supabase para almacenamiento y autenticación, Stripe para pagos). Cada uno actúa bajo contrato de tratamiento de datos.',
          },
          {
            heading: '4. Conservación',
            body: 'Mantenemos tus datos mientras tengas cuenta activa. Al darte de baja podrás solicitar la exportación o eliminación definitiva.',
          },
          {
            heading: '5. Tus derechos',
            body: 'Puedes ejercer en cualquier momento los derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición previstos por el RGPD escribiéndonos al correo de contacto que aparece al pie.',
          },
        ]
      : [
          {
            heading: '1. Data we collect',
            body: 'We collect only the data strictly required to run the platform: account identifiers, profile data you or your clients enter, measurements and check-ins, and basic technical logs (access logs and IP) for security purposes.',
          },
          {
            heading: '2. How we use that data',
            body: 'Solely to provide the service: showing you your clients, plans and progress; processing payments through Stripe; sending notifications you or your client have opted into. We never sell data to third parties or use it for advertising.',
          },
          {
            heading: '3. Sub-processors',
            body: 'We run on European infrastructure and work with specialised processors (Supabase for storage and auth, Stripe for payments). Each operates under a data-processing agreement.',
          },
          {
            heading: '4. Retention',
            body: 'We keep your data while your account is active. On deletion you can request a final export or full removal.',
          },
          {
            heading: '5. Your rights',
            body: 'You may exercise at any time the rights of access, rectification, erasure, restriction, portability and objection granted by GDPR by writing to the contact email shown in the footer.',
          },
        ],
    terms: isEs
      ? [
          {
            heading: '1. Uso del servicio',
            body: 'Al usar la plataforma aceptas estos términos. El servicio se ofrece tal cual y para uso profesional por parte de coaches, nutricionistas y entrenadores con sus propios clientes.',
          },
          {
            heading: '2. Cuenta y responsabilidad',
            body: 'Eres responsable de la veracidad de los datos que introduces, de mantener la confidencialidad de tus credenciales y del cumplimiento legal en tu relación con tus clientes finales.',
          },
          {
            heading: '3. Suscripción y pagos',
            body: 'Los planes y precios vigentes se publican en la sección de Precios. Los cobros se procesan a través de Stripe. Puedes cancelar tu suscripción en cualquier momento desde Ajustes → Facturación.',
          },
          {
            heading: '4. Propiedad intelectual',
            body: 'El código, diseño y marcas de la plataforma son propiedad de NutriFit. El contenido que tú o tus clientes generáis sigue siendo vuestro.',
          },
          {
            heading: '5. Limitación de responsabilidad',
            body: 'La plataforma es una herramienta de gestión: las recomendaciones nutricionales y de entrenamiento que prepares para tus clientes son tu responsabilidad profesional, no nuestra.',
          },
          {
            heading: '6. Modificaciones',
            body: 'Podemos actualizar estos términos con aviso previo razonable. Las versiones anteriores quedarán disponibles bajo petición.',
          },
        ]
      : [
          {
            heading: '1. Use of the service',
            body: 'By using the platform you accept these terms. The service is offered as is and is intended for professional use by coaches, nutritionists and trainers with their own clients.',
          },
          {
            heading: '2. Account and responsibility',
            body: 'You are responsible for the accuracy of the data you enter, for keeping your credentials confidential and for legal compliance in the relationship with your end clients.',
          },
          {
            heading: '3. Subscription and payments',
            body: 'Current plans and prices are published on the Pricing section. Payments are processed through Stripe. You may cancel your subscription anytime from Settings → Billing.',
          },
          {
            heading: '4. Intellectual property',
            body: 'The platform code, design and trademarks belong to NutriFit. The content you or your clients generate remains yours.',
          },
          {
            heading: '5. Limitation of liability',
            body: 'The platform is a management tool: the nutrition and training recommendations you prepare for your clients are your professional responsibility, not ours.',
          },
          {
            heading: '6. Changes',
            body: 'We may update these terms with reasonable prior notice. Previous versions remain available on request.',
          },
        ],
    security: isEs
      ? [
          {
            heading: 'Cifrado en tránsito y en reposo',
            body: 'Toda comunicación con la plataforma viaja sobre TLS. Los datos en la base de datos se cifran en reposo y los accesos quedan registrados.',
          },
          {
            heading: 'Autenticación',
            body: 'Las contraseñas se almacenan con hash seguro y nunca se exponen al equipo. Soportamos autenticación de doble factor para cuentas de coach.',
          },
          {
            heading: 'Aislamiento por tenant',
            body: 'Cada coach solo puede acceder a sus clientes; cada cliente solo a sus propios datos. El aislamiento se aplica en el servidor mediante middleware de rol y reglas de fila.',
          },
          {
            heading: 'Copias de seguridad',
            body: 'La infraestructura realiza copias automáticas con punto de recuperación reciente. Podemos restaurar datos en caso de incidente.',
          },
          {
            heading: 'Notificación de incidentes',
            body: 'En caso de brecha de seguridad relevante, notificaremos a las personas afectadas y a la autoridad competente en los plazos exigidos por la normativa aplicable.',
          },
        ]
      : [
          {
            heading: 'Encryption in transit and at rest',
            body: 'All communication with the platform travels over TLS. Database data is encrypted at rest and access is logged.',
          },
          {
            heading: 'Authentication',
            body: 'Passwords are stored with secure hashing and never exposed to the team. Two-factor authentication is supported for coach accounts.',
          },
          {
            heading: 'Tenant isolation',
            body: 'Each coach can only access their own clients; each client only their own data. Isolation is enforced server-side via role middleware and row-level rules.',
          },
          {
            heading: 'Backups',
            body: 'Infrastructure performs automated backups with a recent recovery point. We can restore data in case of incident.',
          },
          {
            heading: 'Incident notification',
            body: 'In the event of a relevant security breach we will notify affected individuals and the competent authority within the deadlines required by the applicable regulation.',
          },
        ],
  };

  const sections = sectionsByKind[kind];
  const title = titles[kind][isEs ? 'es' : 'en'];

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-10"
      >
        <ChevronLeft className="w-4 h-4" />
        {isEs ? 'Volver a inicio' : 'Back to home'}
      </button>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3 mb-10 text-xs text-amber-800">
        {isEs
          ? 'Documento en versión borrador. Pendiente de revisión legal antes de su publicación oficial.'
          : 'Draft document. Pending legal review before official publication.'}
      </div>

      <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-3">{title}</h1>
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-12">
        {isEs ? 'Última actualización' : 'Last updated'}: 2026-05
      </p>

      <div className="space-y-10">
        {sections.map((sec, i) => (
          <section key={i}>
            <h2 className="text-xl font-medium mb-3">{sec.heading}</h2>
            <p className="text-gray-600 leading-relaxed text-sm">{sec.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
