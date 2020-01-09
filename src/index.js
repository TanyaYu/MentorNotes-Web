import {MDCTopAppBar} from '@material/top-app-bar';
import {MDCRipple} from '@material/ripple';

const selector = '.mdc-button, .mdc-icon-button, .mdc-card__primary-action';
const ripples = [].map.call(document.querySelectorAll(selector), function(el) {
  return new MDCRipple(el);
});

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
    var note = noteTemplate.content.cloneNode(true);
    var card = note.querySelector(".note-card");
    var description = note.querySelector(".note-text");
    var card = note.querySelector(".note-card");
    var keywords = note.querySelector(".note-keywords-chips");

    card.setAttribute('data-id', doc.id);
    description.textContent = doc.data().description;

    var keywordsData = doc.data().keywords;
    var i = 0;
    for(i = 0; i < keywordsData.length; i++) {
        var keyword = keyTemplate.content.cloneNode(true);
        var keywordText = keyword.querySelector(".mdc-chip__text");
        keywordText.textContent = keywordsData[i];
        keywords.appendChild(keyword);
    }

    notesList.appendChild(note);
}

