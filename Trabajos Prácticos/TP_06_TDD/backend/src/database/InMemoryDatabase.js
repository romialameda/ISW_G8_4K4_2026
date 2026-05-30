/**
 * InMemoryDatabase.js
 * Simula el motor de una base de datos en memoria.
 *
 * Diseño inspirado en el patrón de MongoDB/Mongoose:
 *  - Las operaciones son async (retornan Promises) para simular latencia de red/disco.
 *  - Soporta múltiples colecciones identificadas por nombre.
 *  - Cada colección tiene operaciones CRUD básicas.
 *  - Permite reset y seed para facilitar tests aislados (principio FIRST: Independiente).
 *
 * En producción, este archivo se reemplazaría por un conector real
 * (ej: mongoose, prisma, pg) sin modificar los repositorios (principio OCP - SOLID).
 */

// ─── Collection ───────────────────────────────────────────────────────────────
/**
 * Simula una colección/tabla de la base de datos.
 * Internamente es un Array, pero la interfaz imita una DB asíncrona.
 */
export class Collection {
  #data;

  /**
   * @param {any[]} seedData - Datos iniciales para esta colección
   */
  constructor(seedData = []) {
    this.#data = [...seedData];
  }

  /**
   * Retorna todos los documentos de la colección.
   * @returns {Promise<any[]>}
   */
  async findAll() {
    return [...this.#data]; // shallow copy para no exponer el array interno
  }

  /**
   * Busca un documento por predicado (función) o por objeto de filtro exacto.
   * @param {Function|object} filter
   * @returns {Promise<any|null>}
   */
  async findOne(filter) {
    const predicate =
      typeof filter === 'function'
        ? filter
        : (item) => Object.entries(filter).every(([k, v]) => item[k] === v);

    return this.#data.find(predicate) ?? null;
  }

  /**
   * Busca un documento por su campo `id`.
   * @param {string} id
   * @returns {Promise<any|null>}
   */
  async findById(id) {
    return this.#data.find((item) => item.id === id) ?? null;
  }

  /**
   * Inserta un nuevo documento en la colección.
   * @param {any} doc
   * @returns {Promise<any>} El documento insertado
   */
  async insertOne(doc) {
    this.#data.push(doc);
    return doc;
  }

  /**
   * Retorna la cantidad de documentos en la colección.
   * @returns {Promise<number>}
   */
  async count() {
    return this.#data.length;
  }

  // ── Métodos para testing ──────────────────────────────────────────────────

  /**
   * Resetea la colección a sus datos de seed (o vacío).
   * SOLO para usar en tests (beforeEach / afterEach).
   * @param {any[]} seedData
   */
  _reset(seedData = []) {
    this.#data = [...seedData];
  }

  /**
   * Retorna todos los datos (para assertions en tests).
   * @returns {any[]}
   */
  _getAll() {
    return [...this.#data];
  }
}

// ─── InMemoryDatabase ─────────────────────────────────────────────────────────
/**
 * Motor principal de la base de datos en memoria.
 * Gestiona múltiples colecciones y sus datos de seed.
 */
export class InMemoryDatabase {
  #collections = new Map();
  #seeds = new Map();

  /**
   * Obtiene (o crea) una colección por nombre.
   * Si la colección no existe y se pasan seedData, se inicializa con ellos.
   *
   * @param {string} name - Nombre de la colección (ej: 'actividades', 'inscripciones')
   * @param {any[]} seedData - Datos iniciales (solo se aplican la primera vez)
   * @returns {Collection}
   */
  collection(name, seedData = []) {
    if (!this.#collections.has(name)) {
      this.#seeds.set(name, seedData);
      this.#collections.set(name, new Collection(seedData));
    }
    return this.#collections.get(name);
  }

  /**
   * Resetea todas las colecciones a su estado de seed inicial.
   * SOLO para usar en beforeEach de tests de integración.
   */
  resetAll() {
    for (const [name, collection] of this.#collections) {
      collection._reset(this.#seeds.get(name) ?? []);
    }
  }

  /**
   * Retorna las colecciones disponibles (para inspección en tests).
   * @returns {string[]}
   */
  getCollectionNames() {
    return [...this.#collections.keys()];
  }
}

/**
 * Instancia singleton de la base de datos en memoria.
 * Los repositorios la importan directamente para compartir estado.
 *
 * En tests que requieran aislamiento total, se puede instanciar una
 * nueva InMemoryDatabase() y pasarla al repositorio por constructor.
 */
export const db = new InMemoryDatabase();
