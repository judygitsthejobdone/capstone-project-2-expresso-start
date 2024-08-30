const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const timesheetsRouter = require('./timesheets');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

router.param('employeeId',(req,res,next,id)=>{
    const sql = `SELECT * FROM Employee WHERE id = ?;`
    const values = [id];
    const callback = (err,row)=>{
        if(err){return next(err)} else if(row) {
            req.employee = row;
            next();
        } else {res.sendStatus(404)}};

    db.get(sql, values, callback)
})
router.get('/',(req,res,next)=>{
    const sql = `SELECT * FROM Employee WHERE is_current_employee = ?`
    const values = [1];
    const callback = (err,rows)=>{
        if(err){return next(err)} else {
            //console.log(rows);
            res.json({employees: rows});
        }
    };
    
    db.all(sql, values, callback)
})
router.post('/',(req,res,next)=>{
    const employee = validElement(req.body.employee);
    const sql = `INSERT INTO Employee
    (name, position, wage, is_current_employee)
    VALUES(?, ?, ?, ?);`
    const values = [employee.name, employee.position, employee.wage, employee.is_current_employee];
    const callback = function(err) {
        if(err){return next(err)} else {
            const id = this.lastID;
            //console.log('\n\nid:'+id+'\n\n');
            db.get(`SELECT * FROM Employee WHERE id = ?`,id, (err,row) => res.status(201).json({employee: row}));
        }};

    if(employee) {db.run(sql, values, callback)} else {
        res.sendStatus(400);
        return next();
    }
})

router.get('/:employeeId',(req,res,next)=>{
    res.json({employee: req.employee})
})

router.put('/:employeeId',(req,res,next)=>{
    const employee = validElement(req.body.employee);
    const sql = `UPDATE Employee 
        SET name = ?,
            position = ?,
            wage = ?,
            is_current_employee = ?
        WHERE id = ?;`
    const values = [employee.name, employee.position, employee.wage, employee.is_current_employee, req.params.employeeId];
    const callback = (err)=>{
        if(err){return next(err)} else {
            db.get(`SELECT * FROM Employee WHERE id = ?;`,req.params.employeeId, (err,row)=>res.json({employee: row}))
        }};
    if(employee) {db.run(sql, values, callback)} else {
        res.sendStatus(400);
        return next();
    }
})

router.delete('/:employeeId',(req,res,next)=>{
    const sql = `UPDATE Employee
        SET is_current_employee = ?
        WHERE id = ?;`
    const values = [0, req.params.employeeId];
    const callback = (err)=>{
        if(err){return next(err)} else {
            db.get(`SELECT * FROM Employee WHERE id = ?;`,req.params.employeeId, (err,row)=>res.json({employee: row}));
        }};

    db.run(sql, values, callback);
    
})

router.use('/:employeeId/timesheets',timesheetsRouter);

function validElement(input) {
    const valid = input.name && input.position && input.wage;
    if(valid) {
        if(input.is_current_employee !== 0 && input.is_current_employee !== 1) {input.is_current_employee = 1};
        return input
    } else {return false}
}

module.exports = router;