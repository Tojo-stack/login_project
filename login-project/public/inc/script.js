// Récupération des conteneurs
const registerContainer = document.getElementById('register-container')
const loginContainer= document.getElementById('login-container')

// Switch entre inscription et login
document.getElementById('switch-to-login').addEventListener('click', ()=>{
    registerContainer.style.display = "none"
    loginContainer.style.display = "block"
})

document.getElementById('switch-to-register').addEventListener('click', ()=>{
    loginContainer.style.display="none"
    registerContainer.style.display= "block"
})

// ========== Inscription ========
document.getElementById('register-form').addEventListener('submit',async (e) =>{
    e.preventDefault()

    const email = document.getElementById('register-email').value
    const password = document.getElementById('register-password').value

    const res = await fetch("http://localhost:3000/register",{
        method: "POST",
        headers:{"Content-Type" : "application/json"},
        body:JSON.stringify({email, password})
    })

    const data = await res.json()
    alert(data.message)

    if (res.ok){
        registerContainer.style.display = "none"
        loginContainer.style.display="block"
    }
})

// ========== Connexion ===========
document.getElementById('login-form').addEventListener("submit", async(e)=>{
    e.preventDefault()

    const email = document.getElementById('login-email').value
    const password = document.getElementById('login-password').value
    
    const res = await fetch('http://localhost:3000/login',{
        method: "POST",
        headers:{"Content-Type" : "application/json"},
        body:JSON.stringify({email,password})
    })

    const data = await res.json()
    alert(data.message)

    if(res.ok){
        window.location.href ="/home.html"
    }
})