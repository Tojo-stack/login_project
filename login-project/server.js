// importation des modules
const express = require('express');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const session = require('express-session')
const PgSession = require('connect-pg-simple')
(session)
const cors = require ('cors')
const path = require('path');
const { password } = require('pg/lib/defaults');


const app = express()
const port = 3000


// connexion à PostgreSQL
const {Pool} = require('pg')
require ('dotenv').config()
console.log('Mots de passe:', process.env.DB_PASSWORD)

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
})

// Middleware pour parser les données du client
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(express.static('public')) //fichiers du dhtml

// configuration des sessions
app.use(session({

    //stockage des sessions dans postgresql
    store: new PgSession({pool}), 

    //clé secrète pour signer les cookies
    secret: "unSecretTresSolide123", 
    resave: false,
    saveUninitialized: true,
    cookie:{secure: false}
}))

//  ---Routes LOGIN/REGISTER---

// Page HOME protégée
app.get('/home', (req, res)=>{

    //si pas connécté => login
    if (!req.session.user)return res.redirect('/') 
    res.sendFile(path.join(__dirname, 'public/home.html'))
})


// Déconnexions
app.get('/logout', (req, res) =>{

    //detruit la session
    req.session.destroy(err => {  
        if (err) {
            console.error(err)
            return res.status(500).send("Erreur lors de la déconnexion")
        }
        res.redirect("/")
    })
})

// Inscription
app.post('/register', async (req, res) =>{
    const {email, password} = req.body
    try{

        // Vérifie si l'utilisateur existe déjà
        const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [email])
        if(checkUser.rows.length > 0){
            return res.status(400).send("utilisateur existe déjà")
        }

        // ajoute l'utilisateur et hash le mot de passe
        // hashage avant insertion
        const hashedPassword = await bcrypt.hash(password, 10) 
        await pool.query(
            'INSERT INTO users (email,password) VALUES ($1, $2)',
            [email, hashedPassword]
        )
        console.log("Nouvel utilisateur enrgistré: ", email)

        // rediriger vers la page de connexion
        res.json({message: 'Inscription réussie'});
    }catch (err) {
        console.error(err)
        res.status(500).json({message: 'Erreur serveur/ utilisateur existe peut-être'})
    }
    console.log("requête inscription reçue: ", email, password)
})

// Login
app.post('/login', async (req, res)=>{
    const {email, password} = req.body
    try{
        const result = await pool.query('SELECT * FROM users WHERE email = $1',[email])
        if (result.rows.length === 0) 
            return res.status(400).send({message: 'Utilisateur non trouvé'})

        const user = result.rows[0]
        const valid = await bcrypt.compare(password, user.password) //compare le hash
        if(!valid) 
            return res.status(400).send({message: 'Mots de passe incorrect'})

        // sauvegarder la session utilisateur
        req.session.user ={id: user.id, email: user.email}//stocke ID dans session
        res.json({message: 'Connexion réussie', redirect: '/home.html'})
    }catch(err){
        console.error(err)
        res.status(500).send({message: 'Erreur serveur'})
    }
})

//  ---Routes tache---
    // Afficher toutes les tâches de l'utilisateur connecté
    
    app.get('/todos', async (req, res) =>{
        console.log('Session actuelle: ', req.session)
        if (!req.session.user){
            console.log('Utilisateur non connecté')
            return res.status(401).json({message: 'Non connecté'})
        }
        const {userId} = req.session.user.id
        try{
            const result = await pool.query('SELECT * FROM todos WHERE user_id=$1',[userId])
            res.json(result.rows)
        }catch(err){
            console.error(err)
            res.status(500).send('Erreur serveur')
        }
    })
    

    // Ajouter une tâche
    app.post('/todos', async(req, res)=>{
        if (!req.session.user)
            return res.redirect('/')
        const userId = req.session.user.id
        const { task } = req.body
        try{
            await pool.query('INSERT INTO todos (user_id, task) VALUES ($1, $2)', [userId, task])
            res.redirect('/home')
        } catch (err) {
            console.error(err)
            res.status(500).send('Erreur serveur')
        }
    })

    //Marquer une tâche comme faite
    app.post('/todos/:id/done', async (req, res) => {
        const{id} = req.params
        try{
            await pool.query('UPTDATE todos SET done = true WHERE id=$1', [id])
            res.redirect('/home')
        }catch(err){
            console.error(err)
            res.status(500).send('Erreur serveur')
        }
    }) 

    // Supprimer une tache
    app.post('/todos/:id/delete', async (req, res) => {
        const  { id } = req.params
        try{
            await pool.query('DELETE FROM todos WHERE id = $1', [id])
            res.redirect('/home')
        }catch(err){
            console.error(err);
            res.status(500).send('Erreur serveur');
        }
    })


// Demarrage du serveur
app.listen(port, () => console.log(`Serveur lancé sur http://localhost:${port}`))