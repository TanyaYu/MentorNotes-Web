import {MDCTopAppBar} from '@material/top-app-bar';
// import {MDCRipple} from '@material/ripple';

// const selector = '.mdc-button, .mdc-icon-button, .mdc-card__primary-action';
// const ripples = [].map.call(document.querySelectorAll(selector), function(el) {
//   return new MDCRipple(el);
// });
// const iconButtonRipple = new MDCRipple(document.querySelector('.mdc-icon-button'));
// iconButtonRipple.unbounded = false;

const topAppBarElement = document.querySelector('.mdc-top-app-bar');
const topAppBar = new MDCTopAppBar(topAppBarElement);

const notesList = document.querySelector('#notes-list');
var noteTemplate = document.querySelector('#note-template');
var keyTemplate = document.querySelector('#keyword-template');

var db = firebase.firestore();
db.collection('notes').get().then(snapshot => {
    snapshot.docs.forEach(doc => {
        renderNote(doc);
    });
});

function renderNote(doc) {
    console.log(`${doc.id} => ${doc.data().description}`);
    let note = noteTemplate.content.cloneNode(true);
    let card = note.querySelector(".note-card");
    let description = note.querySelector(".note-text");
    let keywords = note.querySelector(".note-keywords-chips");

    card.setAttribute('data-id', doc.id);
    description.textContent = doc.data().description;

    let keywordsData = doc.data().keywords;
    var i = 0;
    for(i = 0; i < keywordsData.length; i++) {
        let keyword = keyTemplate.content.cloneNode(true);
        let keywordText = keyword.querySelector(".mdc-chip__text");
        keywordText.textContent = keywordsData[i];
        keywords.appendChild(keyword);
    }

    let addKeyword = document.createElement('span');
    addKeyword.setAttribute('class', 'mdc-icon-button material-icons keyword-add');
    addKeyword.setAttribute('role', 'button');
    addKeyword.setAttribute('title', 'Add');
    addKeyword.textContent = 'add_circle';
    keywords.appendChild(addKeyword);

    notesList.appendChild(note);
}

