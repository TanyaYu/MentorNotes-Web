import {MDCDialog} from '@material/dialog';

const notesList = document.querySelector('#notes-list');
const noteTemplate = document.querySelector('#note-template');
const keyTemplate = document.querySelector('#keyword-template');
const addButton = document.querySelector('#add-button');
const addKeywordDialog = new MDCDialog(document.querySelector('#add-keyword-dialog'));

addKeywordDialog.listen('MDCDialog:opened', () => {
  
});
addButton.onclick = onAddClick

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
    addKeyword.onclick = onAddKeywordClick;
    keywords.appendChild(addKeyword);

    notesList.appendChild(note);
}

function onAddKeywordClick() {
    addKeywordDialog.open();
}

function onAddClick() {

}

