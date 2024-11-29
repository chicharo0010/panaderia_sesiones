const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs'); 
const app = express();

const port = 3000;


app.use(session({
    secret: 'tu_clave_secreta',  
    resave: false,                
    saveUninitialized: true,     
    cookie: { secure: false }    
}));

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'n0m3l0',
    database: 'desesperanza'
});

con.connect((err) => {
    if (err) {
        console.error("Error al conectar", err);
        return;
    }
    console.log("Conectado a la base de datos");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Registro de usuario
app.post('/registrarus', (req, res) => {
    const correo_i = req.body.correo;
    const contra_i = req.body.contra;
    const usuario_i = req.body.usuario;
    const rol_i = req.body.rol; 

    if (!correo_i || !contra_i || !usuario_i || !rol_i) {
        return res.status(400).json({ error: "Todos los campos son requeridos." });
    }

    // Verificar si el correo ya está registrado
    con.query('SELECT * FROM clientes WHERE correo = ?', [correo_i], (err, result) => {
        if (err) {
            console.log("ERROR: ", err);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }

        if (result.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Encriptar la contraseña
        bcrypt.hash(contra_i, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ error: "Error al encriptar la contraseña" });
            }

            // Insertar el nuevo usuario en la base de datos
            const query = 'INSERT INTO clientes (nombre, correo, contraseña, tipo_usuario) VALUES (?, ?, ?, ?)';
            con.query(query, [usuario_i, correo_i, hashedPassword, rol_i], (err, result) => {
                if (err) {
                    console.log("ERROR: ", err);
                    return res.status(500).json({ error: 'Error al registrar el usuario' });
                }

                // Responder con éxito
                res.status(200).json({ success: true });
            });
        });
    });
});

// Iniciar sesión
// Iniciar sesión
app.post('/iniciarsesion', (req, res) => {
    const correo_i = req.body.correo_i;
    const contra_i = req.body.contra_i;

    // Validar si los campos no están vacíos
    if (!correo_i || !contra_i) {
        return res.status(400).json({ error: "Por favor, completa todos los campos." });
    }

    // Buscar al usuario en la base de datos
    con.query('SELECT id_usuario, correo, contraseña, tipo_usuario FROM clientes WHERE correo = ?', [correo_i], (err, respuesta) => {
        if (err) {
            console.log('ERROR: ', err);
            return res.status(500).json({ error: "Error al consultar la base de datos" });
        }

        if (respuesta.length > 0) {
            // Verificar la contraseña encriptada
            bcrypt.compare(contra_i, respuesta[0].contraseña, (err, result) => {
                if (err) {
                    return res.status(500).json({ error: "Error al comparar contraseñas" });
                }

                if (result) {
                    req.session.userId = respuesta[0].id_usuario;
                    req.session.tipo_usuario = respuesta[0].tipo_usuario;

                    // Redirigir dependiendo del tipo de usuario
                    if (respuesta[0].tipo_usuario === 'admin') {
                        res.status(200).json({ message: "Inicio de sesión exitoso", redirectTo: "/admin" });
                    } else {
                        res.status(200).json({ message: "Inicio de sesión exitoso", redirectTo: "/cliente" });
                    }
                } else {
                    res.status(400).json({ error: "Credenciales incorrectas" });
                }
            });
        } else {
            res.status(400).json({ error: "Credenciales incorrectas" });
        }
    });
});


// Cerrar sesión
app.post('/cerrarsesion', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Error al cerrar sesión" });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: "Sesión cerrada correctamente" });
    });
});


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registro.html'));
});

app.get('/admin', (req, res) => {
    if (req.session.userId && req.session.tipo_usuario === 'admin') {
        res.sendFile(path.join(__dirname, 'public', 'crud.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/cliente', (req, res) => {
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, 'public', 'inicio.html'));
    } else {
        res.redirect('/login');
    }
});




// Conectar servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
