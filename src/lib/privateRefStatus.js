// Status einer vertraulichen Referenz — zentral, ohne Server-Abhängigkeiten,
// damit Store (Validierung), Admin-Formular/-Liste und Freigabe-Ausgabe dieselbe
// Quelle nutzen. Reihenfolge = Reihenfolge im Auswahlfeld.
export const PRIVATE_REF_STATUS = [
    { value: 'live', label: 'live', formLabel: 'live / im Einsatz' },
    { value: 'in_entwicklung', label: 'in Entwicklung', formLabel: 'in Entwicklung (noch nicht angekündigt)' },
    { value: 'auftragsarbeit', label: 'Auftragsarbeit', formLabel: 'Auftragsarbeit (Kundenprojekt)' },
    { value: 'arbeitsstelle', label: 'Arbeitsstelle', formLabel: 'Arbeitsstelle (Anstellung)' },
];

export const PRIVATE_REF_STATUS_VALUES = PRIVATE_REF_STATUS.map((s) => s.value);
export const PRIVATE_REF_STATUS_LABEL = Object.fromEntries(PRIVATE_REF_STATUS.map((s) => [s.value, s.label]));
