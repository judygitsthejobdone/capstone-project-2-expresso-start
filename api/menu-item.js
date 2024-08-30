const express = require('express');
const router = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

router.param('menuItemId',(req,res,next,id)=>{
    const sql = `SELECT * FROM MenuItem WHERE id = ?;`
    const values = [id];
    const callback = function(err, row){
        if(err){return next(err)} else if(row){
            req.menuItem = row;
            return next();
        }else {
            return res.sendStatus(404);
        };
    };

    db.get(sql, values, callback)
});

router.get('/',(req,res,next)=>{
    res.json({menuItems: req.menuItems});
})

router.post('/',(req,res,next)=>{
    const menuItem = validElement(req.body.menuItem);
    const sql = `INSERT INTO MenuItem 
        (name, description, inventory, price, menu_id)
        VALUES(?, ?, ?, ?, ?);`
    const values = [menuItem.name, menuItem.description, menuItem.inventory, menuItem.price, req.params.menuId];
    const callback = function(err){
        if(err){return next(err)} else {
            const id = this.lastID;
            //console.log('\n\nid:'+id+'\n\n');
            db.get(`SELECT * FROM MenuItem WHERE id = ?`,id, (err,row) => {
                //console.log(row);
                res.status(201).json({menuItem: row});
            });
        }};
    
    if(menuItem) {db.run(sql, values, callback)} else {
        res.sendStatus(400);
    }
})

router.put('/:menuItemId',(req,res,next)=>{
    const menuItem = validElement(req.body.menuItem);
    const sql = `UPDATE MenuItem
        SET name = ?,
            description = ?,
            inventory = ?,
            price = ?,
            menu_id = ?
       WHERE id = ?;`
    const values = [
        menuItem.name, 
        menuItem.description, 
        menuItem.inventory, 
        menuItem.price, 
        req.params.menuId, 
    
        req.params.menuItemId
    ];
    const callback = function(err){
        if(err){return next(err)} else {
            db.get(`SELECT * FROM MenuItem WHERE id = ?;`,req.params.menuItemId, (err,row)=>res.json({menuItem: row}))
        }};
    
    if(menuItem) {db.run(sql, values, callback)} else {
        return res.sendStatus(400);
    }
})

router.delete('/:menuItemId',(req,res,next)=>{
    const sql = `DELETE FROM MenuItem WHERE id = ?;`
    const values = [req.params.menuItemId];
    const callback = function(err){
        if(err){return next(err)} else {
            res.sendStatus(204);
        }};

    db.run(sql, values, callback)
})

function validElement(input) {
    const valid = input.name && input.inventory && input.price;
    if(valid) {
        if (!input.description){input.description = ''};
        return input
    } else {return false}
}

module.exports = router;