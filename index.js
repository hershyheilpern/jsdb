const { Pool } = require("pg");
var cl = console.log;

var db = {
    DBclass: class {
        constructor(config) {
            this.pool = new Pool(config)
            this.schema = config.schema
        }

        query(sql, values, cb) {
            if (typeof sql == 'object') {
                cb = values
                values = sql.values
                sql = sql.sql
            }
            try {
                sql = sql.replace(/\$\$/g, this.schema)
            } catch (error) {
                cl(error)
                cl(sql)
            }


            if (typeof values == 'object') {
                if (!Array.isArray(values)) {
                    let list = Object.keys(values)
                    let ary = []
                    list.map((v, i) => {
                        let number = i + 1
                        let regex1 = new RegExp("\\$" + v + ",", "g");
                        let regex2 = new RegExp("\\$" + v + "(\\s|$|;)", "g");
                        let regex3 = new RegExp("\\$" + v + "\\)", "g");
                        let replace1 = "$$" + (number) + ",";
                        let replace2 = "$$" + (number) + " "
                        let replace3 = "$$" + (number) + ")";
                        sql = sql.replace(regex3, replace3)
                        sql = sql.replace(regex2, replace2)
                        sql = sql.replace(regex1, replace1)
                        ary.push(values[v])
                    })
                    values = ary
                    cl(5,"gyfjutgyufutytyfi", sql, values)
                }
                if (!sql.includes("system")) {
                }
                this.pool.query(sql, values, cb)
            } else {
                cb = values
                this.pool.query(sql, cb)
            }
        }
        insert(obj,cb) {
            let cols = Object.keys(obj.cols)
            //let values = get_obj_prop_ary(obj.cols)
            let qry = {
                sql: `INSERT INTO $$.${obj.table} (${cols.join(",")})
                VALUES ($${cols.join(",$")});`,
                values: obj.cols
            }
            this.query(qry,cb)
        }
    
    },
    init: function (name, a) {
        config = {};
        if (name.toLowerCase() == "system") {
            config = a.config.system.db
        } else {
            config = a.config.apps[a.config.domains[name]].db
        }
        if (config.type.toLowerCase() == "postgresql") {
            a.db[name] = new this.DBclass(config.connection)
        }
    },

}

function get_obj_prop_ary(obj) {
    return Object.keys(obj).map(v => {
        return obj[v]
    })
}
module.exports = db;