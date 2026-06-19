const { app } = require('./index')

const PORT = process.env.PORT || 3005

app.listen(PORT, () => {
    console.log(`Fake Arduino Camera Service at http://localhost:${PORT}`)
    console.log(`- Latest stats: http://localhost:${PORT}/camera/latest`)
    console.log(`- Latest image: http://localhost:${PORT}/camera/image`)
})
