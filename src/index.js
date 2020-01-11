import { MDCDialog } from '@material/dialog';
import { MDCIconButtonToggle } from '@material/icon-button';
import { MDCTopAppBar } from '@material/top-app-bar';
import { MDCChipSet } from '@material/chips';
import { MDCTextField } from '@material/textfield';

const appBar = new MDCTopAppBar(document.querySelector('.mdc-top-app-bar'));
const notesList = document.getElementById('notes-list');
const noteTemplate = document.getElementById('note-template');
const keyTemplate = document.getElementById('keyword-template');
const addButton = document.getElementById('add-button');
const newKeywordText = new MDCTextField(document.getElementById('new-keyword-text'));
const addKeywordDialog = new MDCDialog(document.getElementById('add-keyword-dialog'));
const acceptButton = document.getElementById('new-keyword-accept');
var addKeyWordId = null;

addKeywordDialog.listen('MDCDialog:opened', () => {
    addKeywordDialog.layout();
});

acceptButton.addEventListener('click', (e) => {
    if(addKeyWordId) {
        let newValue = newKeywordText.value;
        if(!newValue || newValue === "") {
            newKeywordText.valid = false;
            newKeywordText.focus();
        } else {
            addKeywordDialog.close('accept');
        }
    }
});

addKeywordDialog.listen('MDCDialog:closing', (e) => {
    if(e.detail.action == 'accept') {
        addKeyWord(addKeyWordId, newKeywordText.value);
    }
});

addKeywordDialog.listen('MDCDialog:closed', (e) => {
    addKeyWordId = null;
    newKeywordText.value = "";
    newKeywordText.valid = true;
});

newKeywordText.root_.querySelector('input').addEventListener('input', (e) => {
    newKeywordText.valid = true;
});

addButton.addEventListener('click', (e) => {
    e.stopPropagation();
    addNewNote();
});

var db = firebase.firestore();
db.collection('notes').orderBy('date_created', "desc").limit(50).onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        console.log(change.doc.data());
        if(change.type == 'added'){
            renderNote(change.doc);
        } else if (change.type == 'removed'){
            removeNote(change.doc);
        }
    });
});

function renderNote(doc) {
    let note = noteTemplate.content.cloneNode(true);
    let card = note.querySelector(".note-card");
    let description = note.querySelector(".note-text");
    let keywordsEl = note.querySelector(".note-keywords-chips");
    let editBtn = new MDCIconButtonToggle(note.getElementById('edit-button'));
    let deleteBtn = note.getElementById('delete-button');
    let keywords = new MDCChipSet(keywordsEl);

    card.setAttribute('data-id', doc.id);
    description.textContent = doc.data().description;

    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNote(doc.id);
    });

    keywords.listen('MDCChip:removal', function(e) {
        let key = e.target.querySelector(".mdc-chip__text").textContent;
        removeKeyWord(doc.id, key);
    });

    let keywordsData = doc.data().keywords;
    var i = 0;
    for(i = 0; i < keywordsData.length; i++) {
        let keyword = keyTemplate.content.cloneNode(true);
        let chip = keyword.querySelector(".mdc-chip");
        let keywordText = chip.querySelector(".mdc-chip__text");
        keywordText.textContent = keywordsData[i];
        keywordsEl.appendChild(chip);
        keywords.addChip(chip);
    }

    let addKeyword = document.createElement('span');
    addKeyword.classList.add('mdc-icon-button', 'material-icons', 'keyword-add');
    addKeyword.role = 'button';
    addKeyword.title = 'Add';
    addKeyword.textContent = 'add_circle';
    addKeyword.addEventListener('click', (e) => {
        onAddKeywordClick(doc.id);
    });
    keywordsEl.appendChild(addKeyword);

    notesList.appendChild(note);
}

function removeNote(doc) {
    let card = notesList.querySelector('[data-id=' + doc.id + ']');
    notesList.removeChild(card);
}

function onAddKeywordClick(id) {
    addKeywordDialog.open();
    addKeyWordId = id;
}

function addNewNote() {
    db.collection('notes').add({
        description: 'This is test note',
        keywords: ['test'],
        date_created: firebase.firestore.FieldValue.serverTimestamp()
    });
}

function deleteNote(id) {
    db.collection('notes').doc(id).delete();
}

function removeKeyWord(id, key) {
    db.collection('notes').doc(id).update({
        keywords: firebase.firestore.FieldValue.arrayRemove(key),
        date_updated: firebase.firestore.FieldValue.serverTimestamp()
    });
}

function addKeyWord(id, key) {
    db.collection('notes').doc(id).update({
        keywords: firebase.firestore.FieldValue.arrayUnion(key),
        date_updated: firebase.firestore.FieldValue.serverTimestamp()
    });
}
