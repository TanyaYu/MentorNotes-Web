import { MDCDialog } from '@material/dialog';
import { MDCTopAppBar } from '@material/top-app-bar';
import { MDCTextField } from '@material/textfield';
import { NotesAdapter } from './notes_adapter';
import { MDCSnackbar } from '@material/snackbar';

const appBar = new MDCTopAppBar(document.querySelector('.mdc-top-app-bar'));
const notesList = document.getElementById('notes-list');
const addButton = document.getElementById('add-button');
const newKeywordText = new MDCTextField(document.getElementById('new-keyword-text'));
const addKeywordDialog = new MDCDialog(document.getElementById('add-keyword-dialog'));
const acceptButton = document.getElementById('new-keyword-accept');
const deleteNoteConfirmation = new MDCSnackbar(document.getElementById('delete-note-sb'));
const copyConfirmation = new MDCSnackbar(document.getElementById('copied-sb'));
var addKeyWordId = null;
var tempDeletedDoc = null;
const adapter = new NotesAdapter(notesList, {
    onDeleteNoteClick: deleteNote,
    onRemoveKeyword: removeKeyword,
    onAddKeywordClick: openAddKeywordDialog,
    onDescriptionSaveClick: updateDescription,
    onCopyClick: copyToClipboard
});

deleteNoteConfirmation.timeoutMs = 6000;
copyConfirmation.timeoutMs = 4000;

deleteNoteConfirmation.listen('MDCSnackbar:closing', (e) => {
    console.log(e);
    console.log(tempDeletedDoc);
    if(e.detail.reason === "action" && tempDeletedDoc != null) {
        var doc = tempDeletedDoc;
        db.collection("notes").doc(doc.id).set(doc.data());
    }
    tempDeletedDoc = null;
});

addKeywordDialog.listen('MDCDialog:opened', () => {
    addKeywordDialog.layout();
});

acceptButton.addEventListener('click', (e) => {
    if(addKeyWordId) {
        let newValue = newKeywordText.value;
        if(newValue == null || newValue === "") {
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
            var doc = change.doc;
            var type = change.type;
            if (type === 'added') {
                adapter.add(doc);
            }
            if (type === 'removed') {
                adapter.remove(doc);
            }
            if (type === "modified") {
                adapter.update(doc);
            }
    });
});

function openAddKeywordDialog(id) {
    addKeywordDialog.open();
    addKeyWordId = id;
}

function copyToClipboard(id) {
    adapter.get(id).copyDescriptionToClipboard();
    copyConfirmation.open();
}

function addNewNote() {
    db.collection('notes').add({
        description: '',
        keywords: [],
        date_created: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then((doc) => {
        var view = adapter.get(doc.id);
        view.root.scrollIntoView();
        view.toggleDescription('edit');
    });;
}

function deleteNote(id) {
    db.collection('notes').doc(id)
        .get()
        .then(doc => {
            if (doc.exists) {
                db.collection('notes').doc(id).delete();
                tempDeletedDoc = doc;
                deleteNoteConfirmation.open();
            }
        });
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

function updateDescription(id, newDescripton) {
    db.collection('notes').doc(id).update({
        description: newDescripton,
        date_updated: firebase.firestore.FieldValue.serverTimestamp()
    });
}
