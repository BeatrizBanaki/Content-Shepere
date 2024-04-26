const express = require('express');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();
const app = express();
const PORT = 3000;

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

// Middleware para verificar se o usuário está autenticado
function checkAuth(req, res, next) {
    if (!req.session.authenticated) {
        return res.redirect('/login');
    }
    next();
}

// Rota para a página inicial
app.get('/', (req, res) => {
    // Verifica se o usuário está autenticado
    if (req.session.authenticated) {
        // Lista todas as páginas criadas
        fs.readdir('pages', (err, files) => {
            if (err) throw err;
            const pages = files.map(file => path.parse(file).name);
            res.render('views_index', { pages });
        });
    } else {
        res.redirect('/login');
    }
});

// Rota para a página de login
app.get('/login', (req, res) => {
    res.render('views_login');
});

// Rota para processar o login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.USERNAME && password === process.env.PASSWORD) {
        req.session.authenticated = true;
        res.redirect('/');
    } else {
        res.send('Credenciais inválidas');
    }
});

// Rota para fazer logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Middleware para verificação de autenticação em rotas protegidas
app.use(checkAuth);

// Rota para criar uma nova página
app.get('/create_page', (req, res) => {
    res.render('views_create_page');
});

app.post('/create_page', (req, res) => {
    const { url, content } = req.body;
    fs.writeFile(`pages/${url}.txt`, content, err => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Inicializa o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
