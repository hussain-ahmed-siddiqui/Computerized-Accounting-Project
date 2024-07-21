const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const path = require('path');
const { resourceUsage } = require('process');

const app = express();
const static_path = path.join(__dirname, '/views');
app.use('/', express.static('views'));
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.json);
app.use(express.json()); // This line is crucial for your server to accept JSON payloads

//Creating Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#mysql#',
    database: 'financialAccounting'
});

//Connect to MySQL
db.connect(err => {
    if (err) {
        throw err;
    };
    console.log('MySQL Connected');
});

// //Create Database
// app.get('/createdatabase', (req, res) => {
//     let sql = 'CREATE DATABASE financialAccounting';
//     db.query(sql, err => {
//         if (err) {
//             throw err;
//         }
//         res.send('Database Created');
//     });
// });

// //Create Tables
// app.get('/createTables', (req, res) => {
//     let sql = 'CREATE TABLE accounts (id int AUTO_INCREMENT, name VARCHAR(255), type VARCHAR(20), contact VARCHAR(20), email VARCHAR(255), address VARCHAR(255), about VARCHAR(255), PRIMARY KEY(id))'
//     db.query(sql, err => {
//         if (err) {
//             throw err;
//         }
//         res.send('Accounts Table Created');
//     });
//     let sql2 = 'CREATE TABLE transactions (id int AUTO_INCREMENT, transactionDate VARCHAR(20), debitAccounts VARCHAR(255), debitValues VARCHAR(255), creditAccounts VARCHAR(255), creditValues VARCHAR(255), PRIMARY KEY(id))'
//     db.query(sql2, err => {
//         if (err) {
//             throw err;
//         }
//         res.send('Transactions Table Created');
//     });
// })

app.listen(port, () => {
    console.log(`Server Started On Port ${port} ; http://localhost:${port}/`);
});


// API Routes:
app.get('/', (req, res) => {
    console.log("Index Page Route");
    res.sendFile('./index.html', { root: static_path });
})

app.get('/addTransaction', (req, res) => {
    console.log("Manual Add Transaction Page Route");
    res.sendFile('./public/manualAdd.html', { root: static_path });
})

app.get('/accounts', (req, res) => {
    console.log("Show Accounts Page Route");
    res.sendFile('./public/ledger.html', { root: static_path });
})

app.get('/journal', (req, res) => {
    console.log("General Journal Page Route");
    res.sendFile('./public/generalJournal.html', { root: static_path });
})

app.get('/unAdjustedTrial', (req, res) => {
    console.log("Un Adjusted TrialBalance Page Route");
    res.sendFile('./public/trialBalance.html', { root: static_path });
})

app.get('/adjustments',(req,res)=>{
    console.log("Adjustments at the end of an accounting period");
    res.sendFile('./public/adjustments.html', { root: static_path });
})

app.get('/accountLedger/:id', (req, res) => {
    console.log("Only Account Page Route");
    res.sendFile('./public/accountLedger.html', { root: static_path });
})


//Post Requests
app.post('/createAccount', async(req, res) => {
    try {
        accName = req.body.name;
        accType = req.body.type;
        accContact = req.body.contact;
        accEmail = req.body.email;
        accAdd = req.body.address;
        accAbout = req.body.about;

        let rec = { name: accName, type: accType, contact: accContact, email: accEmail, address: accAdd, about: accAbout };
        let sql = 'INSERT INTO accounts set ?'
        db.query(sql, rec, err => {
            if (err) {
                throw err;
            }
            console.log("Record Inserted");
        });
        console.log(rec)
    } catch (err) {
        console.log("Error In Form Post Request\n", err);
        res.sendStatus(400).send(err);
    }
    res.redirect('/accounts');

})

app.post('/createTransaction', async(req, res) => {
    try {
        debitAccountsB = ''
        debitAmounts = ''
        creditAccountsB = ''
        creditAmounts = ''
        todaysDate = new Date().toJSON().slice(0, 10);
        if (typeof(req.body.debitAccName) === 'object') {
            for (let i = 0; i < req.body.debitAccAmount.length - 1; i++) {
                debitAccountsB += String(req.body.debitAccName[i]) + ',';
                debitAmounts += String(req.body.debitAccAmount[i]) + ',';
            }
            debitAccountsB += String(req.body.debitAccName[req.body.debitAccName.length - 1]);
            debitAmounts += String(req.body.debitAccAmount[req.body.debitAccAmount.length - 1]);
        } else {
            debitAccountsB = req.body.debitAccName
            debitAmounts = req.body.debitAccAmount
        }
        if (typeof(req.body.creditAccName) === 'object') {
            for (let i = 0; i < req.body.creditAccAmount.length - 1; i++) {
                creditAccountsB += String(req.body.creditAccName[i]) + ',';
                creditAmounts += String(req.body.creditAccAmount[i]) + ',';
            }
            creditAccountsB += String(req.body.creditAccName[req.body.creditAccName.length - 1]);
            creditAmounts += String(req.body.creditAccAmount[req.body.creditAccAmount.length - 1]);
        } else {
            creditAccountsB = req.body.creditAccName
            creditAmounts = req.body.creditAccAmount
        }

        let rec = { transactionDate: todaysDate, debitAccounts: debitAccountsB, debitValues: debitAmounts, creditAccounts: creditAccountsB, creditValues: creditAmounts };
        let sql = 'INSERT INTO transactions set ?'
        db.query(sql, rec, err => {
            if (err) {
                throw err;
            }
            console.log("Record Inserted");
        });
        console.log(rec)
    } catch (err) {
        console.log("Error In Form Post Request\n", err);
        res.sendStatus(400).send(err);
    }
    res.redirect('/addTransaction');

})


// Data APIs:
app.get('/allAccountsData', (req, res) => {
    var data;
    let sql = 'SELECT * FROM accounts;'
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Selected All');
        data = JSON.stringify(result)
        res.send(data);
    });
})

app.get('/onlyAccountData/:id', (req, res) => {
    var id = req.url.substring(req.url.lastIndexOf('/') + 1);
    let sql = `SELECT * FROM accounts WHERE id=${id}`
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log(`Selected ID: ${id}`);
        data = JSON.stringify(result)
        res.send(data);
    });
})

app.get('/checkConnection', (req, res) => {
    data = {
        database: db._connectCalled
    }
    res.send(JSON.stringify(data))
})

app.get('/allTransactionsData', (req, res) => {
    var data;
    let sql = 'SELECT * FROM transactions;'
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Selected All');
        data = JSON.stringify(result)
        res.send(data);
    });
})

app.get('/showAccountLedger/:id', (req, res) => {
    var id = req.url.substring(req.url.lastIndexOf('/') + 1);
    let sql = `SELECT * FROM accounts WHERE id=${id}`
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        } else {
            let sql2 = `SELECT * FROM transactions WHERE INSTR(debitAccounts,"${result[0].name}") > 0 OR INSTR(creditAccounts,"${result[0].name}") > 0`
            db.query(sql2, (err, result2) => {
                if (err) {
                    throw err;
                }
                console.log('Selected Transactions '+result);
                result = [...result, ...result2]
                console.log(result);
                data = JSON.stringify(result)
                res.send(data);
            });
        }
    });
})

app.get('/allAdjustments',(req,res)=>{
    let sql = 'SELECT transactions.transactionDate, transactions.debitAccounts, transactions.debitValues,transactions.creditAccounts, transactions.creditValues, adjustments.description, adjustments.transaction_id FROM transactions INNER JOIN adjustments WHERE transactions.id=adjustments.transaction_id';
    db.query(sql,function(err,result,fields){
        if(err){
        console.error("Database error:", err);
        res.status(500).send('Database error'); // Send a HTTP 500 response on error
    } else {
        console.log(result);
        res.json(result); // Send the results as JSON to the client
    }
    })
});

app.post('/saveAllAdjustments',async(req,res)=>{
    const adjustments = req.body.adjustments; // Expecting an array of adjustments
    console.log(adjustments);
    let transactionId=0;

    try {
        // Start database transaction
        await db.beginTransaction();

        for (const adjustment of adjustments) {
            const { date, debitAccount, debitAmount, creditAccount, creditAmount, description } = adjustment;
            let sql = 'INSERT INTO transactions set ?'
            let rec = { transactionDate: date, debitAccounts: debitAccount, debitValues: debitAmount, creditAccounts: creditAccount, creditValues: creditAmount };
            console.log(rec);
            // Insert into transactions table
            db.query(
                sql,rec,function(err,result,fields){
                    if (err) {throw err;}
                    else {transactionId = result.insertId;
                        rec = {transactionDate:date, description:description, transaction_id:transactionId};
                        console.log(rec);
            
                        // Insert into adjustments table
                         db.query(
                            `INSERT INTO adjustments set ?`,rec
                        );
                    }
                });
            

          
        }

        // Commit transaction if all inserts are successful
        await db.commit();

        res.send({ success: true, message: 'All adjustments saved successfully' });
    } catch (error) {
        // Rollback in case of error
        await db.rollback();
        res.status(500).send({ success: false, message: 'Failed to save adjustments', error: error.message });
    }
    
});

app.post('/editAdjustment:id',(req,res)=>{
    let adjustment = req.params.body;
    // let sql = `UPDATE adjustments SET ${adjustment.}  WHERE id=${adjustment.id}`;

})

app.post('/deleteAdjustment',(req,res)=>{
    let _id = req.body.id;
    let sql = `DELETE FROM transactions WHERE id=${_id}`;
    db.query(sql,function(err,result,fields){
        if(err){
        console.error("Database error:", err);
        res.status(500).send('Database error'); // Send a HTTP 500 response on error
    } else {
        console.log("Delete Successfully");
        res.json("Adjustment has been removed");
    }
    })
});