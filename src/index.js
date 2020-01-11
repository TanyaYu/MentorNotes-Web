import { MDCDialog } from '@material/dialog';
import { MDCTopAppBar } from '@material/top-app-bar';
import { MDCTextField } from '@material/textfield';
import { NotesAdapter } from './notes_adapter';

const appBar = new MDCTopAppBar(document.querySelector('.mdc-top-app-bar'));
const notesList = document.getElementById('notes-list');
const addButton = document.getElementById('add-button');
const newKeywordText = new MDCTextField(document.getElementById('new-keyword-text'));
const addKeywordDialog = new MDCDialog(document.getElementById('add-keyword-dialog'));
const acceptButton = document.getElementById('new-keyword-accept');
var addKeyWordId = null;
const adapter = new NotesAdapter(notesList, {
    onDeleteNoteClick: deleteNote,
    onRemoveKeyword: removeKeyword,
    onAddKeywordClick: openAddKeywordDialog
});

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
        addKeyword(addKeyWordId, newKeywordText.value);
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
db.collection('notes')
    .orderBy('date_created', "desc")
    .limit(50)
    .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            console.log(change.type, change.doc.data());
            if(change.type === 'added') {
                adapter.add(change.doc);
            }
            if (change.type === 'removed') {
                adapter.remove(change.doc);
            }
            if (change.type === "modified") {
                adapter.update(change.doc);
            }
    });
});

function openAddKeywordDialog(id) {
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

function removeKeyword(id, key) {
    db.collection('notes').doc(id).update({
        keywords: firebase.firestore.FieldValue.arrayRemove(key),
        date_updated: firebase.firestore.FieldValue.serverTimestamp()
    });
}

function addKeyword(id, key) {
    db.collection('notes').doc(id).update({
        keywords: firebase.firestore.FieldValue.arrayUnion(key),
        date_updated: firebase.firestore.FieldValue.serverTimestamp()
    });
}
