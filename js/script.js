const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const DELETED_EVENT = 'deleted-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
const books = [];

function isStorageExist() {
       if (typeof (Storage) === undefined) {
              alert('Browser kamu tidak mendukung local storage');
              return false;
       }
       return true;
}

document.addEventListener('DOMContentLoaded', function() {
       const submitForm = document.getElementById('inputBook');
       submitForm.addEventListener('submit', function(event) {
              event.preventDefault();
              addBook();
       });

       const searchForm = document.getElementById('searchBook');
       searchForm.addEventListener('submit', function(event) {
              event.preventDefault();
              searchBook();
       })

       if (isStorageExist()) {
              loadDataFromStorage();
       }
});

function generateId() {
       return +new Date();
}

function genereateBookObject(id, title, author, year, isComplete) {
       return {
              id,
              title,
              author,
              year,
              isComplete
       }
}

function addBook() {
       const bookTitle = document.getElementById('title').value;
       const bookAuthor = document.getElementById('author').value;
       const bookYear = document.getElementById('year').value;
       const checkBookIsComplete = document.getElementById('inputBookIsComplete');

       if (checkBookIsComplete.checked) {
              const generatedID = generateId();
              const bookObject = genereateBookObject(generatedID, bookTitle, bookAuthor, bookYear, true);

              books.push(bookObject);
       } else {
              const generatedID = generateId();
              const bookObject = genereateBookObject(generatedID, bookTitle, bookAuthor, bookYear, false);

              books.push(bookObject);
       }
       
       document.dispatchEvent(new Event(RENDER_EVENT));
       saveData();
}

document.addEventListener(RENDER_EVENT, function() {
       const unfinishedBook = document.getElementById('incompleteBookshelfList');
       unfinishedBook.innerHTML = '';

       const finishedBook = document.getElementById('completeBookshelfList');
       finishedBook.innerHTML = '';

       for (const bookItem of books) {
              const bookElement = makeBook(bookItem);
              if (!bookItem.isComplete) {
                     unfinishedBook.append(bookElement);
              } else {
                     finishedBook.append(bookElement);
              }
       }
});

document.addEventListener(DELETED_EVENT, function() {
       const customAlert = document.createElement('div');
       customAlert.classList.add('alert');
       customAlert.innerText = 'Buku Berhasil Dihapus';

       document.body.insertBefore(customAlert, document.body.children[0]);
       setTimeout(() => {
              customAlert.remove();
       }, 2000);
});

function makeBook(bookObject) {
       const bookTitle  = document.createElement('h3');
       bookTitle.innerText = bookObject.title;

       const bookAuthor = document.createElement('p');
       bookAuthor.innerText = `Author : ${bookObject.author}`;

       const bookYear = document.createElement('p');
       bookYear.innerText = `Published : ${bookObject.year}`;

       const textContainer = document.createElement('div');
       textContainer.classList.add('inner');
       textContainer.append(bookTitle, bookAuthor, bookYear);

       const actionContainer = document.createElement('div');
       actionContainer.classList.add('action');

       const container = document.createElement('div');
       container.classList.add('item');
       container.append(textContainer);
       container.setAttribute('id', `book-${bookObject.id}`);

       if (bookObject.isComplete) {
              const undoBtn = document.createElement('button');
              undoBtn.classList.add('undo-button');
              undoBtn.innerHTML = `<i class='bx bx-undo'></i>`;

              undoBtn.addEventListener('click', function() {
                     undoBookFromFinished(bookObject.id);
              });

              const trashBtn = document.createElement('button');
              trashBtn.classList.add('trash-button');
              trashBtn.innerHTML = `<i class='bx bx-trash'></i>`;

              trashBtn.addEventListener('click', function() {
                     removeBookFromFinished(bookObject.id);
              });

              actionContainer.append(undoBtn, trashBtn);
              container.append(actionContainer);
       } else {
              const checkBtn = document.createElement('button');
              checkBtn.classList.add('check-button');
              checkBtn.innerHTML = `<i class='bx bx-check'></i>`;

              checkBtn.addEventListener('click', function() {
                     addBookFinished(bookObject.id);
              });

              const trashBtn = document.createElement('button');
              trashBtn.classList.add('trash-button');
              trashBtn.innerHTML = `<i class='bx bx-trash'></i>`;

              trashBtn.addEventListener('click', function() {
                     removeBookFromFinished(bookObject.id);
              });

              actionContainer.append(checkBtn, trashBtn);
              container.append(actionContainer);
       }

       return container;
}

function addBookFinished(bookId) {
       const bookTarget = findBook(bookId);

       if (bookTarget == null) return;

       bookTarget.isComplete = true;
       document.dispatchEvent(new Event(RENDER_EVENT));
       saveData();
}

function findBook(bookId) {
       for (const bookItem of books) {
              if (bookItem.id === bookId) {
                     return bookItem;
              }
       }
       return null;
}

function undoBookFromFinished(bookId) {
       const bookTarget = findBook(bookId);

       if (bookTarget == null) return;

       bookTarget.isComplete = false;
       document.dispatchEvent(new Event(RENDER_EVENT));
       saveData();
}

function removeBookFromFinished(bookId) {
       const bookTarget = findBookIndex(bookId);

       if (bookTarget === -1) return;

       books.splice(bookTarget, 1);
       document.dispatchEvent(new Event(RENDER_EVENT));
       deleteData();
}

function findBookIndex(bookId) {
       for (const index in books) {
              if (books[index].id === bookId) {
                     return index;
              }
       }

       return -1;
}

function saveData() {
       if (isStorageExist()) {
              const parsed = JSON.stringify(books);
              localStorage.setItem(STORAGE_KEY, parsed);
              document.dispatchEvent(new Event(SAVED_EVENT));
       }
}

function deleteData() {
       if (isStorageExist()) {
              const parsed = JSON.stringify(books);
              localStorage.setItem(STORAGE_KEY, parsed);
              document.dispatchEvent(new Event(DELETED_EVENT));
       }
}

document.addEventListener(SAVED_EVENT, function() {
       console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
       const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

       if (data !== null) {
              for (const book of data) {
                     books.push(book);
              }
       }

       document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBook() {
       const searchInput = document.getElementById('searchBookTitle');
       const filteredCharacters = searchInput.value.toUpperCase();
       const bookItems = document.querySelectorAll('section.book-shelf > .book-list > .item');

       for (let i = 0; i < bookItems.length; i++) {
              txtValue = bookItems[i].textContent || bookItems[i].innerText;
              if (txtValue.toUpperCase().indexOf(filteredCharacters) > -1) {
                     bookItems[i].style.display = "";
              } else {
                     bookItems[i].style.display = "none";
              }
       }
}
