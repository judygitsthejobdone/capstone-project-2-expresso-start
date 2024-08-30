const express = require('express');
const router = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

router.param('timesheetId',(req,res,next,id)=>{
    const sql = `SELECT * FROM Timesheet WHERE id = ?;`
    const values = [id];
    const callback = function(err,row){
        if(err){return next(err)} else if(row) {
            req.timesheet = row;
            next();
        } else {res.sendStatus(404)}};

    db.get(sql, values, callback)
})

router.get('/',(req,res,next)=>{
    const sql = `SELECT * FROM Timesheet WHERE employee_id = ?`
    const values = [req.params.employeeId];
    const callback = (err,rows)=>{
        if(err){return next(err)} else {
            //console.log(rows);
            res.json({timesheets: rows});
        }
    };
    
    db.all(sql, values, callback);
});

router.post('/',(req,res,next)=>{
    const timesheet = validElement(req.body.timesheet);
    const sql = `INSERT INTO Timesheet 
        (hours, rate, date, employee_id)
        VALUES(?, ?, ?, ?);`
    const values = [timesheet.hours, timesheet.rate, timesheet.date, req.params.employeeId];
    const callback = function(err){
        if(err){return next(err)} else {
            const id = this.lastID;
            //console.log('\n\nid:'+id+'\n\n');
            db.get(`SELECT * FROM Timesheet WHERE id = ?`,id, (err,row) => {
                //console.log(row);
                res.status(201).json({timesheet: row})
            });
        }
    };

    if(timesheet) {db.run(sql, values, callback)} else {
        res.sendStatus(400);
        return next();
    }
})

router.put('/:timesheetId',(req,res,next)=>{
    const timesheet = validElement(req.body.timesheet);
    const sql = `UPDATE Timesheet 
        SET hours = ?,
            rate = ?,
            date = ?,
            employee_id = ?
        WHERE id = ?;`
    const values = [
        timesheet.hours, timesheet.rate, timesheet.date, req.params.employeeId, 
        req.params.timesheetId
    ];
    const callback = function(err){
        if(err){return next(err)} else {
            db.get(`SELECT * FROM Timesheet WHERE id = ?;`,req.params.timesheetId, (err,row)=>res.json({timesheet: row}))
        }};
    if(timesheet) {db.run(sql, values, callback)} else {
        res.sendStatus(400);
        return next();
    }
})
router.delete('/:timesheetId',(req,res,next)=>{
    const sql = `DELETE FROM Timesheet
        WHERE id = ?;`
    const values = [req.params.timesheetId];
    const callback = function(err){
        if(err){return next(err)} else {
            res.sendStatus(204);
        }};

    db.run(sql, values, callback);
    
})

function validElement(input) {
    const valid = input.hours && input.rate && input.date;
    console.log('input element:')
    console.log(input);
    if(valid) {
        return input
    } else {return false}
}

module.exports = router;