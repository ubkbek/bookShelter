// get element from DOM --------------------------------------------------------------
let elForm = document.querySelector("#form")
let elSearchInput = document.querySelector("#search-input")
let elShowNotFound = document.querySelector("#show-notFound")
let elWrapperCards = document.querySelector("#books_wrapper")
let elWrapperBookmarks = document.querySelector("#bookmarks_wrapper")

let elTemplateBookCard = document.querySelector("#bookCardTemplate").content
let elTemplateBookmark = document.querySelector("#bookmarkTemplate").content




// get data from API ----------------------------------------------------------------
elForm.addEventListener("input", (evt) => {
    evt.preventDefault()

    let inputValue = elSearchInput.value.trim().toString()

        ; (async function () {
            let responce = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${inputValue}`)
            let result = await responce.json()
            let data = result.items

            if(data == null) elShowNotFound.textContent = "Not found"

            renderBooks(data, elWrapperCards)
        })();
})




// Render books ---------------------------------------------------------------------
function renderBooks(array, place) {
    place.innerHTML = null

    let elFragment = document.createDocumentFragment()

    array.forEach(item => {
        let bookCard = elTemplateBookCard.cloneNode(true)

        bookCard.querySelector("#book_img").src = item.volumeInfo.imageLinks.smallThumbnail;
        bookCard.querySelector("#book_title").textContent = item.volumeInfo.title;
        bookCard.querySelector("#book_year").textContent = item.volumeInfo.authors.join(",");
        bookCard.querySelector("#book_author").textContent = item.volumeInfo.publishedDate.slice(0, 4)
        bookCard.querySelector("#book_read-btn").href = item.volumeInfo.previewLink
        bookCard.querySelector("#bookmark_btn").dataset.bookmarkBtnId = item.id
        bookCard.querySelector("#more_info_btn").dataset.moreInfoBtnId = item.id

        elFragment.appendChild(bookCard)
    });
    place.appendChild(elFragment)
}




// render bookmarks
function renderBookmarks(array, place) {
    place.innerHTML = null


    let elFragment = document.createDocumentFragment()

    array.forEach(item => {
        cardBookmark = elTemplateBookmark.cloneNode(true)

        cardBookmark.querySelector("#bookmark_title").textContent = item.volumeInfo.title
        cardBookmark.querySelector("#bookmark_author").textContent = item.volumeInfo.authors
        cardBookmark.querySelector("#bookmark-read-link").href = item.volumeInfo.previewLink
        cardBookmark.querySelector("#del-img").dataset.bookmarkDelImg = item.id

        elFragment.appendChild(cardBookmark)
    });

    place.appendChild(elFragment)
}




// listen to elWrapperCards ---------------------------------------------------------
elWrapperCards.addEventListener("click", (evt) => {
    let moreInfoId = evt.target.dataset.moreInfoBtnId;

    if (moreInfoId) {
        ; (async function () {
            let responce = await fetch(`https://www.googleapis.com/books/v1/volumes/${moreInfoId}`)
            let result = await responce.json()
            let data = result.volumeInfo

            document.querySelector(".modal_book-title").textContent = data.title
            document.querySelector("#modal_book-img").src = data.imageLinks.thumbnail
            document.querySelector("#modal_book-info").textContent = data.description
            document.querySelector("#modal_book-author").textContent = data.authors
            document.querySelector("#modal_book-authors").textContent = data.authors.length
            document.querySelector("#modal_book-year").textContent = data.publishedDate.slice(0, 4)
            document.querySelector("#modal_book-publishers").textContent = data.publisher
            document.querySelector("#modal_book-categories").textContent = data.categories
            document.querySelector("#modal_book-pages-count").textContent = data.printedPageCount
            document.querySelector("#modal_read-btn").href = data.previewLink
        })();
    }
})


let storage = window.localStorage;

let bookmarkArray = JSON.parse(storage.getItem("bookmarkArray")) || []

renderBookmarks(bookmarkArray, elWrapperBookmarks)




// Create Bookmarks ---------------------------------------------------------------
elWrapperCards.addEventListener("click", (evt) => {
    let bookmarkId = evt.target.dataset.bookmarkBtnId;

    if (bookmarkId) {
        ; (async function () {
            let responce = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookmarkId}`)
            let data = await responce.json()

            let doesInclude = true

            bookmarkArray.forEach(item => {
                if (item.id === bookmarkId) {
                    doesInclude = false
                }
            })

            if (doesInclude) {
                bookmarkArray.push(data)
                localStorage.setItem("bookmarkArray", JSON.stringify(bookmarkArray))
                renderBookmarks(bookmarkArray, elWrapperBookmarks)
            }
        })();
    }
})



// remove bookmarks
elWrapperBookmarks.addEventListener("click", function (evt) {

    let idCard = evt.target.dataset.bookmarkDelImg

    indexOfMovie = bookmarkArray.findIndex(function (item) {
        return item.id == idCard
    })

    bookmarkArray.splice(indexOfMovie, 1)

    localStorage.setItem("bookmarkArray", JSON.stringify(bookmarkArray))
    renderBookmarks(bookmarkArray, elWrapperBookmarks)
})
