/**
 * InscripcionRepository.js
 * Repositorio que persiste inscripciones en la colección "inscripciones" de la DB.
 *
 * La colección arranca vacía y se llena a medida que se confirman inscripciones.
 * Permite inyectar una DB diferente para tests aislados.
 */

import { db as defaultDb } from '../database/InMemoryDatabase.js';

export class InscripcionRepository {
  /**
   * @param {import('../database/InMemoryDatabase.js').InMemoryDatabase} database
   */
  constructor(database = defaultDb) {
    // Colección vacía: las inscripciones se generan en tiempo de ejecución
    this._col = database.collection('inscripciones', []);
  }

  /**
   * Persiste una inscripción confirmada.
   * @param {import('../models/Inscripcion.js').Inscripcion} inscripcion
   * @returns {Promise<import('../models/Inscripcion.js').Inscripcion>}
   */
  async save(inscripcion) {
    return this._col.insertOne(inscripcion);
  }

  /**
   * Busca una inscripción por su ID único.
   * @param {string} id
   * @returns {Promise<import('../models/Inscripcion.js').Inscripcion|null>}
   */
  async findById(id) {
    return this._col.findById(id);
  }

  /**
   * Retorna todas las inscripciones almacenadas.
   * @returns {Promise<import('../models/Inscripcion.js').Inscripcion[]>}
   */
  async findAll() {
    return this._col.findAll();
  }

  /**
   * Retorna la cantidad total de inscripciones.
   * @returns {Promise<number>}
   */
  async count() {
    return this._col.count();
  }
}
