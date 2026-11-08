export const projects = [
  {
    id: 'robotics', number: '01', category: 'ROBOTICS', title: 'Mobile Robot Autonomy',
    short: 'Von der Karte zur Bewegung.',
    description: 'Ein Projekt rund um autonome mobile Roboter: Umgebung erfassen, Wege planen und Bewegungen regeln.',
    tags: ['Python', 'Mapping', 'Path Planning'],
    url: 'https://github.com/CagriCatik/Mobile-Robot-Autonomy',
    color: '#8ba98f', position: { x: -15, z: -3 }, heading: 0,
  },
  {
    id: 'dynamics', number: '02', category: 'VEHICLE DYNAMICS', title: 'Vehicle Dynamics',
    short: 'Fahrdynamik zum Experimentieren.',
    description: 'Eine Python-Plattform für nichtlineare Fahrzeugdynamik, Reifenmodelle, Vierradlenkung und integrierte Bewegungsregelung. Auf dem Testgelände siehst du eine illustrative Lenkungs-Demo.',
    tags: ['Simulation', 'Control', 'Python'],
    url: 'https://github.com/CagriCatik/Vehicle-Dynamics',
    color: '#c79b75', position: { x: 15, z: -3 }, heading: 0,
  },
  {
    id: 'testing', number: '03', category: 'TEST AUTOMATION', title: 'SpecToTest',
    short: 'Von der Spezifikation zum Testfall.',
    description: 'Ein deterministischer Testfall-Compiler: Lesbare Textspezifikationen werden über konfigurierbare Mappings und Operationsverträge in Python-Testcode übersetzt. Die Weltstation zeigt diesen Ablauf als animierte Vorschau.',
    tags: ['Python', 'Testing', 'Automation'],
    url: 'https://github.com/CagriCatik/SpecToTest',
    color: '#a297c5', position: { x: 0, z: -27 }, heading: 0,
  },
];
