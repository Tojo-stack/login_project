// importation des modules
const express = require('express');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const session = require('express-session')
const PgSession = require('connect-pg-simple')
(session)
const cors = require ('cors')
const path = require('path');
const {Pool} = require ('pg')


const app = express()
const port = 3000


// connexion à PostgreSQL
const pool = new Pool({
    user:'postgres',
    host: 'localhost',
    database: 'login_db',
    password: 'pasdebruit',
    port: 5432,
})

// Middleware pour parser les données du client
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(express.static('public')) //fichiers du dhtml

// configuration des sessions
app.use(session({
    store: new PgSession({pool}), //stockage des sessions dans postgresql
    secret: 'secret00', //clé secrète pour sécuriser les sessions
    resave: false,
    saveUninitialized: false,
    cookie:{maxAge: 1000 * 60 * 60} //1h
}))

//  ---Routes---
// Page d'accueil protégée
app.get('/home', (req, res)=>{
    if (!req.session.userld)return res.redirect('/') //si pas connécté => login
    res.sendFile(path.join(_dirname, 'public/homme.html'))
})

// Deconnexions
app.get('/logout', (req, res) =>{
    req.session.destroy(err => {  //detruit la session
        if (err) return res.send ('Erreur lors de la déconnexion')
            res.redirect('/')
    })
})

// Inscription
app.post('/register', async (req, res) =>{
    const {email, password} = req.body
    try{
        const hashedPassword = await 
        bcrypt.hash(password, 10) //hash le mots de passe
        await pool.query(
            'INSERT INTO users (email,password) VALUES ($1, $2)',
            [email, hashedPassword]
        )
        res.json({message:'Compte crée ! '})
    }catch (err) {
        console.error(err)
        res.status(500).json({message: 'Erreur serveur/ utilisateur existe peut-être'})
    }
})

// Login
app.post('/login', async (req, res)=>{
    const {email, password} = req.body
    try{
        const result = await pool.query('SELECT * FROM users WHERE email = $1',[email])
        if (result.rows.length === 0) 
            return res.status(400).json({message: 'Utilisateur non trouvé'})

        const user = result.rows[0]
        const valid = await bcrypt.compare(password, user.password) //compare le hash
        if(!valid) 
            return res.status(400).json({message: 'Mots de passe incorrect'})

        req.session.userld = user.id //stocke ID dans session
        res.json({message: 'Connexion réussie', redirect: '/home'})
    }catch(err){
        console.error(err)
        res.status(500).json({message: 'Erreur serveur'})
    }
})

// Demarrage du serveur
app.listen(port, () => console.log(`Serveur lancé sur http://localhost:${port}`))