const book = require('./books')
const { nanoid } = require('nanoid')

const addBookHandler = (req, h) => {
    const { name, year, author, summary, publisher, pageCount, readPage, reading } = req.payload
    const id = nanoid(14)
    const insertedAt = new Date().toISOString()
    const updatedAt = insertedAt
    const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished: pageCount === readPage ? true : false,
        insertedAt,
        updatedAt,
        reading
    }
    const failResponse = {
        status: 'fail',
    }
    const successResponse = h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
            bookId: id
        }
    })
    successResponse.code(201)
    if (name == "" || name == undefined) {
        failResponse.message = 'Gagal menambahkan buku. Mohon isi nama buku'
        const response = h.response(failResponse)
        response.code(400)
        return response
    } else if (readPage > pageCount) {
        failResponse.message = "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount"
        const response = h.response(failResponse)
        response.code(400)
        return response
    } else {
        book.push(newBook)
        const isSuccess = book.filter(book => book.id === id).length > 0
        return isSuccess && successResponse
    }
    failResponse.status = "error",
        failResponse.message = "Buku Gagal ditambahkan"
    const response = h.response(failResponse)
    response.code(500)
    return response
}
const getAllBookHandler = (req, h) => {
    const { reading, finished, name } = req.query
    const successResponse = {
        status: 'success',
        data: {
            books: []
        }
    }
    if (book.length) {
        let convertedBook = book
        if (reading != undefined) {
            convertedBook = reading == 0 ? convertedBook.filter(book => book.reading == false) : convertedBook.filter(book => book.reading == true)
        }
        if (finished != undefined) {
            convertedBook = finished == 0 ? book.filter(book => book.finished == false) : book.filter(book => book.finished == true)
        }
        if (name != undefined) {
            convertedBook = book.filter(book => book.name.toLowerCase().includes(name.toLowerCase()))
        }
        convertedBook = convertedBook.map(book => { return { id: book.id, name: book.name, publisher: book.publisher } })
        successResponse.data.books = convertedBook
    } else {
        successResponse.data.books = []
    }
    const response = h.response(successResponse)
    response.code(200)
    return response
}
const getBookByIdHandler = (req, h) => {
    const { bookId } = req.params
    const filteredBook = book.filter(book => book.id == bookId)
    let response = {}
    if (filteredBook.length > 0) {
        response.status = "success",
            response.data = {
                book: filteredBook[0]
            }
    } else {
        response.status = "fail",
            response.message = "Buku tidak ditemukan"
    }
    response = h.response(response)
    filteredBook.length > 0 ? response.code(200) : response.code(404)
    return response
}
const updateBookByIdHandler = (req, h) => {
    const { bookId } = req.params
    const filtered = book.filter(book => book.id == bookId)
    let response = {
        status: 'fail'
    }
    if (filtered.length) {
        const { name, year, author, summary, publisher, pageCount, readPage, reading } = req.payload
        if (name == "" || name == undefined || readPage > pageCount) {
            if (name == "" || name == undefined) {
                response.message = "Gagal memperbarui buku. Mohon isi nama buku"
            } else {
                response.message = "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount"
            }
            response = h.response(response)
            response.code(400)
            return response
        } else {
            const index = book.findIndex(book => book == filtered[0])
            if (index !== -1) {
                book[index] = {
                    ...book[index],
                    name,
                    year,
                    author,
                    summary,
                    publisher,
                    pageCount,
                    readPage,
                    reading,
                    updatedAt: new Date().toISOString()
                }
            }
            response.status = "success"
            response.message = "Buku berhasil diperbarui"
            response = h.response(response)
            response.code(200)
            return response
        }
    } else {
        response.message = "Gagal memperbarui buku. Id tidak ditemukan"
        response = h.response(response)
        response.code(404)
        return response
    }
}
const deleteBookByIdHandler = (req, h) => {
    const { bookId } = req.params
    const filteredBook = book.filter(book => book.id == bookId)
    let response = {
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan'
    }
    if (filteredBook.length) {
        const index = book.findIndex(book => book == filteredBook[0])
        if (index != -1) {
            book.splice(index, 1)
            response.status = 'success',
                response.message = 'Buku berhasil dihapus'
            response = h.response(response)
            response.code(200)
            return response
        }
    } else {
        response = h.response(response)
        response.code(404)
        return response
    }
}

module.exports = { addBookHandler, getAllBookHandler, getBookByIdHandler, updateBookByIdHandler, deleteBookByIdHandler }