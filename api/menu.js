const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const menuItemRouter = require('./menu-item');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

router.param('menuId',
    (req,res,next,id)=>{
        const sql = `SELECT * FROM Menu WHERE id = ?;`
        const values = [id];
        const callback = function(err,row){
            if(err){return next(err)} else if(row){
                req.menu = row;
                return next();
            }else {
                return res.sendStatus(404);
            };
        };

        db.get(sql, values, callback);
    }
);

/**Note to self: you cannot input multiple callback functions to a single router.param method. You must separate to multiple method calls. */

router.param('menuId',
    (req,res,next,id)=>{
        
        const sql = `SELECT * FROM MenuItem 
            WHERE menu_id = ?;`
        const values = [id];
        const callback = function(err,rows){
            if(err){return next(err)} else {
                req.menuItems = rows;
                //console.log('\nmenu items found are:')
                //console.log(req.menuItems);
                next();
            }
        };
        
        db.all(sql, values, callback);
    }
);

router.get('/',(req,res,next)=>{
    const sql = `SELECT * FROM Menu;`
    //const values = [];
    const callback = function(err,rows){
        if(err){return next(err)} else {
            res.json({menus: rows});
            return next()
        }};

    db.all(sql, /*values,*/ callback) 
})

router.post('/',(req,res,next)=>{
    const menu = validElement(req.body.menu);
    const sql = `INSERT INTO Menu (title) VALUES(?);`
    const values = [menu.title];
    const callback = function(err){
        if(err){return next(err)} else {
            const id = this.lastID;
            //console.log('\n\nid:'+id+'\n\n');
            db.get(`SELECT * FROM Menu WHERE id = ?`,id, (err,row) => {
                //console.log(row);
                res.status(201).json({menu: row})
                return next();
            });
        }};

    if(menu) {db.run(sql, values, callback)} else {
        res.sendStatus(400);
        return next();
    }
})

router.get('/:menuId',(req,res,next)=>{
    res.json({menu: req.menu})
    next();
})

router.put('/:menuId',(req,res,next)=>{
    const menu = validElement(req.body.menu);
    const sql = `UPDATE Menu SET title = ? WHERE id = ?;`
    const values = [menu.title, req.params.menuId];
    const callback = function(err){
        if(err){return next(err)} else {
            db.get(`SELECT * FROM Menu WHERE id = ?;`,req.params.menuId, (err,row)=>res.json({menu: row}))
        }};

    if(menu) {db.run(sql, values, callback)} else {
        res.sendStatus(400);
        return next();
    }
})

router.delete('/:menuId',(req,res,next)=>{
    const sql = `DELETE FROM Menu WHERE id = ?;`
    const values = [req.params.menuId];
    const callback = function(err){
        if(err){return next(err)} else {
            return res.sendStatus(204);
        }};
        //Note: the db.all which populates req.menuItems returns ***an ARRAY of OBJECTS**. Therefore, when there are no results the array is empty of objects, and the first value in the array is null. HOWEVER, when testing for results you must check for truth of the FIRST ELEMENT in the array. 
        //If you only check for truth of the array itself, you will always get "true" bc the array exists even though it is empty.
        //console.log('!req.menuItems:'+!req.menuItems[0])
        if(!req.menuItems[0]) {
        db.run(sql, values, callback)
    } else {return res.sendStatus(400)}
})

router.use('/:menuId/menu-items',menuItemRouter);

function validElement(input) {
    const valid = input.title;
    if(valid) {
        return input
    } else {return false}
}

module.exports = router;