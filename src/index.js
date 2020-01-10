import { MDCDialog } from '@material/dialog';
import { MDCIconButtonToggle } from '@material/icon-button';
import { MDCTopAppBar } from '@material/top-app-bar';
import { MDCChipSet } from '@material/chips';

const appBar = new MDCTopAppBar(document.querySelector('.mdc-top-app-bar'));
const notesList = document.getElementById('notes-list');
const noteTemplate = document.getElementById('note-template');
const keyTemplate = document.getElementById('keyword-template');
const addButton = document.getElementById('add-button');
const addKeywordDialog = new MDCDialog(document.getElementById('add-keyword-dialog'));

addKeywordDialog.listen('MDCDialog:opened', () => {
  
});

addButton.addEventListener('click', (e) => {
    e.stopPropagation();
    addNewNote();
});

var db = firebase.firestore();
db.collection('notes').onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        console.log(change.doc.data());
        if(change.type == 'added'){
            renderNote(change.doc);
        } else if (change.type == 'removed'){
            unrenderNote(change.doc);
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
        let id = e.target.closest('.note-card').getAttribute('data-id');
        deleteNote(id);
    });

    keywords.listen('MDCChip:removal', function(event) {
        keywordsEl.removeChild(event.detail.root);
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
    addKeyword.onclick = onAddKeywordClick;
    keywordsEl.appendChild(addKeyword);

    notesList.appendChild(note);
}

function unrenderNote(doc) {
    let card = notesList.querySelector('[data-id=' + doc.id + ']');
    notesList.removeChild(card);
}

function onAddKeywordClick() {
    addKeywordDialog.open();
}

function addNewNote() {
    db.collection('notes').add({
        description: 'This is test note',
        keywords: ['test'],
        date_created: new Date()
    });
}

function deleteNote(id) {
    db.collection('notes').doc(id).delete();
}
