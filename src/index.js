import { MDCDialog } from '@material/dialog';
import { MDCTopAppBar } from '@material/top-app-bar';
import { MDCTextField } from '@material/textfield';
import { NotesAdapter } from './notes-adapter';
import { MDCSnackbar } from '@material/snackbar';
import { MDCMenu } from '@material/menu';
import { MDCList } from '@material/list';
import * as notesData from './notes-data';
import * as auth from './auth';

const appBar = new MDCTopAppBar(document.querySelector('.mdc-top-app-bar'));
const menu = new MDCMenu(document.getElementById('main-menu'));
const menuList = new MDCList(document.getElementById('main-menu-list'));
const notesList = document.getElementById('notes-list');
const addButton = document.getElementById('add-button');
const newKeywordText = new MDCTextField(document.getElementById('new-keyword-text'));
const addKeywordDialog = new MDCDialog(document.getElementById('add-keyword-dialog'));
const acceptButton = document.getElementById('new-keyword-accept');
const deleteNoteConfirmation = new MDCSnackbar(document.getElementById('delete-note-sb'));
const copyConfirmation = new MDCSnackbar(document.getElementById('copied-sb'));
var addKeyWordId = null;
const adapter = new NotesAdapter(notesList, {
    onDeleteNoteClick: deleteNote,
    onRemoveKeyword: notesData.removeKeyword,
    onAddKeywordClick: openAddKeywordDialog,
    onDescriptionSaveClick: notesData.updateDescription,
    onCopyClick: copyToClipboard
});

auth.observeCurrentUser(
    (user) => { loadNotes() },
    () => { window.location.href = "/login.html"; }
);

deleteNoteConfirmation.timeoutMs = 6000;
copyConfirmation.timeoutMs = 4000;

deleteNoteConfirmation.listen('MDCSnackbar:closing', (e) => {
    if(e.detail.reason === "action") {
        notesData.undoDelete();
    }
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
        notesData.addKeyword(addKeyWordId, newKeywordText.value);
    }
});

addKeywordDialog.listen('MDCDialog:closed', (e) => {
    addKeyWordId = null;
    newKeywordText.value = "";
    newKeywordText.valid = true;
});

appBar.listen('MDCTopAppBar:nav', () => {
    menu.open = !menu.open;
});

menuList.listen('MDCList:action', (e) => {
    switch(e.detail.index) {
        case 0: 
            auth.logout();
            break;
    }
});

newKeywordText.root_.querySelector('input').addEventListener('input', (e) => {
    newKeywordText.valid = true;
});

addButton.addEventListener('click', (e) => {
    e.stopPropagation();
    notesData.addNewNote((doc) => {
        var view = adapter.get(doc.id);
        view.root.scrollIntoView();
        view.toggleDescription('edit');
    });
});

function loadNotes() {
    notesData.observe(
        (doc) => { adapter.add(doc) },
        (doc) => { adapter.remove(doc) },
        (doc) => { adapter.update(doc) }
    );
}

function deleteNote(id) {
    notesData.deleteNote(id, (doc) => {
        deleteNoteConfirmation.open();
    });
}

function openAddKeywordDialog(id) {
    addKeywordDialog.open();
    addKeyWordId = id;
}

function copyToClipboard(id) {
    adapter.get(id).copyDescriptionToClipboard();
    copyConfirmation.open();
}
