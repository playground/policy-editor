"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouchDB = void 0;
const rxjs_1 = require("rxjs");
const Cloudant = require('@cloudant/cloudant');
class CouchDBClass {
    constructor(dbName) {
        let params = {
            url: 'https://d44a1815-07de-4807-bd7a-baf4b9adc1c4-bluemix:2808e309234a627482f093ca8880266394522d2b89c456ec3706cfd40aec3111@d44a1815-07de-4807-bd7a-baf4b9adc1c4-bluemix.cloudantnosqldb.appdomain.cloud'
        };
        this.cloudant = Cloudant(params);
        this.db = this.cloudant.db.use(dbName);
    }
    dbFind(query) {
        return new rxjs_1.Observable((observer) => {
            this.db.find(query, (err, data) => {
                if (err) {
                    console.log('$$$cloudant:err', err);
                    observer.error(err);
                }
                else {
                    observer.next(data);
                    observer.complete();
                }
            });
        });
    }
    index(field) {
        let first_name = { name: 'time', type: 'json', index: { fields: ['time'] } };
        return new Promise((resolve, reject) => {
            this.db.index(field, (err, response) => {
                if (err) {
                    reject(err);
                }
                console.log('Index creation result: %s', response.result);
                resolve(response);
            });
        });
    }
}
exports.CouchDB = CouchDBClass;
