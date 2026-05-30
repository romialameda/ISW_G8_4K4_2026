/**
 * ActividadRepository.js
 * Repositorio que accede a la colección "actividades" de la InMemoryDatabase.
 *
 * Patrón Repository:
 *  - Desacopla la fuente de datos (DB) del servicio de dominio.
 *  - Convierte los documentos planos de la DB en instancias de Actividad (Mapper).
 *  - Todas las operaciones son async para simular acceso real a base de datos.
 *
 * Para testing:
 *  - Se puede inyectar una InMemoryDatabase diferente por constructor
 *    → permite resetear el estado entre tests sin afectar la DB singleton.
 */

import { Actividad } from '../models/Actividad.js';
import { db as defaultDb } from '../database/InMemoryDatabase.js';
import { SEED_ACTIVIDADES } from '../database/seedData.js';

export class ActividadRepository {
  /**
   * @param {import('../database/InMemoryDatabase.js').InMemoryDatabase} database
   *   Instancia de la DB. Por defecto usa el singleton compartido.
   *   En tests se puede pasar una instancia fresca para aislamiento total.
   */
  constructor(database = defaultDb) {
    // Registra la colección en la DB con los datos de seed.
    // Si ya existe (singleton), la reutiliza sin re-seedear.
    this._col = database.collection('actividades', SEED_ACTIVIDADES);
  }

  /**
   * Mapea un documento plano de la DB a una instancia de Actividad.
   * @param {object|null} doc
   * @returns {Actividad|null}
   */
  #mapToModel(doc) {
    if (!doc) return null;
    return new Actividad(doc);
  }

  /**
   * Retorna todas las actividades del catálogo.
   * @returns {Promise<Actividad[]>}
   */
  async findAll() {
    const docs = await this._col.findAll();
    return docs.map(doc => this.#mapToModel(doc));
  }

  /**
   * Busca una actividad por su nombre exacto.
   * @param {string} nombre
   * @returns {Promise<Actividad|null>}
   */
  async findByNombre(nombre) {
    const doc = await this._col.findOne(item => item.nombre === nombre);
    return this.#mapToModel(doc);
  }

  /**
   * Busca una actividad por su ID.
   * @param {string} id
   * @returns {Promise<Actividad|null>}
   */
  async findById(id) {
    const doc = await this._col.findById(id);
    return this.#mapToModel(doc);
  }

  /**
   * Retorna los nombres de todas las actividades válidas.
   * @returns {Promise<string[]>}
   */
  async getNombresValidos() {
    const docs = await this._col.findAll();
    return docs.map(d => d.nombre);
  }
}
