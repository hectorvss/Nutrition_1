/**
 * Fills every planning_templates row with a COMPLETE, professional roadmap
 * inside data_json: nutrition + training blocks where every strategic field
 * (summary, objectives, KPIs, success criteria, coach notes, risks, metrics)
 * is authored — plus goals and milestones.
 *
 * Run:  node scripts/seed_planning_roadmaps.mjs
 */
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
for (const line of fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const db = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Content library. LIB[goal] = [phase0..phase3].
 * Each phase: { es:{n,t}, en:{n,t} } where n = nutrition strat, t = training strat.
 * n: title, kcal, macros, freq, water, sum, po, so[], kpi[], sc[], notes, risk[]
 * t: title, focus, vol, int, cardio, sum, po, so[], kpi[], sc[], notes, risk[], it[]
 */
const LIB = {
  fat_loss: [
    {
      es: {
        n: { title: 'Adaptación metabólica', kcal: 'Mantenimiento', macros: '40 / 35 / 25', freq: '4 comidas/día', water: '2,5–3 L/día',
          sum: 'Fase puente previa al déficit: se consolidan hábitos, horarios y registro alimentario para llegar al recorte con una base estable. No se busca pérdida de peso todavía, sino control y consistencia.',
          po: 'Estabilizar el peso en calorías de mantenimiento reales y establecer una ingesta proteica de 1,8–2,2 g/kg que se sostendrá durante todo el programa.',
          so: ['Fijar un horario de comidas regular y repetible entre semana', 'Aprender a registrar raciones con báscula durante 14 días', 'Establecer una rutina de hidratación y sueño de 7–9 h'],
          kpi: ['Adherencia al registro alimentario ≥ 90 % de los días', 'Variación de peso semanal dentro de ±0,5 %', 'Proteína diaria ≥ 1,8 g/kg en el 90 % de los días', 'Pasos diarios estabilizados en el rango objetivo'],
          sc: ['El cliente registra todas las comidas sin fricción', 'El peso se mantiene estable 2 semanas seguidas', 'Hábitos de hidratación y sueño consolidados'],
          notes: 'Es habitual descubrir aquí que el mantenimiento real difiere del estimado: ajusta calorías según la tendencia de peso de 10–14 días, nunca por un dato aislado. No inicies el déficit hasta que el registro sea fiable.',
          risk: ['Iniciar el déficit antes de tener un mantenimiento fiable', 'Infrarregistro de aceites, salsas y bebidas', 'Expectativa del cliente de perder peso ya en esta fase'] },
        t: { title: 'Readaptación de fuerza', focus: 'Fuerza full-body', vol: '10–12 series/grupo/sem', int: 'Moderada (RIR 3–4)', cardio: '2 sesiones LISS 30 min',
          sum: 'Reintroducción del entrenamiento de fuerza con cargas conservadoras para recuperar técnica y patrones de movimiento antes de exigir intensidad. El objetivo es construir tolerancia, no fatiga.',
          po: 'Recuperar la técnica de los patrones básicos (sentadilla, bisagra, empuje, tracción) y la capacidad de trabajo con un RIR 3–4.',
          so: ['Establecer 3 sesiones de fuerza semanales sostenibles', 'Documentar cargas iniciales de cada ejercicio clave', 'Introducir cardio de baja intensidad sin interferir con la fuerza'],
          kpi: ['Asistencia ≥ 90 % de las sesiones programadas', 'Técnica validada por vídeo en los 4 patrones básicos', 'Progresión de carga registrada semana a semana', 'Ausencia de dolor articular tras las sesiones'],
          sc: ['3 sesiones semanales completadas sin molestias', 'Técnica estable en básicos a RIR 3–4', 'Cardio integrado sin afectar la recuperación'],
          notes: 'Prioriza la calidad de movimiento sobre la carga. Si el cliente viene de un parón largo, espera agujetas marcadas las dos primeras semanas; no las confundas con sobreentrenamiento.',
          risk: ['Progresar carga demasiado rápido y generar dolor articular', 'Exceso de cardio que interfiere con la recuperación', 'Saltarse el calentamiento por falta de tiempo'],
          it: ['RIR 3–4 en series principales', 'Calentamiento específico 8–10 min', 'Cardio LISS a 60–65 % FCmáx'] },
      },
    },
    {
      es: {
        n: { title: 'Déficit progresivo', kcal: 'Déficit −15 %', macros: '45 / 30 / 25', freq: '4 comidas/día', water: '3 L/día',
          sum: 'Primera fase de pérdida real: se aplica un déficit moderado y sostenible priorizando proteína y saciedad. El ritmo objetivo es conservador para preservar masa magra y rendimiento.',
          po: 'Generar una pérdida de grasa de 0,5–0,75 % del peso corporal por semana manteshiendo la masa muscular y la energía de entrenamiento.',
          so: ['Mantener la proteína alta para maximizar la saciedad', 'Priorizar alimentos de alta densidad nutricional y volumen', 'Gestionar el hambre con fibra, líquidos y reparto de comidas'],
          kpi: ['Pérdida de peso de 0,5–0,75 %/semana de media', 'Adherencia calórica ≥ 90 % de los días', 'Proteína ≥ 2,0 g/kg diaria', 'Fuerza mantenida en los ejercicios principales'],
          sc: ['Pérdida sostenida sin caídas bruscas de rendimiento', 'Hambre controlada y reportada como manejable', 'Sin pérdida de fuerza relevante en básicos'],
          notes: 'Revisa el déficit cada 2 semanas: si la pérdida supera el 1 %/sem, sube calorías para frenar la pérdida de masa magra. Programa una comida flexible semanal para mejorar la adherencia.',
          risk: ['Déficit demasiado agresivo con pérdida de masa muscular', 'Caída de adherencia el fin de semana', 'Descenso de NEAT por fatiga (menos pasos espontáneos)'] },
        t: { title: 'Fuerza y acondicionamiento', focus: 'Fuerza + metabólico', vol: '12–16 series/grupo/sem', int: 'Moderada-alta (RIR 2–3)', cardio: '3 sesiones (2 LISS + 1 HIIT)',
          sum: 'El entrenamiento mantiene el estímulo de fuerza como seguro de la masa muscular y añade trabajo metabólico para elevar el gasto. La intensidad sube de forma controlada.',
          po: 'Preservar fuerza y masa muscular durante el déficit mientras se incrementa el gasto energético con acondicionamiento.',
          so: ['Mantener o progresar las cargas pese al déficit', 'Añadir trabajo metabólico sin comprometer la recuperación', 'Sostener un volumen de pasos diarios elevado'],
          kpi: ['Cargas mantenidas en ±5 % en los básicos', 'Asistencia ≥ 90 % a fuerza y acondicionamiento', 'Pasos diarios en el objetivo el 90 % de los días', 'RPE de las sesiones dentro de lo previsto'],
          sc: ['Fuerza preservada en sentadilla, peso muerto y press', 'Acondicionamiento completado sin fatiga acumulada', 'Recuperación entre sesiones adecuada'],
          notes: 'En déficit la fuerza es el indicador clave de que conservas músculo: si cae de forma sostenida, el problema es nutricional, no de entrenamiento. Ajusta el HIIT a la recuperación real del cliente.',
          risk: ['Acumular fatiga por exceso de HIIT en déficit', 'Reducir cargas “porque toca dieta” sin necesidad', 'Descuidar el sueño y comprometer la recuperación'],
          it: ['RIR 2–3 en series principales', 'HIIT 8–10 intervalos a 85–90 % FCmáx', 'LISS 60–65 % FCmáx 30–40 min'] },
      },
    },
    {
      es: {
        n: { title: 'Definición intensiva', kcal: 'Déficit −20 %', macros: '45 / 30 / 25', freq: '4–5 comidas/día', water: '3–3,5 L/día',
          sum: 'Tramo final de mayor exigencia: el déficit se profundiza para acelerar la pérdida cuando el cliente ya tiene hábitos sólidos. Requiere vigilancia estrecha de rendimiento y recuperación.',
          po: 'Maximizar la pérdida de grasa preservando la masa muscular, llevando al cliente al físico objetivo sin comprometer la salud.',
          so: ['Maximizar saciedad con proteína y volumen de vegetales', 'Programar refeeds estratégicos para sostener el rendimiento', 'Monitorizar señales de fatiga, hambre y estado de ánimo'],
          kpi: ['Pérdida de 0,5–1 %/semana según composición', 'Adherencia ≥ 92 % pese al déficit más exigente', 'Proteína ≥ 2,2 g/kg diaria', 'Marcadores de fatiga dentro de rango'],
          sc: ['Físico objetivo alcanzado o muy próximo', 'Sin pérdida marcada de fuerza ni de salud', 'El cliente llega a fase de mantenimiento estable'],
          notes: 'Esta fase no debe extenderse más de 4–6 semanas seguidas. Si aparecen señales claras de fatiga metabólica (hambre extrema, insomnio, caída de rendimiento), introduce un diet break a mantenimiento.',
          risk: ['Prolongar el déficit profundo más de lo recomendable', 'Pérdida de masa muscular por proteína o estímulo insuficientes', 'Impacto negativo en sueño, hormonas o estado de ánimo'] },
        t: { title: 'Intensificación y retención', focus: 'Fuerza pesada + cardio', vol: '10–14 series/grupo/sem', int: 'Alta (RIR 1–2)', cardio: '3–4 sesiones mixtas',
          sum: 'El volumen se reduce ligeramente y la intensidad sube: el trabajo pesado es la señal que protege la masa muscular cuando las calorías están más bajas. El cardio cubre el gasto restante.',
          po: 'Enviar un estímulo de fuerza de alta intensidad que retenga la masa muscular mientras el déficit es máximo.',
          so: ['Mantener cargas altas reduciendo volumen para gestionar fatiga', 'Cubrir el gasto objetivo con cardio sin canibalizar la recuperación', 'Cuidar la técnica cuando la fatiga es elevada'],
          kpi: ['Cargas principales mantenidas pese al déficit', 'Asistencia ≥ 90 % a todas las sesiones', 'Gasto por cardio dentro del objetivo semanal', 'RPE controlado y recuperación reportada como suficiente'],
          sc: ['Fuerza retenida hasta el final del déficit', 'Sin lesiones ni molestias por fatiga acumulada', 'Transición a mantenimiento sin pérdida de músculo'],
          notes: 'Reduce el volumen antes que la intensidad: mantener cargas altas con menos series es la mejor estrategia de retención muscular en déficit profundo. Vigila la técnica en las últimas repeticiones.',
          risk: ['Lesión por entrenar pesado con fatiga acumulada', 'Volumen excesivo que impide recuperar', 'Cardio que desplaza energía necesaria para la fuerza'],
          it: ['RIR 1–2 en series principales', 'Cardio mixto LISS + HIIT según gasto', 'Descarga programada si el RPE se dispara'] },
      },
    },
    {
      es: {
        n: { title: 'Reverse y mantenimiento', kcal: 'Reverse → Mantenimiento', macros: '40 / 35 / 25', freq: '4 comidas/día', water: '2,5–3 L/día',
          sum: 'Fase de salida: las calorías suben de forma gradual y controlada hasta el nuevo mantenimiento, evitando el rebote y consolidando el resultado. Es tan importante como el propio déficit.',
          po: 'Recuperar el equilibrio energético subiendo calorías de forma progresiva y estabilizar el peso en el nuevo mantenimiento.',
          so: ['Subir calorías 5–8 % por semana priorizando carbohidratos', 'Mantener la proteína alta durante toda la transición', 'Educar al cliente para sostener el resultado a largo plazo'],
          kpi: ['Peso estable dentro de ±1 % tras la subida', 'Adherencia al plan de reverse ≥ 90 %', 'Energía y rendimiento en recuperación al alza', 'Relación con la comida reportada como saludable'],
          sc: ['Peso estabilizado en el nuevo mantenimiento', 'Sin rebote significativo de grasa', 'Cliente autónomo con hábitos sostenibles'],
          notes: 'Comunica claramente que una ligera subida de peso por glucógeno y agua es esperable y no es grasa. El éxito de la fase es la estabilidad, no seguir bajando.',
          risk: ['Volver de golpe a calorías altas y provocar rebote', 'Ansiedad del cliente ante la subida de peso en báscula', 'Abandonar el registro demasiado pronto'] },
        t: { title: 'Mantenimiento y consolidación', focus: 'Fuerza general', vol: '12–14 series/grupo/sem', int: 'Moderada (RIR 2–3)', cardio: '2 sesiones LISS opcionales',
          sum: 'El entrenamiento vuelve a un volumen e intensidad sostenibles a largo plazo. Con más energía disponible es el momento de reconstruir fuerza y consolidar el hábito.',
          po: 'Recuperar y consolidar el rendimiento de fuerza aprovechando el aumento de calorías, dejando una rutina sostenible.',
          so: ['Reconstruir cargas en los básicos con el nuevo aporte energético', 'Reducir el cardio a un mínimo de mantenimiento', 'Fijar una rutina que el cliente pueda sostener solo'],
          kpi: ['Progresión de fuerza al recuperar calorías', 'Asistencia ≥ 85 % en fase de mantenimiento', 'Cardio reducido sin pérdida de composición', 'Rutina valorada como sostenible por el cliente'],
          sc: ['Fuerza en recuperación o por encima del inicio', 'Rutina estable que el cliente mantiene de forma autónoma', 'Composición corporal conservada'],
          notes: 'Aprovecha la ventana de más energía para batir marcas de fuerza: refuerza la adherencia del cliente y deja el programa listo para un nuevo ciclo si lo desea.',
          risk: ['Abandonar el entrenamiento al terminar el “objetivo”', 'Mantener un cardio innecesariamente alto', 'No planificar el siguiente bloque y perder el hábito'],
          it: ['RIR 2–3 en series principales', 'Volumen sostenible a largo plazo', 'Cardio reducido a mantenimiento'] },
      },
    },
  ],
  muscle_gain: [
    {
      es: {
        n: { title: 'Fundamentos del superávit', kcal: 'Superávit +5 %', macros: '30 / 50 / 20', freq: '4–5 comidas/día', water: '3 L/día',
          sum: 'Arranque del volumen: se establece un superávit ligero y limpio para iniciar la ganancia minimizando la acumulación de grasa. Se priorizan proteína y carbohidratos peri-entreno.',
          po: 'Establecer un superávit controlado de +5 % con 1,8–2,2 g/kg de proteína para iniciar la ganancia muscular sin exceso de grasa.',
          so: ['Distribuir la proteína en 4–5 tomas a lo largo del día', 'Concentrar carbohidratos alrededor del entrenamiento', 'Construir el hábito de comer con regularidad y suficiencia'],
          kpi: ['Ganancia de peso de 0,25–0,5 %/semana', 'Proteína ≥ 1,8 g/kg el 90 % de los días', 'Adherencia calórica ≥ 90 %', 'Carbohidratos peri-entreno cumplidos'],
          sc: ['Ganancia de peso lenta y controlada', 'Sin acumulación notable de grasa', 'Hábito de alimentación suficiente consolidado'],
          notes: 'Si el cliente “no consigue comer tanto”, prioriza densidad calórica (lácteos enteros, frutos secos, aceites) antes que volumen de comida. La ganancia debe ser lenta para que sea de calidad.',
          risk: ['Superávit excesivo con ganancia desproporcionada de grasa', 'Proteína insuficiente al subir carbohidratos', 'Saltarse comidas por falta de apetito'] },
        t: { title: 'Base de hipertrofia', focus: 'Hipertrofia full-body', vol: '12–14 series/grupo/sem', int: 'Moderada (RIR 2–3)', cardio: '1–2 sesiones LISS',
          sum: 'Fase de construcción técnica y de volumen tolerable. Se busca dominar los ejercicios y crear capacidad de trabajo antes de subir la exigencia.',
          po: 'Dominar la técnica de los ejercicios clave y establecer una base de volumen que se pueda progresar con seguridad.',
          so: ['Estandarizar la técnica de cada ejercicio principal', 'Registrar cargas y repeticiones de partida', 'Construir tolerancia al volumen de entrenamiento'],
          kpi: ['Técnica validada en todos los ejercicios principales', 'Asistencia ≥ 90 %', 'Progresión registrada semana a semana', 'Conexión mente-músculo reportada como buena'],
          sc: ['Técnica sólida en todos los patrones', 'Volumen base tolerado sin fatiga excesiva', 'Cargas de partida documentadas'],
          notes: 'No tengas prisa por subir cargas: una técnica impecable ahora multiplica los resultados de las fases siguientes. El cardio se mantiene al mínimo para no competir por recursos.',
          risk: ['Priorizar carga sobre técnica desde el inicio', 'Volumen inicial demasiado alto y fatiga temprana', 'Cardio excesivo que resta recuperación'],
          it: ['RIR 2–3 en series principales', 'Tempo controlado en la fase excéntrica', 'Conexión mente-músculo como prioridad'] },
      },
    },
    {
      es: {
        n: { title: 'Volumen', kcal: 'Superávit +10 %', macros: '30 / 50 / 20', freq: '5 comidas/día', water: '3–3,5 L/día',
          sum: 'Fase central de mayor ganancia: el superávit se amplía para soportar el aumento de volumen e intensidad del entrenamiento. La proteína y los carbohidratos peri-entreno son innegociables.',
          po: 'Sostener un superávit de +10 % que soporte la progresión de cargas y maximice la síntesis proteica.',
          so: ['Aumentar carbohidratos para soportar el volumen de entrenamiento', 'Mantener la proteína en 2,0–2,2 g/kg', 'Asegurar comidas pre y post entreno completas'],
          kpi: ['Ganancia de peso de 0,25–0,5 %/semana sostenida', 'Adherencia calórica ≥ 90 %', 'Energía de entrenamiento reportada como alta', 'Carbohidratos diarios objetivo cumplidos'],
          sc: ['Ganancia continua sin exceso de grasa', 'Entrenamientos con energía y buen rendimiento', 'Progresión de cargas soportada por la nutrición'],
          notes: 'Si la ganancia de peso se estanca dos semanas, sube calorías un 5 %. Vigila el porcentaje graso: si sube demasiado rápido, reduce el superávit en lugar de cortar la fase.',
          risk: ['Estancamiento por superávit insuficiente', 'Ganancia de grasa por superávit demasiado amplio', 'Carbohidratos insuficientes y caída de rendimiento'] },
        t: { title: 'Sobrecarga progresiva', focus: 'Hipertrofia por bloques', vol: '16–20 series/grupo/sem', int: 'Alta (RIR 1–2)', cardio: '1 sesión LISS opcional',
          sum: 'El motor de la ganancia: volumen e intensidad se incrementan de forma sistemática aplicando sobrecarga progresiva semana a semana sobre una técnica ya consolidada.',
          po: 'Aplicar sobrecarga progresiva sostenida —más carga, repeticiones o series— para maximizar el estímulo de hipertrofia.',
          so: ['Progresar carga o repeticiones en cada microciclo', 'Aumentar el volumen de forma gradual y tolerable', 'Llevar las series efectivas cerca del fallo con técnica'],
          kpi: ['Progresión semanal en al menos un parámetro por ejercicio', 'Volumen objetivo completado sin fallos de sesión', 'Asistencia ≥ 90 %', 'RIR real en el rango 1–2 en las series clave'],
          sc: ['Cargas y repeticiones en aumento sostenido', 'Volumen alto tolerado con buena recuperación', 'Sin estancamientos prolongados'],
          notes: 'La sobrecarga progresiva debe ser medible: si una semana no progresa nada, revisa sueño, nutrición y gestión de la fatiga antes de añadir más volumen.',
          risk: ['Estancamiento por falta de progresión planificada', 'Volumen por encima de la capacidad de recuperación', 'Pérdida de técnica al buscar el fallo'],
          it: ['RIR 1–2 en series efectivas', 'Sobrecarga progresiva documentada', 'Descarga cada 4–6 semanas según fatiga'] },
      },
    },
    {
      es: {
        n: { title: 'Intensificación', kcal: 'Superávit +8 %', macros: '32 / 48 / 20', freq: '5 comidas/día', water: '3,5 L/día',
          sum: 'El superávit se ajusta ligeramente a la baja para afinar la calidad de la ganancia mientras el entrenamiento entra en su fase más intensa. Nutrición peri-entreno máxima.',
          po: 'Afinar la composición de la ganancia con un superávit algo más conservador, manteniendo el combustible para el entrenamiento intenso.',
          so: ['Ajustar el superávit para limitar la ganancia de grasa', 'Maximizar la nutrición peri-entreno para soportar la intensidad', 'Mantener proteína alta para la recuperación'],
          kpi: ['Ganancia de peso de calidad ≤ 0,4 %/semana', 'Porcentaje graso controlado', 'Adherencia ≥ 90 %', 'Recuperación entre sesiones reportada como suficiente'],
          sc: ['Ganancia muscular con control del porcentaje graso', 'Energía suficiente para las sesiones intensas', 'Buena recuperación pese a la mayor exigencia'],
          notes: 'Aquí el objetivo cambia de “ganar todo lo posible” a “ganar lo mejor posible”. Si el porcentaje graso sube, prioriza calidad recortando el superávit, nunca la proteína.',
          risk: ['Mantener un superávit amplio cuando ya no es necesario', 'Recuperación insuficiente por el salto de intensidad', 'Descuidar la nutrición peri-entreno'] },
        t: { title: 'Pico de fuerza-hipertrofia', focus: 'Fuerza + hipertrofia', vol: '12–16 series/grupo/sem', int: 'Muy alta (RIR 0–1)', cardio: 'Mínimo',
          sum: 'El volumen baja para permitir intensidades máximas: trabajar en rangos de fuerza potencia las ganancias y consolida el músculo construido en el bloque de volumen.',
          po: 'Exponer al músculo a cargas máximas en rangos de fuerza para potenciar las ganancias del bloque de volumen.',
          so: ['Trabajar los básicos en rangos de 3–6 repeticiones', 'Reducir el volumen para sostener la intensidad', 'Gestionar la fatiga con descargas oportunas'],
          kpi: ['Récords de fuerza en los ejercicios principales', 'RIR 0–1 alcanzado con técnica intacta', 'Asistencia ≥ 90 %', 'Fatiga gestionada sin caídas de rendimiento'],
          sc: ['Marcas de fuerza superadas', 'Músculo del bloque anterior consolidado', 'Sin lesiones por la alta intensidad'],
          notes: 'La intensidad máxima exige respeto: calentamiento exhaustivo, técnica perfecta y descargas a tiempo. Una descarga oportuna rinde más que una semana forzada.',
          risk: ['Lesión por intensidad alta con técnica comprometida', 'Saltarse las descargas y acumular fatiga', 'Mantener volumen alto incompatible con la intensidad'],
          it: ['RIR 0–1 en series principales', 'Rangos de 3–6 repeticiones en básicos', 'Descarga programada al final del bloque'] },
      },
    },
    {
      es: {
        n: { title: 'Consolidación', kcal: 'Mantenimiento', macros: '30 / 45 / 25', freq: '4 comidas/día', water: '3 L/día',
          sum: 'Fase de cierre: las calorías vuelven a mantenimiento para estabilizar el peso ganado y permitir que el cuerpo asimile las adaptaciones. Prepara la transición al siguiente objetivo.',
          po: 'Estabilizar el peso y la composición logrados, consolidando los hábitos antes de un posible déficit de definición.',
          so: ['Llevar las calorías al nuevo mantenimiento de forma controlada', 'Mantener la proteína alta para conservar la masa', 'Decidir con el cliente el siguiente objetivo'],
          kpi: ['Peso estable dentro de ±1 %', 'Masa muscular conservada', 'Adherencia ≥ 85 %', 'Energía y digestión reportadas como buenas'],
          sc: ['Peso y composición estabilizados', 'Masa ganada conservada sin pérdidas', 'Plan claro para el siguiente ciclo'],
          notes: 'No encadenes volumen tras volumen indefinidamente. Esta fase permite valorar resultados con claridad y decidir si conviene una mini-definición antes de seguir ganando.',
          risk: ['Seguir en superávit sin necesidad y acumular grasa', 'Recortar proteína al bajar a mantenimiento', 'No planificar el siguiente bloque'] },
        t: { title: 'Mantenimiento de ganancias', focus: 'Hipertrofia general', vol: '10–12 series/grupo/sem', int: 'Moderada (RIR 2–3)', cardio: '1–2 sesiones LISS',
          sum: 'El entrenamiento baja a un volumen de mantenimiento que conserva el músculo construido con menos fatiga. Es una fase de consolidación, no de progresión agresiva.',
          po: 'Conservar la masa muscular y la fuerza ganadas con un volumen sostenible mientras el cuerpo se recupera del bloque intenso.',
          so: ['Mantener cargas con un volumen reducido de mantenimiento', 'Permitir la recuperación completa del sistema nervioso', 'Cerrar el ciclo dejando la rutina lista para el siguiente objetivo'],
          kpi: ['Cargas mantenidas con volumen reducido', 'Asistencia ≥ 85 %', 'Indicadores de fatiga normalizados', 'Cliente recuperado y motivado para el siguiente bloque'],
          sc: ['Músculo y fuerza conservados', 'Fatiga del bloque intenso disipada', 'Cliente listo para el siguiente ciclo'],
          notes: 'Un volumen de mantenimiento (la mitad del de progresión) basta para conservar las ganancias. Aprovecha para corregir descompensaciones y movilidad.',
          risk: ['Bajar tanto el estímulo que se pierda músculo', 'Prolongar el mantenimiento sin un objetivo nuevo', 'Descuidar la movilidad y las descompensaciones'],
          it: ['RIR 2–3 en series principales', 'Volumen de mantenimiento', 'Trabajo de movilidad y compensatorio'] },
      },
    },
  ],
  body_recomposition: [
    {
      es: {
        n: { title: 'Recalibración', kcal: 'Mantenimiento', macros: '40 / 35 / 25', freq: '4 comidas/día', water: '3 L/día',
          sum: 'La recomposición exige precisión: esta fase establece el mantenimiento real y una proteína alta, condiciones imprescindibles para ganar músculo y perder grasa a la vez.',
          po: 'Determinar el mantenimiento calórico real y fijar una proteína de 2,0–2,4 g/kg como base de toda la recomposición.',
          so: ['Validar el mantenimiento con la tendencia de peso de 2 semanas', 'Establecer una proteína muy alta y constante', 'Crear el hábito de un registro alimentario preciso'],
          kpi: ['Peso estable dentro de ±0,5 % en mantenimiento', 'Proteína ≥ 2,0 g/kg el 95 % de los días', 'Adherencia al registro ≥ 90 %', 'Calidad de alimentos elevada y constante'],
          sc: ['Mantenimiento real identificado con fiabilidad', 'Proteína alta consolidada como hábito', 'Registro alimentario preciso y sin fricción'],
          notes: 'La recomposición es lenta y poco visible en la báscula: explica desde el inicio que el progreso se medirá con foto, medidas y fuerza, no solo con el peso.',
          risk: ['Esperar cambios rápidos en la báscula', 'Proteína insuficiente que frena la ganancia muscular', 'Registro impreciso que invalida los ajustes'] },
        t: { title: 'Base de fuerza', focus: 'Fuerza full-body', vol: '12–14 series/grupo/sem', int: 'Moderada (RIR 2–3)', cardio: '2 sesiones LISS',
          sum: 'El estímulo de fuerza es el que dirige la recomposición: esta fase construye la técnica y la base de la que dependerá la ganancia muscular en déficit ligero.',
          po: 'Construir una base sólida de fuerza y técnica que permita progresar incluso en balance energético neutro o ligeramente negativo.',
          so: ['Consolidar la técnica de los patrones básicos', 'Documentar cargas de partida', 'Establecer una rutina sostenible de 3–4 sesiones'],
          kpi: ['Técnica validada en los patrones básicos', 'Asistencia ≥ 90 %', 'Progresión de cargas registrada', 'Recuperación adecuada entre sesiones'],
          sc: ['Base técnica sólida en todos los patrones', 'Rutina estable y sostenible', 'Cargas de partida documentadas'],
          notes: 'En recomposición el progreso de fuerza es la mejor señal de que se gana músculo, ya que la báscula apenas se mueve. Conviértelo en el KPI principal.',
          risk: ['Priorizar carga sobre técnica', 'Volumen inicial excesivo', 'No documentar cargas y perder la referencia de progreso'],
          it: ['RIR 2–3 en series principales', 'Técnica como prioridad', 'Progresión de fuerza como KPI central'] },
      },
    },
    {
      es: {
        n: { title: 'Recomposición — Bloque A', kcal: 'Cíclico ±10 %', macros: '42 / 33 / 25', freq: '4 comidas/día', water: '3 L/día',
          sum: 'Se introduce la nutrición cíclica: ligero superávit los días de entrenamiento y ligero déficit los de descanso. Esto orienta las calorías hacia el músculo y la pérdida de grasa.',
          po: 'Aplicar un reparto calórico cíclico que sitúe la energía en los días de entrenamiento y el déficit en los de descanso.',
          so: ['Concentrar carbohidratos en los días de entrenamiento', 'Reducir ligeramente las calorías los días de descanso', 'Mantener la proteína constante e independiente del día'],
          kpi: ['Peso estable o muy ligera bajada (≤ 0,25 %/sem)', 'Adherencia al esquema cíclico ≥ 90 %', 'Proteína ≥ 2,2 g/kg diaria', 'Medidas y fotos mostrando mejora de composición'],
          sc: ['Composición corporal mejorando con peso estable', 'Esquema cíclico aplicado con adherencia', 'Fuerza en progresión'],
          notes: 'El éxito aquí no es perder peso, es que la cintura baje y la fuerza suba con el peso casi igual. Mide cada 2 semanas con foto y perímetros.',
          risk: ['Confundir el reparto cíclico y descuadrar el balance semanal', 'Frustración por la falta de movimiento en la báscula', 'Proteína variable según el día'] },
        t: { title: 'Hipertrofia', focus: 'Hipertrofia split', vol: '14–18 series/grupo/sem', int: 'Alta (RIR 1–2)', cardio: '2 sesiones LISS',
          sum: 'El volumen sube para maximizar el estímulo de hipertrofia: con la nutrición cíclica orientada al músculo, este es el bloque que más ganancia aporta.',
          po: 'Maximizar el estímulo de hipertrofia con un volumen alto, aprovechando la energía de los días de entrenamiento.',
          so: ['Aumentar el volumen efectivo por grupo muscular', 'Progresar cargas en los días de superávit', 'Sostener el cardio de baja intensidad sin interferir'],
          kpi: ['Volumen objetivo completado por grupo muscular', 'Progresión de cargas en días de entrenamiento', 'Asistencia ≥ 90 %', 'Perímetros musculares en aumento'],
          sc: ['Ganancia muscular visible en medidas y fotos', 'Volumen alto bien tolerado', 'Fuerza en progresión sostenida'],
          notes: 'Aprovecha los días de mayor energía para las sesiones más demandantes y coloca los grupos débiles al inicio de la semana. El cardio se mantiene suave para no competir.',
          risk: ['Volumen superior a la capacidad de recuperación en balance ajustado', 'Cardio excesivo que interfiere con la hipertrofia', 'Mala distribución del volumen en la semana'],
          it: ['RIR 1–2 en series efectivas', 'Volumen alto progresivo', 'Sesiones duras en días de superávit'] },
      },
    },
    {
      es: {
        n: { title: 'Recomposición — Bloque B', kcal: 'Cíclico ±10 %', macros: '42 / 33 / 25', freq: '4–5 comidas/día', water: '3–3,5 L/día',
          sum: 'Se mantiene el esquema cíclico afinando los ajustes según la respuesta individual. La nutrición peri-entreno gana protagonismo al subir la intensidad.',
          po: 'Sostener la nutrición cíclica ajustándola a la respuesta real del cliente y reforzar la nutrición peri-entreno.',
          so: ['Ajustar la amplitud del ciclado según resultados', 'Reforzar las comidas pre y post entreno', 'Mantener la proteína muy alta para la recuperación'],
          kpi: ['Mejora continua de composición con peso estable', 'Adherencia ≥ 90 %', 'Proteína ≥ 2,2 g/kg', 'Fuerza en máximos del programa'],
          sc: ['Composición claramente mejorada respecto al inicio', 'Esquema cíclico afinado y eficaz', 'Fuerza en niveles máximos'],
          notes: 'Si tras 4 semanas la composición no mejora, el problema casi siempre es el balance semanal total: revísalo antes de tocar el reparto por días.',
          risk: ['No ajustar el plan a la respuesta individual', 'Nutrición peri-entreno insuficiente para la intensidad', 'Balance semanal real distinto del planificado'] },
        t: { title: 'Fuerza-hipertrofia', focus: 'Fuerza + hipertrofia', vol: '12–16 series/grupo/sem', int: 'Muy alta (RIR 0–2)', cardio: '2 sesiones LISS',
          sum: 'El bloque combina trabajo pesado de fuerza con hipertrofia para consolidar el músculo y elevar el rendimiento, cerrando la fase de mayor exigencia.',
          po: 'Combinar fuerza pesada e hipertrofia para consolidar la masa muscular y maximizar el rendimiento.',
          so: ['Incluir trabajo de fuerza pesada en los básicos', 'Mantener hipertrofia en los accesorios', 'Gestionar la fatiga con descargas planificadas'],
          kpi: ['Récords de fuerza en los ejercicios principales', 'Volumen de hipertrofia completado en accesorios', 'Asistencia ≥ 90 %', 'Fatiga controlada con las descargas'],
          sc: ['Fuerza máxima del programa alcanzada', 'Músculo consolidado y visible', 'Sin lesiones por la alta intensidad'],
          notes: 'Combina lo pesado al inicio de la sesión (sistema nervioso fresco) y la hipertrofia después. Respeta las descargas: son parte del progreso, no una pausa.',
          risk: ['Acumular fatiga al sumar fuerza pesada e hipertrofia', 'Saltarse las descargas', 'Perder técnica en las series pesadas'],
          it: ['RIR 0–1 en fuerza, RIR 1–2 en accesorios', 'Pesado primero, hipertrofia después', 'Descarga al final del bloque'] },
      },
    },
    {
      es: {
        n: { title: 'Consolidación', kcal: 'Mantenimiento', macros: '40 / 35 / 25', freq: '4 comidas/día', water: '3 L/día',
          sum: 'Cierre del proceso: las calorías se estabilizan en mantenimiento y se valora el resultado de la recomposición con todas las métricas. Se planifica el siguiente paso.',
          po: 'Estabilizar el mantenimiento y consolidar la nueva composición corporal, dejando hábitos sostenibles.',
          so: ['Fijar el mantenimiento estable post-recomposición', 'Mantener la proteína como hábito permanente', 'Valorar resultados y planificar el siguiente objetivo'],
          kpi: ['Peso y composición estables', 'Adherencia ≥ 85 %', 'Proteína alta mantenida como hábito', 'Cliente autónomo en su alimentación'],
          sc: ['Nueva composición consolidada y estable', 'Hábitos nutricionales sostenibles', 'Plan claro para el siguiente ciclo'],
          notes: 'Revisa con el cliente las fotos del inicio frente a las del final: en recomposición el cambio visual suele ser mucho mayor que el de la báscula.',
          risk: ['Abandonar los hábitos al terminar el programa', 'No valorar el resultado con métricas objetivas', 'Falta de un objetivo nuevo'] },
        t: { title: 'Mantenimiento', focus: 'Fuerza general', vol: '10–12 series/grupo/sem', int: 'Moderada (RIR 2–3)', cardio: '2 sesiones LISS',
          sum: 'El entrenamiento se asienta en un volumen sostenible que conserva los logros y permite recuperar del bloque intenso, dejando una rutina a largo plazo.',
          po: 'Conservar la fuerza y la masa logradas con una rutina sostenible y recuperar la fatiga acumulada.',
          so: ['Mantener cargas con un volumen sostenible', 'Permitir la recuperación completa', 'Dejar una rutina que el cliente sostenga de forma autónoma'],
          kpi: ['Cargas conservadas', 'Asistencia ≥ 85 %', 'Fatiga normalizada', 'Rutina valorada como sostenible'],
          sc: ['Logros de fuerza y composición conservados', 'Fatiga disipada', 'Rutina autónoma establecida'],
          notes: 'Deja documentado el progreso completo de fuerza: es la mejor herramienta de motivación y el punto de partida del siguiente ciclo.',
          risk: ['Perder el hábito al cerrar el programa', 'Volumen tan bajo que se pierdan logros', 'No planificar la continuidad'],
          it: ['RIR 2–3 en series principales', 'Volumen sostenible', 'Trabajo de movilidad'] },
      },
    },
  ],
  performance: [
    {
      es: {
        n: { title: 'Acumulación — soporte energético', kcal: 'Mantenimiento alto', macros: '25 / 55 / 20', freq: '4–5 comidas/día', water: '3–3,5 L/día',
          sum: 'La nutrición de rendimiento prioriza la disponibilidad de energía: en la fase de acumulación los carbohidratos son altos para soportar el volumen de trabajo y la recuperación.',
          po: 'Cubrir la alta demanda energética de la fase de acumulación garantizando glucógeno suficiente sesión a sesión.',
          so: ['Mantener los carbohidratos altos para el volumen de trabajo', 'Asegurar proteína para la recuperación tisular', 'Establecer protocolos de hidratación y electrolitos'],
          kpi: ['Energía de entrenamiento reportada como alta', 'Carbohidratos diarios objetivo cumplidos', 'Peso estable (sin déficit involuntario)', 'Recuperación entre sesiones adecuada'],
          sc: ['El cliente entrena con energía toda la semana', 'Sin signos de baja disponibilidad energética', 'Recuperación suficiente para el volumen'],
          notes: 'La baja disponibilidad energética es el error más común en deportistas: vigila que el peso no caiga de forma involuntaria con el volumen alto.',
          risk: ['Déficit energético involuntario por volumen alto', 'Carbohidratos insuficientes y caída de rendimiento', 'Hidratación y electrolitos descuidados'] },
        t: { title: 'Acumulación', focus: 'Volumen + capacidad de trabajo', vol: 'Alto — base general', int: 'Moderada (RIR 2–4)', cardio: 'Acondicionamiento aeróbico base',
          sum: 'Fase de construcción de base: se acumula volumen de trabajo general para desarrollar capacidad, resistencia y la base sobre la que se construirá la potencia.',
          po: 'Desarrollar una base amplia de capacidad de trabajo y resistencia que sostenga las fases de mayor intensidad.',
          so: ['Acumular volumen de entrenamiento de forma progresiva', 'Desarrollar la base aeróbica y la capacidad de trabajo', 'Reforzar puntos débiles y prevención de lesiones'],
          kpi: ['Volumen semanal completado según lo planificado', 'Mejora en tests de capacidad de trabajo', 'Asistencia ≥ 90 %', 'Tolerancia a la carga creciente'],
          sc: ['Base de capacidad de trabajo establecida', 'Volumen alto tolerado sin lesiones', 'Puntos débiles reforzados'],
          notes: 'En acumulación la intensidad es secundaria: la prioridad es el volumen tolerable y la prevención. Construye el motor antes de pisar el acelerador.',
          risk: ['Subir la intensidad demasiado pronto', 'Volumen que supera la capacidad de recuperación', 'Descuidar la prevención de lesiones'],
          it: ['RIR 2–4 en la mayoría del trabajo', 'Volumen progresivo semana a semana', 'Trabajo aeróbico de base'] },
      },
    },
    {
      es: {
        n: { title: 'Transformación — energía sostenida', kcal: 'Mantenimiento alto', macros: '25 / 55 / 20', freq: '5 comidas/día', water: '3,5 L/día',
          sum: 'Con el entrenamiento orientado a fuerza y potencia, la nutrición asegura la disponibilidad de carbohidratos para sesiones de alta calidad y una recuperación completa.',
          po: 'Garantizar energía y recuperación para sesiones de fuerza-potencia de alta calidad.',
          so: ['Concentrar carbohidratos alrededor de las sesiones clave', 'Optimizar la recuperación con proteína y micronutrientes', 'Ajustar la ingesta a los días de mayor o menor carga'],
          kpi: ['Calidad de las sesiones intensas mantenida', 'Recuperación entre sesiones óptima', 'Peso y energía estables', 'Hidratación dentro del protocolo'],
          sc: ['Sesiones de potencia ejecutadas con calidad', 'Recuperación completa entre estímulos', 'Sin caídas de energía'],
          notes: 'En esta fase la nutrición peri-entreno es decisiva: una sesión de potencia sin glucógeno es una sesión perdida. Periodiza los carbohidratos según la carga del día.',
          risk: ['Carbohidratos insuficientes en días de sesión clave', 'Recuperación incompleta entre sesiones intensas', 'No periodizar la ingesta según la carga'] },
        t: { title: 'Transformación', focus: 'Fuerza-potencia', vol: 'Medio — calidad sobre cantidad', int: 'Alta (RIR 1–3)', cardio: 'Acondicionamiento específico',
          sum: 'El volumen acumulado se transforma en fuerza y potencia: las sesiones priorizan la calidad y la intención de cada repetición sobre la cantidad de trabajo.',
          po: 'Convertir la base de capacidad en fuerza máxima y potencia aplicable al gesto deportivo.',
          so: ['Trabajar fuerza máxima en los patrones principales', 'Introducir trabajo de potencia y velocidad', 'Reducir el volumen para sostener la calidad'],
          kpi: ['Mejoras de fuerza máxima en los básicos', 'Velocidad de ejecución mantenida en potencia', 'Asistencia ≥ 90 %', 'Calidad técnica intacta bajo fatiga'],
          sc: ['Fuerza y potencia en clara progresión', 'Trabajo de calidad sin fatiga residual', 'Gesto deportivo más eficiente'],
          notes: 'La potencia exige frescura: programa el trabajo explosivo al inicio de la sesión y descarta repeticiones donde la velocidad caiga de forma evidente.',
          risk: ['Acumular fatiga que degrade la calidad de la potencia', 'Mantener un volumen incompatible con la intensidad', 'Trabajar potencia en estado de fatiga'],
          it: ['RIR 1–2 en fuerza máxima', 'Máxima velocidad intencional en potencia', 'Volumen reducido, calidad alta'] },
      },
    },
    {
      es: {
        n: { title: 'Realización — puesta a punto', kcal: 'Mantenimiento', macros: '25 / 55 / 20', freq: '4–5 comidas/día', water: '3,5 L/día',
          sum: 'Fase de afinamiento hacia el pico de rendimiento: la nutrición optimiza energía y recuperación, y prepara las estrategias de carga de carbohidratos para la competición.',
          po: 'Optimizar las reservas energéticas y la recuperación para llegar al pico de rendimiento en condiciones óptimas.',
          so: ['Mantener el glucógeno lleno con menos volumen de entrenamiento', 'Ensayar la estrategia nutricional de competición', 'Cuidar la recuperación y el descanso al máximo'],
          kpi: ['Sensación de frescura y energía al alza', 'Estrategia de competición ensayada y validada', 'Peso estable en el rango de competición', 'Recuperación percibida como completa'],
          sc: ['Cliente fresco y con energía máxima', 'Protocolo de competición probado sin sorpresas', 'Reservas energéticas optimizadas'],
          notes: 'Nunca estrenes nada el día de la competición: toda estrategia de carga, hidratación o suplementación debe haberse ensayado antes en entrenamiento.',
          risk: ['Probar estrategias nuevas el día de competición', 'Carga de carbohidratos mal ejecutada', 'Descuidar el descanso en la recta final'] },
        t: { title: 'Pico de rendimiento', focus: 'Potencia + técnica específica', vol: 'Bajo — afinamiento', int: 'Muy alta (RIR 0–2)', cardio: 'Específico, volumen reducido',
          sum: 'Las cargas se afinan: poco volumen y alta intensidad para expresar el rendimiento construido sin acumular fatiga. La técnica de competición es protagonista.',
          po: 'Expresar el máximo rendimiento reduciendo el volumen y manteniendo la intensidad, llegando fresco al pico.',
          so: ['Reducir el volumen para disipar la fatiga', 'Mantener la intensidad para conservar las adaptaciones', 'Pulir la técnica específica de competición'],
          kpi: ['Marcas de rendimiento en máximos', 'Fatiga residual mínima', 'Técnica de competición consolidada', 'Asistencia ≥ 90 % a las sesiones clave'],
          sc: ['Rendimiento expresado al máximo nivel', 'Cliente fresco, sin fatiga acumulada', 'Técnica específica dominada'],
          notes: 'El error clásico es entrenar de más en la recta final por nervios. Mantén la intensidad pero recorta volumen sin miedo: la forma ya está construida.',
          risk: ['Sobreentrenar por ansiedad en la recta final', 'Reducir la intensidad y perder adaptaciones', 'Llegar con fatiga residual al pico'],
          it: ['RIR 0–2 en sesiones clave', 'Volumen recortado, intensidad mantenida', 'Foco en técnica de competición'] },
      },
    },
    {
      es: {
        n: { title: 'Mantenimiento y recuperación', kcal: 'Mantenimiento', macros: '28 / 50 / 22', freq: '4 comidas/día', water: '3 L/día',
          sum: 'Tras el pico, la nutrición acompaña la recuperación del esfuerzo y mantiene una base sólida durante la transición o el descanso activo.',
          po: 'Favorecer la recuperación post-competición y sostener una base nutricional sólida en la transición.',
          so: ['Asegurar proteína y micronutrientes para la recuperación', 'Ajustar las calorías al menor volumen de entrenamiento', 'Mantener buenos hábitos durante el descanso activo'],
          kpi: ['Recuperación percibida como completa', 'Peso estable pese al menor volumen', 'Adherencia ≥ 85 %', 'Energía y ánimo restablecidos'],
          sc: ['Cliente recuperado del esfuerzo competitivo', 'Base nutricional mantenida', 'Buena disposición para el siguiente ciclo'],
          notes: 'Ajusta calorías a la baja al reducir el volumen para evitar una ganancia de grasa innecesaria, pero sin caer en un déficit que dificulte la recuperación.',
          risk: ['Mantener calorías de fase de carga con poco entrenamiento', 'Abandonar los hábitos en el descanso', 'Recuperación incompleta antes del siguiente ciclo'] },
        t: { title: 'Descarga y mantenimiento', focus: 'Recuperación + base general', vol: 'Bajo — descarga', int: 'Baja-moderada (RIR 3–5)', cardio: 'Aeróbico suave regenerativo',
          sum: 'Fase de descarga: el cuerpo asimila el ciclo competitivo con un trabajo ligero que mantiene el hábito y previene la pérdida de adaptaciones.',
          po: 'Disipar la fatiga del ciclo competitivo y mantener un nivel base de actividad y adaptaciones.',
          so: ['Reducir el volumen y la intensidad para recuperar', 'Mantener el hábito de entrenamiento con trabajo ligero', 'Atender movilidad y posibles molestias'],
          kpi: ['Indicadores de fatiga normalizados', 'Adherencia ≥ 80 % a un trabajo ligero', 'Movilidad y molestias resueltas', 'Motivación recuperada para el siguiente ciclo'],
          sc: ['Fatiga del ciclo completamente disipada', 'Adaptaciones base conservadas', 'Cliente listo y motivado para reiniciar'],
          notes: 'La descarga no es no hacer nada: un trabajo ligero regenerativo acelera la recuperación más que el reposo absoluto. Aprovecha para resolver molestias.',
          risk: ['Reposo absoluto que oxide al deportista', 'Volver al volumen alto sin descarga previa', 'Ignorar molestias arrastradas de la competición'],
          it: ['RIR 3–5 en todo el trabajo', 'Volumen e intensidad reducidos', 'Trabajo regenerativo y de movilidad'] },
      },
    },
  ],
  endurance_focus: [
    {
      es: {
        n: { title: 'Base aeróbica — soporte', kcal: 'Mantenimiento', macros: '20 / 60 / 20', freq: '4 comidas/día', water: '3 L/día + electrolitos',
          sum: 'La nutrición de resistencia gira en torno a los carbohidratos: en la fase de base se establece una ingesta que sostenga el volumen de rodaje y la hidratación.',
          po: 'Cubrir la demanda de carbohidratos del volumen base y consolidar protocolos de hidratación y electrolitos.',
          so: ['Asegurar carbohidratos suficientes para el volumen de rodaje', 'Establecer rutinas de hidratación y electrolitos', 'Mantener proteína para la recuperación muscular'],
          kpi: ['Energía estable en los rodajes', 'Carbohidratos diarios objetivo cumplidos', 'Hidratación según protocolo en cada sesión', 'Peso estable durante la fase'],
          sc: ['Rodajes completados con energía', 'Protocolo de hidratación interiorizado', 'Sin signos de baja disponibilidad energética'],
          notes: 'En corredores la baja disponibilidad energética es muy frecuente y silenciosa: vigila peso, energía y, en mujeres, la regularidad del ciclo.',
          risk: ['Baja disponibilidad energética por volumen creciente', 'Hidratación insuficiente en sesiones largas', 'Carbohidratos por debajo de la demanda'] },
        t: { title: 'Base aeróbica', focus: 'Volumen aeróbico de base', vol: 'Progresivo — rodajes suaves', int: 'Baja (Zona 2)', cardio: 'Eje del bloque',
          sum: 'Construcción del motor aeróbico: rodajes suaves y continuos que desarrollan la base de resistencia sobre la que se construirá todo el rendimiento.',
          po: 'Desarrollar una base aeróbica amplia con volumen progresivo de rodaje en zona 2.',
          so: ['Aumentar el volumen semanal de forma gradual (regla del 10 %)', 'Trabajar mayoritariamente en zona 2', 'Introducir fuerza preventiva para el corredor'],
          kpi: ['Volumen semanal incrementado de forma segura', 'Frecuencia cardíaca en zona 2 controlada', 'Mejora de la eficiencia (ritmo a igual FC)', 'Ausencia de molestias por impacto'],
          sc: ['Base aeróbica ampliada de forma sólida', 'Volumen tolerado sin lesiones', 'Eficiencia de carrera mejorada'],
          notes: 'La tentación de correr siempre rápido arruina la base: la mayoría del volumen debe ser cómodo. La fuerza preventiva reduce el riesgo de lesión por impacto.',
          risk: ['Subir el volumen más rápido que la regla del 10 %', 'Correr en zonas demasiado altas y no construir base', 'Lesiones por impacto sin fuerza preventiva'],
          it: ['Mayoría del volumen en zona 2', 'Incremento ≤ 10 % semanal', 'Fuerza preventiva 1–2 sesiones/sem'] },
      },
    },
    {
      es: {
        n: { title: 'Construcción — energía para la calidad', kcal: 'Mantenimiento alto', macros: '20 / 62 / 18', freq: '4–5 comidas/día', water: '3,5 L/día + electrolitos',
          sum: 'Al introducirse el trabajo de calidad (tempo y umbral), los carbohidratos suben para soportar sesiones más exigentes y se ensaya la alimentación intra-entreno.',
          po: 'Elevar la disponibilidad de carbohidratos para soportar las sesiones de calidad y empezar a ensayar la nutrición intra-sesión.',
          so: ['Aumentar los carbohidratos para tempo y series', 'Ensayar geles y bebidas en las tiradas largas', 'Optimizar la recuperación entre sesiones de calidad'],
          kpi: ['Sesiones de calidad completadas con energía', 'Estrategia intra-entreno ensayada', 'Recuperación entre sesiones adecuada', 'Tolerancia digestiva a la alimentación en carrera'],
          sc: ['Tempo y umbral ejecutados con buena energía', 'Nutrición intra-entreno tolerada', 'Recuperación suficiente entre sesiones'],
          notes: 'La tolerancia digestiva se entrena: empieza a probar geles y bebidas ahora, en sesiones largas, para que el día de la prueba el estómago no falle.',
          risk: ['Sesiones de calidad sin carbohidratos suficientes', 'Probar nutrición en carrera sin haberla ensayado', 'Recuperación insuficiente entre sesiones duras'] },
        t: { title: 'Tempo y umbral', focus: 'Umbral y ritmo objetivo', vol: 'Alto — con trabajo de calidad', int: 'Moderada-alta (Zona 3–4)', cardio: 'Eje del bloque',
          sum: 'Se introduce el trabajo de calidad: tempo y umbral elevan la velocidad sostenible mientras el volumen base se mantiene alto.',
          po: 'Elevar el umbral y consolidar el ritmo objetivo combinando volumen base con trabajo de calidad.',
          so: ['Introducir sesiones de tempo y umbral semanales', 'Mantener el volumen base de rodaje suave', 'Trabajar el ritmo objetivo de la prueba'],
          kpi: ['Mejora del ritmo a umbral', 'Ritmo objetivo sostenible durante más tiempo', 'Volumen base mantenido junto a la calidad', 'Recuperación adecuada tras las sesiones duras'],
          sc: ['Umbral claramente mejorado', 'Ritmo objetivo cada vez más cómodo', 'Equilibrio entre volumen y calidad'],
          notes: 'Respeta la regla 80/20: el trabajo de calidad rinde solo si la mayor parte del volumen sigue siendo suave. Dos sesiones de calidad por semana suelen ser suficientes.',
          risk: ['Demasiadas sesiones de calidad y fatiga acumulada', 'Sacrificar el volumen base por la intensidad', 'Ritmos de calidad mal calibrados'],
          it: ['Tempo en zona 3, series en zona 4', 'Regla 80/20 volumen/calidad', 'Ritmo objetivo en sesiones específicas'] },
      },
    },
    {
      es: {
        n: { title: 'Específico — carga de competición', kcal: 'Mantenimiento alto', macros: '18 / 64 / 18', freq: '5 comidas/día', water: '3,5 L/día + electrolitos',
          sum: 'En la fase específica la nutrición se centra en maximizar el glucógeno para las sesiones clave y en consolidar la estrategia de avituallamiento de la prueba.',
          po: 'Maximizar las reservas de glucógeno para las sesiones específicas y validar definitivamente la estrategia de carrera.',
          so: ['Asegurar glucógeno lleno en las sesiones clave', 'Fijar la estrategia de avituallamiento (qué, cuánto, cuándo)', 'Cuidar la recuperación al máximo entre sesiones específicas'],
          kpi: ['Sesiones específicas con energía máxima', 'Estrategia de avituallamiento definida y validada', 'Recuperación completa entre sesiones clave', 'Sin problemas digestivos en carrera'],
          sc: ['Sesiones específicas completadas a ritmo objetivo', 'Plan de avituallamiento cerrado', 'Tolerancia digestiva confirmada'],
          notes: 'Deja por escrito el plan de avituallamiento de la prueba: kilómetro, producto y cantidad. La nutrición de carrera improvisada es la causa nº 1 de abandono.',
          risk: ['Sesiones clave sin glucógeno suficiente', 'Estrategia de avituallamiento sin cerrar', 'Problemas digestivos no resueltos'] },
        t: { title: 'Trabajo específico', focus: 'Series y ritmo de competición', vol: 'Medio-alto — específico', int: 'Alta (Zona 4–5)', cardio: 'Eje del bloque',
          sum: 'Las sesiones replican las demandas de la prueba: series e intervalos a ritmo de competición que ajustan al cliente al esfuerzo real del día clave.',
          po: 'Adaptar al cliente a las demandas específicas de la prueba con sesiones a ritmo de competición.',
          so: ['Realizar series e intervalos al ritmo objetivo', 'Simular las condiciones de la prueba (terreno, ritmo)', 'Afinar la gestión del ritmo y el esfuerzo'],
          kpi: ['Series completadas al ritmo objetivo', 'Sensación de control del ritmo de competición', 'Asistencia ≥ 90 % a las sesiones clave', 'Recuperación adecuada pese a la intensidad'],
          sc: ['Ritmo de competición dominado y sostenible', 'Sesiones específicas superadas con control', 'Cliente preparado para las demandas de la prueba'],
          notes: 'Simula la prueba lo máximo posible: misma hora, terreno parecido y la nutrición que usarás. La confianza nace de haberlo ensayado.',
          risk: ['Intensidad específica sin base suficiente', 'No simular las condiciones reales de la prueba', 'Acumular fatiga que llegue hasta el tapering'],
          it: ['Series en zona 4–5', 'Ritmo de competición en sesiones específicas', 'Simulación de las condiciones de la prueba'] },
      },
    },
    {
      es: {
        n: { title: 'Tapering — carga de carbohidratos', kcal: 'Carga de carbohidratos', macros: '15 / 70 / 15', freq: '5–6 comidas/día', water: '3,5 L/día + electrolitos',
          sum: 'Recta final: se reduce el volumen y se ejecuta la carga de carbohidratos para llegar a la prueba con los depósitos de glucógeno llenos y el peso justo.',
          po: 'Llenar al máximo las reservas de glucógeno mediante la carga de carbohidratos y llegar a la prueba en condiciones óptimas.',
          so: ['Ejecutar el protocolo de carga de carbohidratos 2–3 días antes', 'Mantener la hidratación y los electrolitos', 'Elegir alimentos conocidos y de fácil digestión'],
          kpi: ['Carga de carbohidratos ejecutada según protocolo', 'Peso ligeramente al alza por glucógeno y agua (esperado)', 'Sin molestias digestivas en los días previos', 'Energía y frescura percibidas como máximas'],
          sc: ['Depósitos de glucógeno llenos para la prueba', 'Cliente llega fresco y sin problemas digestivos', 'Estrategia nutricional totalmente cerrada'],
          notes: 'Avisa al cliente de que ganará 1–2 kg de agua y glucógeno con la carga: es lo esperado y es combustible, no grasa. Nada nuevo en el plato estos días.',
          risk: ['Carga de carbohidratos mal ejecutada o tardía', 'Probar alimentos nuevos en la recta final', 'Ansiedad por el aumento de peso de la carga'] },
        t: { title: 'Afinamiento (tapering)', focus: 'Reducción de volumen, frescura', vol: 'Bajo — taper progresivo', int: 'Mantenida en sesiones cortas', cardio: 'Eje del bloque, muy reducido',
          sum: 'El volumen se reduce de forma marcada manteniendo algo de intensidad en sesiones cortas: así se disipa la fatiga sin perder la forma construida.',
          po: 'Disipar la fatiga acumulada reduciendo el volumen y llegar a la prueba con frescura y la forma intacta.',
          so: ['Reducir el volumen un 40–60 % de forma progresiva', 'Mantener toques de intensidad en sesiones cortas', 'Priorizar el descanso y el sueño'],
          kpi: ['Volumen reducido según el plan de taper', 'Sensación de frescura y “piernas ligeras”', 'Intensidad conservada en sesiones cortas', 'Descanso y sueño optimizados'],
          sc: ['Fatiga disipada por completo', 'Forma física conservada pese al menor volumen', 'Cliente llega fresco y confiado a la prueba'],
          notes: 'El tapering pone nerviosos a los corredores: explícales que la sensación de “hacer poco” es buena señal. La forma ya está hecha; ahora solo se descansa.',
          risk: ['Entrenar de más por ansiedad y llegar fatigado', 'Eliminar toda la intensidad y perder afilado', 'Descuidar el descanso en la recta final'],
          it: ['Volumen −40–60 % progresivo', 'Toques de intensidad en sesiones cortas', 'Descanso y sueño como prioridad'] },
      },
    },
  ],
  health: [
    {
      es: {
        n: { title: 'Activación de hábitos', kcal: 'Mantenimiento', macros: '30 / 45 / 25', freq: '3–4 comidas/día', water: '2–2,5 L/día',
          sum: 'El punto de partida hacia una vida más sana: se ordenan las comidas y se mejora la calidad de la dieta sin restricciones agresivas. La prioridad es la consistencia.',
          po: 'Ordenar los horarios de comida y mejorar la calidad de la alimentación construyendo hábitos sostenibles.',
          so: ['Establecer un patrón regular de comidas', 'Aumentar el consumo de verdura, fruta y proteína', 'Reducir ultraprocesados y bebidas azucaradas de forma gradual'],
          kpi: ['Comidas regulares el 90 % de los días', 'Ración de verdura/fruta en cada comida principal', 'Reducción medible de ultraprocesados', 'Hidratación diaria en el objetivo'],
          sc: ['Patrón de comidas estable y sostenible', 'Mejora clara de la calidad de la dieta', 'Hábitos básicos de hidratación instaurados'],
          notes: 'No impongas un plan rígido: en salud el éxito es la sostenibilidad. Cambia un hábito cada vez y refuerza los logros para mantener la motivación.',
          risk: ['Imponer una dieta demasiado restrictiva y poco sostenible', 'Cambiar demasiados hábitos a la vez', 'Centrar todo en el peso y no en la salud'] },
        t: { title: 'Activación', focus: 'Movilidad + fuerza básica', vol: 'Bajo — sesiones cortas', int: 'Baja (RIR 4–5)', cardio: 'Caminar diario + 1 sesión suave',
          sum: 'El objetivo es crear el hábito de moverse: sesiones cortas y asequibles que generan adherencia sin intimidar ni provocar agujetas excesivas.',
          po: 'Instaurar el hábito de la actividad física con sesiones cortas, seguras y motivadoras.',
          so: ['Establecer 2–3 sesiones cortas semanales', 'Alcanzar un objetivo diario de pasos', 'Mejorar la movilidad y reducir molestias del día a día'],
          kpi: ['Asistencia ≥ 80 % a las sesiones', 'Objetivo de pasos diario cumplido', 'Mejora subjetiva de energía y movilidad', 'Ausencia de molestias tras entrenar'],
          sc: ['Hábito de movimiento instaurado', 'Pasos diarios en el objetivo', 'Más energía y menos molestias reportadas'],
          notes: 'La barrera aquí es psicológica, no física: sesiones cortas y logrables generan más adherencia que entrenamientos ambiciosos que el cliente abandona.',
          risk: ['Sesiones demasiado largas o duras que generen rechazo', 'Agujetas excesivas que desmotiven', 'Plantear objetivos poco realistas'],
          it: ['RIR 4–5, lejos del fallo', 'Sesiones cortas y asequibles', 'Pasos diarios como base'] },
      },
    },
    {
      es: {
        n: { title: 'Progresión', kcal: 'Mantenimiento', macros: '30 / 45 / 25', freq: '4 comidas/día', water: '2,5 L/día',
          sum: 'Sobre los hábitos ya instaurados se afinan las porciones y la composición de las comidas según el objetivo concreto del cliente (peso, energía, salud).',
          po: 'Afinar las porciones y la composición de las comidas para alinearlas con el objetivo personal del cliente.',
          so: ['Ajustar raciones según el objetivo (mantener, perder, mejorar energía)', 'Mejorar el equilibrio de macros en cada comida', 'Trabajar la autonomía del cliente en sus elecciones'],
          kpi: ['Raciones ajustadas al objetivo de forma consistente', 'Comidas equilibradas el 90 % de los días', 'Progreso hacia el objetivo personal', 'El cliente decide bien sin supervisión constante'],
          sc: ['Alimentación alineada con el objetivo personal', 'Mayor autonomía en las decisiones del día a día', 'Progreso visible hacia la meta'],
          notes: 'Empieza a transferir la decisión al cliente: enséñale a elegir, no solo a seguir. La autonomía es lo que hace que el resultado dure.',
          risk: ['Mantener al cliente dependiente del plan', 'Ajustes demasiado bruscos de raciones', 'Perder de vista el objetivo personal real'] },
        t: { title: 'Progresión', focus: 'Fuerza funcional', vol: 'Moderado', int: 'Moderada (RIR 3–4)', cardio: '2 sesiones moderadas',
          sum: 'Con el hábito consolidado, se sube la carga y la variedad de ejercicios: el cuerpo está listo para un estímulo mayor que siga generando mejoras.',
          po: 'Aumentar la carga, la variedad y la calidad del entrenamiento sobre una base de hábito ya consolidada.',
          so: ['Introducir progresión de cargas en los ejercicios base', 'Ampliar la variedad de patrones de movimiento', 'Aumentar de forma moderada el volumen y la intensidad'],
          kpi: ['Progresión de cargas registrada', 'Asistencia ≥ 85 %', 'Mejora en fuerza y capacidad funcional', 'Buena tolerancia al aumento de carga'],
          sc: ['Fuerza funcional en clara mejora', 'Variedad de ejercicios dominada', 'Carga progresada sin molestias'],
          notes: 'Aquí el cliente empieza a verse capaz: usa los progresos de fuerza como refuerzo positivo para consolidar definitivamente la adherencia.',
          risk: ['Subir la carga más rápido que la adaptación', 'Demasiada variedad que impida progresar en nada', 'Olvidar el componente de movilidad'],
          it: ['RIR 3–4 en series principales', 'Progresión de carga gradual', 'Variedad de patrones funcionales'] },
      },
    },
    {
      es: {
        n: { title: 'Consolidación', kcal: 'Mantenimiento', macros: '30 / 45 / 25', freq: '4 comidas/día', water: '2,5 L/día',
          sum: 'Se consolida una forma de comer sostenible y flexible que el cliente pueda mantener sin supervisión, integrando la vida social y los imprevistos.',
          po: 'Consolidar una alimentación flexible y sostenible que el cliente mantenga de forma autónoma.',
          so: ['Integrar comidas sociales y flexibilidad sin culpa', 'Reforzar las estrategias para imprevistos y viajes', 'Confirmar la autonomía total del cliente'],
          kpi: ['El cliente gestiona comidas sociales sin descarrilar', 'Adherencia ≥ 85 % sin supervisión estrecha', 'Estrategias para imprevistos aplicadas con éxito', 'Relación sana con la comida reportada'],
          sc: ['Alimentación flexible y sostenible consolidada', 'Cliente autónomo ante cualquier contexto', 'Relación con la comida saludable'],
          notes: 'El indicador de éxito no es un plato perfecto, es que el cliente sepa volver al buen camino tras un desvío sin culpa ni efecto rebote.',
          risk: ['Rigidez que no resista la vida social', 'Sensación de culpa ante cualquier desvío', 'Dependencia residual del coach'] },
        t: { title: 'Consolidación', focus: 'Fuerza + movilidad', vol: 'Moderado', int: 'Moderada (RIR 3–4)', cardio: '2 sesiones moderadas',
          sum: 'El entrenamiento se asienta en una rutina equilibrada de fuerza y movilidad que el cliente pueda sostener de forma indefinida con buenos resultados.',
          po: 'Consolidar una rutina equilibrada y sostenible que mantenga fuerza, movilidad y energía a largo plazo.',
          so: ['Equilibrar fuerza, movilidad y trabajo cardiovascular', 'Asegurar que la rutina encaja en la vida del cliente', 'Fomentar la autonomía en la ejecución'],
          kpi: ['Rutina sostenida con autonomía', 'Asistencia ≥ 85 %', 'Fuerza y movilidad estables o en mejora', 'Energía diaria reportada como alta'],
          sc: ['Rutina equilibrada y sostenible consolidada', 'Cliente autónomo y constante', 'Buen nivel de fuerza, movilidad y energía'],
          notes: 'Asegúrate de que la rutina es realista para la agenda del cliente: una rutina perfecta que no cabe en su semana no sirve de nada.',
          risk: ['Rutina poco realista para la agenda del cliente', 'Descuidar la movilidad por centrarse en la fuerza', 'Falta de variedad que reduzca la adherencia'],
          it: ['RIR 3–4 en series principales', 'Equilibrio fuerza/movilidad/cardio', 'Rutina adaptada a la vida real'] },
      },
    },
    {
      es: {
        n: { title: 'Mantenimiento de por vida', kcal: 'Mantenimiento', macros: '30 / 45 / 25', freq: '4 comidas/día', water: '2,5 L/día',
          sum: 'Fase final: la alimentación saludable ya es un estilo de vida. El rol del coach pasa a ser de seguimiento ligero y refuerzo puntual.',
          po: 'Mantener de forma indefinida los hábitos alimentarios saludables ya consolidados.',
          so: ['Sostener los hábitos sin supervisión estrecha', 'Realizar revisiones periódicas de seguimiento', 'Adaptar la alimentación a las distintas etapas de la vida'],
          kpi: ['Hábitos mantenidos de forma autónoma', 'Revisiones de seguimiento sin desvíos relevantes', 'Salud y energía estables en el tiempo', 'Satisfacción del cliente con su estilo de vida'],
          sc: ['Alimentación saludable convertida en estilo de vida', 'Cliente totalmente autónomo', 'Resultados de salud mantenidos en el tiempo'],
          notes: 'Programa revisiones espaciadas (cada 1–3 meses) más como apoyo y rendición de cuentas que como control. El éxito es que ya no te necesite a diario.',
          risk: ['Relajación progresiva de los hábitos sin seguimiento', 'No adaptar la alimentación a nuevas etapas vitales', 'Pérdida de motivación al no haber un objetivo nuevo'] },
        t: { title: 'Mantenimiento', focus: 'Actividad sostenible', vol: 'Moderado sostenible', int: 'Moderada (RIR 3–4)', cardio: 'Actividad regular variada',
          sum: 'La actividad física es ya un hábito de vida. El programa se mantiene con variedad suficiente para sostener la motivación a largo plazo.',
          po: 'Sostener de forma indefinida un nivel de actividad física saludable y motivador.',
          so: ['Mantener la regularidad del entrenamiento', 'Aportar variedad para sostener la motivación', 'Fijar pequeños retos que mantengan el interés'],
          kpi: ['Regularidad de entrenamiento mantenida', 'Variedad suficiente reportada como motivadora', 'Condición física estable o en mejora', 'Adherencia ≥ 80 % a largo plazo'],
          sc: ['Actividad física consolidada como hábito de vida', 'Motivación sostenida en el tiempo', 'Condición física saludable mantenida'],
          notes: 'La variedad y los pequeños retos son la clave de la adherencia a largo plazo. Renueva el programa periódicamente para que no se vuelva monótono.',
          risk: ['Monotonía que erosione la motivación', 'Ausencia de nuevos retos u objetivos', 'Abandono ante un cambio de rutina vital'],
          it: ['RIR 3–4 en series principales', 'Variedad para sostener la motivación', 'Pequeños retos periódicos'] },
      },
    },
  ],
  metabolic_reset: [
    {
      es: {
        n: { title: 'Reverse inicial', kcal: 'Reverse +5 %/semana', macros: '35 / 40 / 25', freq: '4 comidas/día', water: '3 L/día',
          sum: 'El reset metabólico comienza subiendo las calorías de forma gradual desde un déficit prolongado, para recuperar el metabolismo sin disparar la ganancia de grasa.',
          po: 'Subir las calorías de forma progresiva (≈5 %/semana) saliendo del déficit y reactivando el metabolismo.',
          so: ['Incrementar calorías de forma controlada, sobre todo carbohidratos', 'Mantener la proteína alta durante la subida', 'Educar al cliente sobre por qué el reverse es necesario'],
          kpi: ['Calorías subidas según el plan semanal', 'Peso estable o muy ligera subida (esperada)', 'Energía, sueño y estado de ánimo en mejora', 'Adherencia al protocolo de reverse ≥ 90 %'],
          sc: ['Calorías incrementadas sin ganancia brusca de grasa', 'Marcadores de bienestar (energía, sueño) al alza', 'Cliente comprende y acepta el proceso'],
          notes: 'El reverse exige gestionar la mentalidad: el cliente viene de “comer poco = bien”. Explica que recuperar el metabolismo es lo que hará posible el siguiente objetivo.',
          risk: ['Miedo del cliente a subir calorías y ganar peso', 'Subir las calorías demasiado rápido', 'Recortar proteína al aumentar carbohidratos'] },
        t: { title: 'Reactivación', focus: 'Fuerza full-body', vol: '10–12 series/grupo/sem', int: 'Moderada (RIR 2–4)', cardio: 'Reducido — solo 1–2 LISS',
          sum: 'El entrenamiento de fuerza da un destino a las calorías que entran: con más energía disponible, el cuerpo prioriza reconstruir músculo y rendimiento.',
          po: 'Reactivar el entrenamiento de fuerza para dirigir las calorías recuperadas hacia el músculo.',
          so: ['Retomar el trabajo de fuerza con cargas moderadas', 'Reducir el cardio excesivo arrastrado del déficit', 'Aprovechar la energía extra para progresar'],
          kpi: ['Progresión de fuerza al recuperar calorías', 'Asistencia ≥ 90 %', 'Cardio reducido a un mínimo razonable', 'Recuperación entre sesiones en mejora'],
          sc: ['Fuerza en progresión con el aumento de calorías', 'Cardio excesivo recortado', 'Mejor recuperación reportada'],
          notes: 'Muchos clientes en reset arrastran un exceso de cardio del déficit: recórtalo. El estímulo de fuerza es el que aprovecha las calorías que ahora sí entran.',
          risk: ['Mantener un cardio excesivo que frene la recuperación', 'No aprovechar la energía extra para progresar', 'Volumen demasiado alto al reiniciar'],
          it: ['RIR 2–4 en series principales', 'Cardio reducido al mínimo', 'Progresión aprovechando la energía extra'] },
      },
    },
    {
      es: {
        n: { title: 'Estabilización', kcal: 'Mantenimiento recuperado', macros: '32 / 43 / 25', freq: '4 comidas/día', water: '3 L/día',
          sum: 'Las calorías se estabilizan en el nuevo mantenimiento, más alto que el de partida. Es el objetivo central del reset: comer más manteniendo la composición.',
          po: 'Estabilizar la ingesta en el nuevo mantenimiento metabólico, más alto y sostenible que el inicial.',
          so: ['Mantener las calorías en el nuevo mantenimiento', 'Confirmar la estabilidad del peso varias semanas', 'Consolidar una relación sana y flexible con la comida'],
          kpi: ['Peso estable en el nuevo mantenimiento (±1 %)', 'Calorías de mantenimiento notablemente más altas que al inicio', 'Energía y rendimiento estabilizados al alza', 'Adherencia ≥ 90 %'],
          sc: ['Nuevo mantenimiento más alto confirmado y estable', 'Peso y composición controlados', 'Relación con la comida más libre'],
          notes: 'Aquí se demuestra el éxito del reset: el cliente come bastante más que al empezar y su peso es estable. Documéntalo para reforzar la confianza.',
          risk: ['Volver a recortar calorías “por costumbre”', 'Inseguridad del cliente con la ingesta más alta', 'No confirmar la estabilidad antes de avanzar'] },
        t: { title: 'Estabilización', focus: 'Fuerza general', vol: '12–14 series/grupo/sem', int: 'Moderada (RIR 2–3)', cardio: '1–2 sesiones LISS',
          sum: 'El entrenamiento consolida la fuerza aprovechando el nuevo aporte energético estable, construyendo sobre la reactivación de la fase anterior.',
          po: 'Consolidar la fuerza y la capacidad de trabajo con el respaldo del nuevo mantenimiento energético.',
          so: ['Progresar cargas con la energía ya estabilizada', 'Aumentar de forma moderada el volumen de entrenamiento', 'Consolidar una rutina sostenible'],
          kpi: ['Progresión de fuerza sostenida', 'Asistencia ≥ 90 %', 'Volumen aumentado y bien tolerado', 'Recuperación reportada como completa'],
          sc: ['Fuerza consolidada y en progresión', 'Volumen de entrenamiento ampliado con éxito', 'Rutina estable y sostenible'],
          notes: 'Con el metabolismo recuperado, el rendimiento debería mejorar de forma clara: úsalo como prueba tangible de que comer más fue la decisión correcta.',
          risk: ['No aprovechar la energía estable para progresar', 'Volumen excesivo demasiado pronto', 'Descuidar la recuperación'],
          it: ['RIR 2–3 en series principales', 'Progresión sostenida de cargas', 'Volumen moderado en aumento'] },
      },
    },
    {
      es: {
        n: { title: 'Consolidación', kcal: 'Mantenimiento recuperado', macros: '32 / 43 / 25', freq: '4 comidas/día', water: '3 L/día',
          sum: 'Se consolida el mantenimiento recuperado y se prepara al cliente para su siguiente objetivo, ahora desde una base metabólica mucho más alta y saludable.',
          po: 'Consolidar de forma definitiva el mantenimiento recuperado y preparar el siguiente objetivo.',
          so: ['Sostener el mantenimiento alto de forma estable', 'Reforzar la flexibilidad y la autonomía alimentaria', 'Decidir con el cliente el siguiente paso (recomposición, ganancia…)'],
          kpi: ['Mantenimiento alto sostenido con estabilidad', 'Adherencia ≥ 88 %', 'Marcadores de bienestar consolidados', 'Plan claro para el siguiente objetivo'],
          sc: ['Mantenimiento recuperado totalmente consolidado', 'Cliente autónomo y con buena relación con la comida', 'Siguiente objetivo definido'],
          notes: 'El reset es el medio, no el fin: ahora el cliente puede afrontar un déficit o un superávit desde una base mucho más alta, con más margen y mejor respuesta.',
          risk: ['Quedarse en el reset sin un objetivo posterior', 'Recaída en patrones restrictivos', 'No planificar la siguiente fase'] },
        t: { title: 'Consolidación', focus: 'Fuerza general', vol: '12–14 series/grupo/sem', int: 'Moderada-alta (RIR 1–3)', cardio: '1–2 sesiones LISS',
          sum: 'El entrenamiento mantiene una progresión sólida que aprovecha por completo el metabolismo recuperado, dejando al cliente listo para el siguiente ciclo.',
          po: 'Sostener una progresión de fuerza sólida que deje al cliente preparado para su siguiente objetivo.',
          so: ['Mantener la progresión de cargas', 'Consolidar la capacidad de trabajo recuperada', 'Dejar la rutina lista para el siguiente bloque'],
          kpi: ['Fuerza en niveles máximos del programa', 'Asistencia ≥ 88 %', 'Capacidad de trabajo plenamente recuperada', 'Cliente preparado para el siguiente ciclo'],
          sc: ['Fuerza y capacidad de trabajo en su mejor nivel', 'Rutina lista para el siguiente objetivo', 'Cliente motivado para continuar'],
          notes: 'Cierra el ciclo documentando la mejora completa: más comida, más fuerza y peso estable es la prueba de un reset bien ejecutado.',
          risk: ['Cerrar el proceso sin continuidad planificada', 'Perder la progresión por falta de objetivo', 'Descuidar la recuperación al final del ciclo'],
          it: ['RIR 1–3 en series principales', 'Progresión sostenida', 'Rutina lista para el siguiente bloque'] },
      },
    },
    {
      es: {
        n: { title: 'Mantenimiento a largo plazo', kcal: 'Mantenimiento recuperado', macros: '30 / 45 / 25', freq: '4 comidas/día', water: '3 L/día',
          sum: 'Fase de cierre: el metabolismo recuperado se mantiene de forma indefinida y el cliente conserva una relación flexible y sin restricciones con la comida.',
          po: 'Sostener de forma indefinida el metabolismo recuperado y una alimentación flexible y saludable.',
          so: ['Mantener el mantenimiento recuperado sin recaídas', 'Sostener una relación libre y flexible con la comida', 'Realizar revisiones de seguimiento periódicas'],
          kpi: ['Mantenimiento recuperado sostenido en el tiempo', 'Sin recaídas en patrones restrictivos', 'Bienestar y energía estables', 'Adherencia ≥ 85 % a largo plazo'],
          sc: ['Metabolismo recuperado mantenido de forma estable', 'Relación sana y flexible con la comida consolidada', 'Cliente autónomo a largo plazo'],
          notes: 'El mayor riesgo a largo plazo es recaer en la restricción. Refuerza con el cliente que su mantenimiento alto es su nueva normalidad y su mayor logro.',
          risk: ['Recaída en la restricción calórica', 'Abandono del seguimiento', 'Pérdida de motivación sin un objetivo nuevo'] },
        t: { title: 'Mantenimiento', focus: 'Fuerza sostenible', vol: '10–12 series/grupo/sem', int: 'Moderada (RIR 2–3)', cardio: '1–2 sesiones LISS',
          sum: 'El entrenamiento se asienta en una rutina sostenible que conserva la fuerza y la capacidad de trabajo recuperadas durante el reset.',
          po: 'Conservar de forma indefinida la fuerza y la capacidad de trabajo recuperadas con una rutina sostenible.',
          so: ['Mantener una rutina de fuerza sostenible', 'Conservar la capacidad de trabajo recuperada', 'Aportar variedad para sostener la adherencia'],
          kpi: ['Fuerza y capacidad conservadas', 'Asistencia ≥ 80 % a largo plazo', 'Rutina valorada como sostenible', 'Motivación mantenida'],
          sc: ['Fuerza y capacidad de trabajo conservadas', 'Rutina sostenible consolidada', 'Cliente constante y motivado'],
          notes: 'Mantén el programa vivo con variedad y pequeños retos: la constancia a largo plazo es lo que protege todo lo conseguido con el reset.',
          risk: ['Pérdida de constancia sin objetivo nuevo', 'Monotonía del programa', 'Abandono ante cambios en la rutina vital'],
          it: ['RIR 2–3 en series principales', 'Rutina sostenible a largo plazo', 'Variedad y pequeños retos'] },
      },
    },
  ],
};

// English content library (one phase set per goal) lives in a sibling file.
import { EN_LIB } from './seed_planning_roadmaps_en.mjs';

function strat(src, type) {
  const base = {
    summary: src.sum, primaryObjective: src.po,
    secondaryObjectives: src.so, kpis: src.kpi, successCriteria: src.sc,
    coachNotes: src.notes, risksAndConstraints: src.risk,
  };
  if (type === 'nutrition') {
    return { ...base, kcal: src.kcal, macros: src.macros, freq: src.freq, water: src.water };
  }
  return {
    ...base, trainingFocus: src.focus, trainingVolume: src.vol,
    trainingIntensity: src.int, cardio: src.cardio, sessions: src.vol,
    deload: 'Programada según fatiga', intensityTargets: src.it,
  };
}

function pickPhases(P) {
  if (P >= 4) return [0, 1, 2, 3];
  if (P === 3) return [0, 1, 3];
  if (P === 2) return [0, 3];
  return [3];
}

function buildRoadmap(tpl) {
  const lang = tpl.language === 'en' ? 'en' : 'es';
  const goal = LIB[tpl.goal_type] ? tpl.goal_type : 'health';
  const lib = lang === 'en' ? EN_LIB[goal] : LIB[goal];
  const weeks = tpl.duration_weeks || 12;
  const idxs = pickPhases(Math.max(1, Math.min(tpl.phases || 3, 4)));
  const n = idxs.length;
  const per = Math.floor(weeks / n);

  const nutrition = [], training = [], milestones = [];
  let acc = 0;
  idxs.forEach((pi, i) => {
    const ph = (lang === 'en' ? lib[pi].en : lib[pi].es);
    const startWeek = acc + 1;
    const span = i === n - 1 ? weeks - acc : per;
    const endWeek = acc + span;
    acc = endWeek;
    const nutColor = 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400';
    const traColor = 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400';
    const ns = strat(ph.n, 'nutrition');
    const ts = strat(ph.t, 'training');
    nutrition.push({
      id: `nut-${i}`, type: 'nutrition', title: ph.n.title, startWeek, endWeek, duration: span, order: i,
      colorToken: nutColor, kcal: ph.n.kcal, macros: ph.n.macros, freq: ph.n.freq, water: ph.n.water,
      rationale: ph.n.sum, stratData: ns,
    });
    training.push({
      id: `tra-${i}`, type: 'training', title: ph.t.title, startWeek, endWeek, duration: span, order: i,
      colorToken: traColor, focus: ph.t.focus, sessions: ph.t.vol, deload: ts.deload,
      intensityTargets: ph.t.it, stratData: ts,
    });
    milestones.push({ id: `ms-${i}`, label: ph.n.title, week: `${startWeek}`, status: i === 0 ? 'next' : 'future' });
  });

  const goals = (lang === 'en' ? EN_GOALS : ES_GOALS)[goal] || (lang === 'en' ? EN_GOALS : ES_GOALS).health;
  return { nutrition, training, goals: JSON.parse(JSON.stringify(goals)), milestones };
}

const ES_GOALS = {
  fat_loss: [
    { id: 'g0', type: 'physical', label: 'Reducir el porcentaje de grasa corporal', desc: 'Pérdida de grasa progresiva preservando la masa muscular.', value: 0, currentLabel: 'Composición inicial', targetLabel: 'Físico objetivo' },
    { id: 'g1', type: 'nutrition', label: 'Adherencia nutricional sostenible', desc: 'Cumplir el plan ≥ 90 % de los días sin sensación de restricción extrema.', value: 0, currentLabel: 'Hábitos actuales', targetLabel: 'Adherencia ≥ 90 %' },
    { id: 'g2', type: 'training', label: 'Preservar la fuerza durante el déficit', desc: 'Mantener las cargas en los ejercicios básicos.', value: 0, currentLabel: 'Fuerza inicial', targetLabel: 'Fuerza mantenida' },
  ],
  muscle_gain: [
    { id: 'g0', type: 'physical', label: 'Ganar masa muscular de calidad', desc: 'Aumento de músculo minimizando la ganancia de grasa.', value: 0, currentLabel: 'Masa inicial', targetLabel: 'Masa objetivo' },
    { id: 'g1', type: 'training', label: 'Progresión de fuerza sostenida', desc: 'Aplicar sobrecarga progresiva en los ejercicios principales.', value: 0, currentLabel: 'Cargas iniciales', targetLabel: 'Récords del programa' },
    { id: 'g2', type: 'nutrition', label: 'Superávit controlado', desc: 'Sostener el superávit objetivo con proteína alta.', value: 0, currentLabel: 'Ingesta actual', targetLabel: 'Superávit objetivo' },
  ],
  body_recomposition: [
    { id: 'g0', type: 'physical', label: 'Mejorar la composición corporal', desc: 'Ganar músculo y perder grasa de forma simultánea.', value: 0, currentLabel: 'Composición inicial', targetLabel: 'Composición objetivo' },
    { id: 'g1', type: 'training', label: 'Aumentar la fuerza con peso estable', desc: 'La fuerza como indicador clave de la ganancia muscular.', value: 0, currentLabel: 'Fuerza inicial', targetLabel: 'Fuerza objetivo' },
    { id: 'g2', type: 'nutrition', label: 'Nutrición cíclica precisa', desc: 'Aplicar el reparto cíclico con proteína muy alta y constante.', value: 0, currentLabel: 'Hábitos actuales', targetLabel: 'Esquema dominado' },
  ],
  performance: [
    { id: 'g0', type: 'physical', label: 'Maximizar el rendimiento deportivo', desc: 'Elevar fuerza, potencia y capacidad de trabajo hacia el pico.', value: 0, currentLabel: 'Nivel inicial', targetLabel: 'Pico de rendimiento' },
    { id: 'g1', type: 'training', label: 'Progresar fuerza y potencia', desc: 'Convertir la base de capacidad en fuerza y potencia aplicables.', value: 0, currentLabel: 'Marcas iniciales', targetLabel: 'Marcas objetivo' },
    { id: 'g2', type: 'nutrition', label: 'Disponibilidad energética óptima', desc: 'Garantizar energía y recuperación en cada fase.', value: 0, currentLabel: 'Ingesta actual', targetLabel: 'Energía optimizada' },
  ],
  endurance_focus: [
    { id: 'g0', type: 'physical', label: 'Completar la prueba objetivo', desc: 'Llegar preparado al evento de resistencia en condiciones óptimas.', value: 0, currentLabel: 'Nivel inicial', targetLabel: 'Prueba objetivo' },
    { id: 'g1', type: 'training', label: 'Mejorar el umbral y el ritmo', desc: 'Elevar la velocidad sostenible y dominar el ritmo de competición.', value: 0, currentLabel: 'Ritmo inicial', targetLabel: 'Ritmo objetivo' },
    { id: 'g2', type: 'nutrition', label: 'Estrategia de fuelling validada', desc: 'Ensayar y cerrar la nutrición de entrenamiento y competición.', value: 0, currentLabel: 'Sin estrategia', targetLabel: 'Plan de carrera cerrado' },
  ],
  health: [
    { id: 'g0', type: 'physical', label: 'Mejorar la salud y la energía', desc: 'Más energía, mejor movilidad y bienestar general.', value: 0, currentLabel: 'Estado inicial', targetLabel: 'Salud objetivo' },
    { id: 'g1', type: 'mindset', label: 'Consolidar hábitos sostenibles', desc: 'Convertir alimentación y actividad en un estilo de vida.', value: 0, currentLabel: 'Hábitos actuales', targetLabel: 'Hábitos consolidados' },
    { id: 'g2', type: 'training', label: 'Constancia en la actividad física', desc: 'Mantener una rutina regular y sostenible.', value: 0, currentLabel: 'Sedentarismo', targetLabel: 'Actividad regular' },
  ],
  metabolic_reset: [
    { id: 'g0', type: 'nutrition', label: 'Recuperar el metabolismo', desc: 'Subir las calorías de mantenimiento sin ganar grasa.', value: 0, currentLabel: 'Mantenimiento bajo', targetLabel: 'Mantenimiento recuperado' },
    { id: 'g1', type: 'mindset', label: 'Relación sana con la comida', desc: 'Superar la mentalidad restrictiva del déficit prolongado.', value: 0, currentLabel: 'Mentalidad restrictiva', targetLabel: 'Alimentación flexible' },
    { id: 'g2', type: 'training', label: 'Reconstruir fuerza y rendimiento', desc: 'Aprovechar la energía recuperada para progresar.', value: 0, currentLabel: 'Rendimiento mermado', targetLabel: 'Rendimiento recuperado' },
  ],
};
const EN_GOALS = {
  fat_loss: [
    { id: 'g0', type: 'physical', label: 'Reduce body-fat percentage', desc: 'Progressive fat loss while preserving muscle mass.', value: 0, currentLabel: 'Starting composition', targetLabel: 'Target physique' },
    { id: 'g1', type: 'nutrition', label: 'Sustainable nutritional adherence', desc: 'Hit the plan ≥ 90% of days with no extreme restriction.', value: 0, currentLabel: 'Current habits', targetLabel: 'Adherence ≥ 90%' },
    { id: 'g2', type: 'training', label: 'Preserve strength during the deficit', desc: 'Maintain loads on the main lifts.', value: 0, currentLabel: 'Starting strength', targetLabel: 'Strength held' },
  ],
  muscle_gain: [
    { id: 'g0', type: 'physical', label: 'Gain quality muscle mass', desc: 'Build muscle while minimising fat gain.', value: 0, currentLabel: 'Starting mass', targetLabel: 'Target mass' },
    { id: 'g1', type: 'training', label: 'Sustained strength progression', desc: 'Apply progressive overload on the main lifts.', value: 0, currentLabel: 'Starting loads', targetLabel: 'Program records' },
    { id: 'g2', type: 'nutrition', label: 'Controlled surplus', desc: 'Hold the target surplus with high protein.', value: 0, currentLabel: 'Current intake', targetLabel: 'Target surplus' },
  ],
  body_recomposition: [
    { id: 'g0', type: 'physical', label: 'Improve body composition', desc: 'Gain muscle and lose fat simultaneously.', value: 0, currentLabel: 'Starting composition', targetLabel: 'Target composition' },
    { id: 'g1', type: 'training', label: 'Raise strength at stable weight', desc: 'Strength as the key marker of muscle gain.', value: 0, currentLabel: 'Starting strength', targetLabel: 'Target strength' },
    { id: 'g2', type: 'nutrition', label: 'Precise cyclic nutrition', desc: 'Apply the cyclic split with very high, constant protein.', value: 0, currentLabel: 'Current habits', targetLabel: 'Scheme mastered' },
  ],
  performance: [
    { id: 'g0', type: 'physical', label: 'Maximise athletic performance', desc: 'Raise strength, power and work capacity toward the peak.', value: 0, currentLabel: 'Starting level', targetLabel: 'Performance peak' },
    { id: 'g1', type: 'training', label: 'Progress strength and power', desc: 'Turn the capacity base into applicable strength and power.', value: 0, currentLabel: 'Starting marks', targetLabel: 'Target marks' },
    { id: 'g2', type: 'nutrition', label: 'Optimal energy availability', desc: 'Guarantee energy and recovery in every phase.', value: 0, currentLabel: 'Current intake', targetLabel: 'Energy optimised' },
  ],
  endurance_focus: [
    { id: 'g0', type: 'physical', label: 'Complete the target event', desc: 'Arrive ready for the endurance event in optimal shape.', value: 0, currentLabel: 'Starting level', targetLabel: 'Target event' },
    { id: 'g1', type: 'training', label: 'Improve threshold and pace', desc: 'Raise sustainable speed and master race pace.', value: 0, currentLabel: 'Starting pace', targetLabel: 'Target pace' },
    { id: 'g2', type: 'nutrition', label: 'Validated fuelling strategy', desc: 'Rehearse and lock in training and race nutrition.', value: 0, currentLabel: 'No strategy', targetLabel: 'Race plan locked' },
  ],
  health: [
    { id: 'g0', type: 'physical', label: 'Improve health and energy', desc: 'More energy, better mobility and overall wellbeing.', value: 0, currentLabel: 'Starting state', targetLabel: 'Target health' },
    { id: 'g1', type: 'mindset', label: 'Consolidate sustainable habits', desc: 'Turn nutrition and activity into a lifestyle.', value: 0, currentLabel: 'Current habits', targetLabel: 'Habits consolidated' },
    { id: 'g2', type: 'training', label: 'Consistency in physical activity', desc: 'Keep a regular, sustainable routine.', value: 0, currentLabel: 'Sedentary', targetLabel: 'Regular activity' },
  ],
  metabolic_reset: [
    { id: 'g0', type: 'nutrition', label: 'Recover the metabolism', desc: 'Raise maintenance calories without gaining fat.', value: 0, currentLabel: 'Low maintenance', targetLabel: 'Recovered maintenance' },
    { id: 'g1', type: 'mindset', label: 'Healthy relationship with food', desc: 'Overcome the restrictive mindset of a long diet.', value: 0, currentLabel: 'Restrictive mindset', targetLabel: 'Flexible eating' },
    { id: 'g2', type: 'training', label: 'Rebuild strength and performance', desc: 'Use the recovered energy to progress.', value: 0, currentLabel: 'Impaired performance', targetLabel: 'Performance recovered' },
  ],
};

const { data: rows, error } = await db
  .from('planning_templates')
  .select('id, name, goal_type, intensity, duration_weeks, phases, language, data_json');
if (error) { console.error(error); process.exit(1); }

let ok = 0;
for (const tpl of rows) {
  const rm = buildRoadmap(tpl);
  const data_json = {
    ...(tpl.data_json && typeof tpl.data_json === 'object' ? tpl.data_json : {}),
    type: 'roadmap-template',
    totalWeeks: tpl.duration_weeks || 12,
    currentWeek: 1,
    status: 'Draft',
    ...rm,
  };
  const { error: upErr } = await db.from('planning_templates')
    .update({ data_json, updated_at: new Date().toISOString() })
    .eq('id', tpl.id);
  if (upErr) { console.error('FAIL', tpl.name, upErr.message); continue; }
  ok++;
}
console.log(`Updated ${ok}/${rows.length} planning templates.`);
