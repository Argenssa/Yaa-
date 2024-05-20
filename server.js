const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('./src/data/userModel');
const axios = require('axios');
const fs = require('fs');

const SpotifyStrategy = require('passport-spotify').Strategy;


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const { QueryTypes, Sequelize} = require('sequelize');
const sequelize = new Sequelize('courseProj', 'postgres', 'SuperSasha2101', {
    host: 'localhost',
    dialect: 'postgres'
});

const getServerIPAddress = () => {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    let ipAddress = '';
    for (const key in interfaces) {
        for (const interface of interfaces[key]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                ipAddress = interface.address;
                break;
            }
        }
        if (ipAddress) break;
    }
    return ipAddress;
};

const serverIPAddress = getServerIPAddress();
console.log(serverIPAddress);
fs.writeFileSync('config.json', JSON.stringify({}));
const configData = {
    serverIP: serverIPAddress
};
fs.writeFileSync('config.json', JSON.stringify(configData, null, 4))

app.get('/register', async (req, res) => {
    res.send(getServerIPAddress());
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.create({ username, password });
        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ error: 'Username already exists' });
        } else {
            console.error('Error registering user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username, password } });
        if (user) {
            res.status(200).json({ message: 'Login successful', user });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/',async  (req, res) =>{
    res.send(`
        <div>
            <form action="/loginAdmin" method="post">
                <input type="text" placeholder="username" name="username"/></br>
                <input type="password" placeholder="password" name="password"/></br>
                <button type="submit">Authorize</button>
            </form>
        </div>
    `)
})


app.post('/loginAdmin', async (req, res) => {
    const { username, password } = req.body;
    console.log(username,password);
    try {
        const user = await User.findOne({ where: { username:"AdminSasha", password:password } });
        if (user) {
            res.redirect("/admin-panel")
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/admin-panel", async (req,res)=>{
    res.send(`
        <div>
            <form action="/add_song" method="post">
                <input type="text" placeholder="track name" name="name"></br>
                <input type="text" placeholder="author" name="author"></br>
                <input type="text" placeholder="genre" name="genre"></br>
                <input type="text" placeholder="image file" name="img"></br>
                <input type="text" placeholder="track file" name="track"></br>
                <button type="submit">Add song</button>
            </form>
             <form action="/delete_song" method="post">
                <input type="text" placeholder="track ID" name="id"></br>
                <button type="submit">Delete song</button>
            </form>
             <form action="/create_compilation" method="post">
                <input type="text" placeholder="compilation name" name="name"></br>
                <input type="text" placeholder="genre" name="genre"></br>
                <input type="number" placeholder="number of tracks" name="count"></br>
                <button type="submit">Create compilation</button>
            </form>
        </div>
    `)
})
app.post("/add_song", async (req, res) => {
    const { name, author, genre, img, track } = req.body;

    // Чтение содержимого файла track.json
    let tracks = [];
    const data = fs.readFileSync('track.json', 'utf8');
    let idData;
    try {
        tracks = JSON.parse(data);
        idData = fs.readFileSync('id.json', 'utf8');
    } catch (err) {
        console.error('Error reading track.json or id.json:', err);
        res.status(500).send('Error reading files');
        return;
    }

    let newId;
    try {
        const { id } = JSON.parse(idData);
        console.log("1",id)
        newId = Number(id) + 1;
    } catch (error) {
        console.error('Error parsing id:', error);
        res.status(500).send('Error parsing id');
        return;
    }

    // Добавление нового трека в массив
    const authorsArray = author.split(',').map(author => author.trim()); // Разделение авторов и создание массива
    const newTrack = { id: newId, name, author: authorsArray, genre, img, track };
    tracks.push(newTrack);

    // Запись обновленного массива и id в соответствующие файлы
    try {
        console.log("2",newId)
        await fs.promises.writeFile('id.json', JSON.stringify({ id: newId }));
        await fs.promises.writeFile('track.json', JSON.stringify(tracks, null, 4));
        console.log('Track added successfully');
        res.status(200).send('Track added successfully');
    } catch (error) {
        console.error('Error writing files:', error);
        res.status(500).send('Error writing files');
    }
});

app.post('/delete_song', async (req, res) => {
    const { id } = req.body;

    // Чтение содержимого файла track.json
    let tracks = [];
    const data = fs.readFileSync('track.json', 'utf8');
    try {
        tracks = JSON.parse(data);
    } catch (err) {
        console.error('Error reading track.json:', err);
        res.status(500).send('Error reading tracks');
        return;
    }

    const trackExists = tracks.some(track => track.id == id);
    if (!trackExists) {
        res.status(404).send('Track with the specified ID does not exist');
        return;
    }
    // Удаление трека из массива
    const updatedTracks = tracks.filter(track => track.id != id);

    // Запись обновленного массива в файл track.json
    try {
        await fs.promises.writeFile('track.json', JSON.stringify(updatedTracks, null, 4));
        console.log('Track deleted successfully');
        res.status(200).send('Track deleted successfully');
    } catch (error) {
        console.error('Error writing track.json:', error);
        res.status(500).send('Error writing tracks');
    }
});


app.post('/create_compilation', async (req, res) => {
    const { name, genre, count } = req.body;
    const numberOfTracks = parseInt(count, 10);

    let tracks = [];
    try {
        const data = fs.readFileSync('track.json', 'utf8');
        tracks = JSON.parse(data);
    } catch (err) {
        console.error('Error reading track.json:', err);
        res.status(500).send('Error reading tracks');
        return;
    }

    const genreTracks = tracks.filter(track => track.genre === genre);
    const selectedTracks = genreTracks.sort(() => 0.5 - Math.random()).slice(0, numberOfTracks);
    const compilation = {
        name,
        genre,
        tracks: selectedTracks.map(track => track.id)
    };

    let compilations = [];
    try {
        const compilationData = fs.readFileSync('compilation.json', 'utf8');
        compilations = JSON.parse(compilationData);
    } catch (err) {
        console.log('Creating new compilation file');
    }

    compilations.push(compilation);

    try {
        await fs.promises.writeFile('compilation.json', JSON.stringify(compilations, null, 4));
        console.log('Compilation created successfully');
        res.status(200).send('Compilation created successfully');
    } catch (error) {
        console.error('Error writing compilation.json:', error);
        res.status(500).send('Error writing compilation');
    }
});

// Маршрут для получения треков от Jamendo API
app.get('/tracks', async (req, res) => {
    try {
        // Чтение содержимого файла track.json
        const data = fs.readFileSync('track.json', 'utf8');
        const tracks = JSON.parse(data);

        // Преобразование формата данных для соответствия ожидаемому формату на клиенте
        const formattedTracks = tracks.map(track => ({
            id: track.id,
            name: track.name,
            artist_name: track.author.join(', '), // Объединяем имена авторов через запятую
            image: track.img,
            audio: track.track
        }));

        // Отправка треков клиенту
        res.json(formattedTracks);
    } catch (error) {
        console.error('Error reading track.json:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/complitations', (req, res) => {
    fs.readFile('compilation.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading compilation.json:', err);
            res.status(500).send('Error reading complitation file');
            return;
        }
        try {
            const complitations = JSON.parse(data);
            res.json(complitations);
        } catch (error) {
            console.error('Error parsing complitation.json:', error);
            res.status(500).send('Error parsing complitation file');
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
