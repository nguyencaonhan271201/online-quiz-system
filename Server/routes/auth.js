const router = require('express').Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mysql = require('mysql');

const query = require('./../helper/query');

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'online-quiz-system'
});
  
conn.connect(function(err){
    if (err)
        console.log(err);
});

//REGISTER
router.post("/register", async (req, res) => {
    try {
        //Check for duplicate
        var params = {
            username: req.body.username
        }
        
        let checkDuplicateResult = await query(conn, "SELECT COUNT(*) FROM users WHERE ?", params).catch(console.log);
        checkDuplicateResult = JSON.parse(JSON.stringify(checkDuplicateResult))[0];

        if (checkDuplicateResult['COUNT(*)'] !== 0) {
            return res.status(400).send("Username duplicate");
        }
        
        //Create user
        let hashPassword;
        hashPassword = await bcrypt.hash(req.body.password, saltRounds);
    
        params = [
            req.body.username,
            hashPassword,
            req.body.fullname
        ]

        try {
            const result = await query(conn, "INSERT INTO users(username, password, fullname) VALUES (?, ?, ?)", params);
            res.status(200).send("User created");
        } catch (err) {
            res.status(500).send(err.message);
        }
        
    } catch (err) {
        res.status(500).send(err.message);
    }
})

//LOGIN
router.post("/login", async (req, res) => {
    try {
        //Check for duplicate
        var params = {
            username: req.body.username
        }
        
        let findAccountResult = await query(conn, "SELECT * FROM users WHERE ?", params).catch(console.log);
        if (findAccountResult.length == 0)
            return res.status(404).send("User not found"); 

        findAccountResult = JSON.parse(JSON.stringify(findAccountResult))[0];
        
        //Validate password
        const validPassword = await bcrypt.compare(req.body.password, findAccountResult.password);
        if (!validPassword)
            return res.status(400).send("Wrong password");

        //Validate correct
        res.status(200).json(findAccountResult);
        
    } catch (err) {
        res.status(400).send(err.message);
    }
});

//UPDATE
router.put("/edit/:id", async (req, res) => {
    try {
        if (req.body.userID === req.params.id) {
            if (req.body.password) {
                try {
                    req.body.password = await bcrypt.hash(req.body.password, saltRounds);
                } catch (err) {
                    res.status(500).send(err.message);
                }
            }

            try {
                let findAccountResult = await query(conn, "SELECT * FROM users WHERE id = ?", [req.params.id]).catch(console.log);
                if (findAccountResult.length == 0)
                    return res.status(404).send("User not found"); 

                //User found
                if (req.body.password) {
                    let params = [
                        req.body.password,
                        req.params.id
                    ]
    
                    const result = await query(conn, "UPDATE users SET password = ? WHERE id = ?", params);
                } else {
                    let params = [
                        req.body.username,
                        req.body.fullname,
                        req.params.id
                    ]

                    const result = await query(conn, "UPDATE users SET username = ?, fullname = ? WHERE id = ?", params);
                }
                
                res.status(200).send("Account have been updated");
            } catch (err) {
                res.status(500).send(err.message);
            }
        } else {
            return res.status(403).send("You can only update your account");
        }      
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;