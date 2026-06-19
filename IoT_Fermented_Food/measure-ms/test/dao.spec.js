const mongoose = require('mongoose')

const mockModel = () => {
    const m = jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({})
    }))
    m.find = jest.fn().mockReturnThis()
    m.sort = jest.fn().mockReturnThis()
    m.limit = jest.fn().mockResolvedValue([])
    return m
}

jest.mock('mongoose', () => ({
    connect: jest.fn().mockReturnValue({
        catch: jest.fn()
    }),
    connection: {
        once: jest.fn(),
        on: jest.fn()
    }
}))

jest.mock('../src/database/models/humidity.model', () => {
    const m = jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({})
    }))
    m.find = jest.fn().mockReturnThis()
    m.sort = jest.fn().mockReturnThis()
    m.limit = jest.fn().mockResolvedValue([])
    return m
})
jest.mock('../src/database/models/light.model', () => {
    const m = jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({})
    }))
    m.find = jest.fn().mockReturnThis()
    m.sort = jest.fn().mockReturnThis()
    m.limit = jest.fn().mockResolvedValue([])
    return m
})
jest.mock('../src/database/models/temperature.model', () => {
    const m = jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({})
    }))
    m.find = jest.fn().mockReturnThis()
    m.sort = jest.fn().mockReturnThis()
    m.limit = jest.fn().mockResolvedValue([])
    return m
})
jest.mock('../src/database/models/picture.model', () => {
    const m = jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({})
    }))
    m.find = jest.fn().mockReturnThis()
    m.sort = jest.fn().mockReturnThis()
    m.limit = jest.fn().mockResolvedValue([])
    return m
})

const Humidity = require('../src/database/models/humidity.model')
const Light = require('../src/database/models/light.model')
const Temperature = require('../src/database/models/temperature.model')
const PictureModel = require('../src/database/models/picture.model')
const MongoDB = require('../src/database/dao')

describe('MongoDB DAO', () => {
    let dao

    beforeEach(() => {
        jest.clearAllMocks()
        dao = new MongoDB()
    })

    it('should connect to MongoDB', () => {
        dao.connect()
        expect(mongoose.connect).toHaveBeenCalled()
    })

    it('should log error when connect fails', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
        mongoose.connect.mockImplementationOnce(() => Promise.reject('ConnError'))
        dao.connect()
        await new Promise(resolve => setImmediate(resolve))
        expect(consoleSpy).toHaveBeenCalledWith('ConnError')
        consoleSpy.mockRestore()
    })

    it('should save humidity', async () => {
        const doc = { val: 50 }
        await dao.saveHumidity(doc)
        expect(Humidity).toHaveBeenCalledWith(doc)
    })

    it('should save light', async () => {
        const doc = { val: 100 }
        await dao.saveLight(doc)
        expect(Light).toHaveBeenCalledWith(doc)
    })

    it('should save temperature', async () => {
        const doc = { val: 25 }
        await dao.saveTemperature(doc)
        expect(Temperature).toHaveBeenCalledWith(doc)
    })

    it('should save picture', async () => {
        const doc = { url: 'abc' }
        await dao.savePicture(doc)
        expect(PictureModel).toHaveBeenCalledWith(doc)
    })

    it('should find humidity with limit', async () => {
        await dao.findHumidity({}, 10)
        expect(Humidity.limit).toHaveBeenCalledWith(10)
    })

    it('should find light with limit', async () => {
        await dao.findLight({}, 10)
        expect(Light.limit).toHaveBeenCalledWith(10)
    })

    it('should find temperature with limit', async () => {
        await dao.findTemperature({}, 10)
        expect(Temperature.limit).toHaveBeenCalledWith(10)
    })

    it('should find pictures with limit', async () => {
        await dao.findPictures({}, 10)
        expect(PictureModel.limit).toHaveBeenCalledWith(10)
    })

    it('should find humidity without limit', async () => {
        await dao.findHumidity({})
        expect(Humidity.find).toHaveBeenCalled()
        expect(Humidity.limit).not.toHaveBeenCalled()
    })

    it('should find light without limit', async () => {
        await dao.findLight({})
        expect(Light.find).toHaveBeenCalled()
        expect(Light.limit).not.toHaveBeenCalled()
    })

    it('should find temperature without limit', async () => {
        await dao.findTemperature({})
        expect(Temperature.find).toHaveBeenCalled()
        expect(Temperature.limit).not.toHaveBeenCalled()
    })

    it('should find pictures without limit', async () => {
        await dao.findPictures({})
        expect(PictureModel.find).toHaveBeenCalled()
        expect(PictureModel.limit).not.toHaveBeenCalled()
    })
})
